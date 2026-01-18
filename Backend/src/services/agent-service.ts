// services/agent-service.ts
import { generateText, generateObject } from "ai";
import type { CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { orderTools, billingTools, supportTools } from "./agent-tools"; // Assuming these exist
import dotenv from "dotenv";

dotenv.config();

// Custom Error Class for specific handling in Controller
export class GeminiRateLimitError extends Error {
	public retryAfterSeconds: number;
	public limitType: string;

	constructor(message: string, retryAfterSeconds: number, limitType: string) {
		super(message);
		this.name = "GeminiRateLimitError";
		this.retryAfterSeconds = retryAfterSeconds;
		this.limitType = limitType;
	}
}

export type AgentType = "support" | "order" | "billing" | "router";

// ... (RouterResult and AgentResponse interfaces remain the same) ...
export interface RouterResult {
	type: "route" | "clarify";
	agentType?: AgentType;
	reasoning: string;
	content?: string;
	tokensUsed?: number;
}

export interface AgentResponse {
	content: string;
	agentType: AgentType;
	reasoning: string;
	tokensUsed: number;
}

const routerSchema = z.object({
	type: z.enum(["route", "clarify"]),
	agentType: z.enum(["support", "order", "billing"]).optional(),
	reasoning: z.string(),
	content: z.string().optional(),
});

const model = google("gemini-flash-latest");

export class agentService {
	// --- ERROR HANDLING HELPER ---
	private static handleGeminiError(err: any): never {
		const errorMessage = err?.message || JSON.stringify(err);

		// Check for 429 or specific Quota messages
		if (
			errorMessage.includes("429") ||
			errorMessage.toLowerCase().includes("quota") ||
			errorMessage.toLowerCase().includes("resource has been exhausted")
		) {
			let retryAfter = 60; // Default: 1 minute for RPM limits
			let limitType = "RPM";

			if (
				errorMessage.includes("per day") ||
				errorMessage.includes("Day")
			) {
				retryAfter = 60 * 60 * 24; // 24 hours
				limitType = "RPD";
			}

			console.warn(
				`[Gemini API] Quota Hit: ${limitType}. Reset in ${retryAfter}s.`,
			);

			throw new GeminiRateLimitError(
				"Gemini API Quota Exceeded. Please try again later.",
				retryAfter,
				limitType,
			);
		}

		// Re-throw unknown errors
		throw err;
	}

	static async processMessage(
		userId: string,
		message: string,
		conversationHistory: any[],
	): Promise<AgentResponse> {
		// ... (Casting logic same as before) ...
		const history: CoreMessage[] = conversationHistory.map((msg) => ({
			role: msg.role === "user" ? "user" : "assistant",
			content: msg.content,
		})) as CoreMessage[];

		// Wrap logic in try/catch to intercept Gemini errors
		try {
			const routing = await this.routeQuery(message, history);

			if (routing.type === "clarify") {
				return {
					content:
						routing.content ??
						"Could you please provide more details?",
					agentType: "router",
					reasoning: routing.reasoning,
					tokensUsed: routing.tokensUsed ?? 0,
				};
			}

			const agentResult = await this.processWithAgent(
				routing.agentType!,
				message,
				history,
			);

			return {
				content: agentResult.content,
				agentType: agentResult.agentType,
				reasoning: `${routing.reasoning} → ${agentResult.reasoning}`,
				tokensUsed:
					(routing.tokensUsed ?? 0) + (agentResult.tokensUsed ?? 0),
			};
		} catch (error) {
			// Pass to our handler
			this.handleGeminiError(error);
		}
	}

	static async routeQuery(
		message: string,
		history: CoreMessage[],
	): Promise<RouterResult> {
		const systemPrompt = `
          You are a Router Agent. Analyze the conversation and decide the user's intent.
          Routing Rules:
          - "order": order status, tracking, or delivery.
          - "billing": invoices, payments, refunds.
          - "support": general questions, technical help.
          If unclear, choose "clarify".
        `;

		try {
			const { object, usage } = await generateObject({
				model,
				schema: routerSchema,
				mode: "json",
				system: systemPrompt,
				messages: [...history, { role: "user", content: message }],
			});

			if (object.type === "route" && !object.agentType) {
				return {
					type: "clarify",
					content:
						"I'm not sure which department to connect you with.",
					reasoning: "Model routed but failed to provide agentType",
					tokensUsed: usage.totalTokens,
				};
			}

			return {
				type: object.type,
				agentType: object.agentType as AgentType,
				reasoning: object.reasoning,
				content: object.content,
				tokensUsed: usage.totalTokens,
			};
		} catch (err) {
			// Pass to our handler
			this.handleGeminiError(err);
		}
	}

	static async processWithAgent(
		agentType: AgentType,
		message: string,
		history: CoreMessage[],
	): Promise<AgentResponse> {
		let tools: Record<string, any> = {};
		let systemPrompt = "";

		// ... (Switch case remains same) ...
		switch (agentType) {
			case "order":
				tools = orderTools;
				systemPrompt = "You are an Order Support Agent.";
				break;
			case "billing":
				tools = billingTools;
				systemPrompt = "You are a Billing Support Agent.";
				break;
			default:
				tools = supportTools;
				systemPrompt = "You are a General Support Agent.";
				break;
		}

		try {
			const result = await generateText({
				model,
				system: systemPrompt,
				messages: [...history, { role: "user", content: message }],
				tools,
				maxSteps: 2,
			});

			return {
				content: result.text,
				agentType,
				reasoning:
					result.toolCalls?.length > 0
						? `Used tools: ${result.toolCalls.map((t) => t.toolName).join(", ")}`
						: `Processed by ${agentType}`,
				tokensUsed: result.usage?.totalTokens ?? 0,
			};
		} catch (err) {
			// Pass to our handler
			this.handleGeminiError(err);
		}
	}
}
