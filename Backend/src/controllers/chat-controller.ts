import { Context } from "hono";
import { db } from "../db";
import { conversations, messages } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import {
	agentService,
	AgentType,
	GeminiRateLimitError,
} from "../services/agent-service";
import { contextManager } from "../lib/utils";
import type { CoreMessage } from "ai";

export class ChatController {
	// POST /api/chat/messages
	static async sendMessage(c: Context) {
		const body = await c.req.json();
		const { message, conversationId, userId = "user-1" } = body;

		if (!message) {
			return c.json(
				{ success: false, error: "Message is required" },
				400,
			);
		}

		let convId = conversationId;

		// 1. Get or Create Conversation
		if (!convId) {
			convId = `conv-${Date.now()}`;
			await db.insert(conversations).values({
				id: convId,
				userId,
				title: message.substring(0, 50) + "...",
				updatedAt: new Date(),
			});
		} else {
			const exists = await db.query.conversations.findFirst({
				where: eq(conversations.id, convId),
			});
			if (!exists) {
				return c.json(
					{ success: false, error: "Conversation not found" },
					404,
				);
			}
		}

		// 2. Load History & Compact Context
		const history = await db.query.messages.findMany({
			where: eq(messages.conversationId, convId),
			orderBy: desc(messages.timestamp),
			limit: 20,
		});

		let coreMessages: CoreMessage[] = history.reverse().map((m) => ({
			role: m.role as "user" | "assistant" | "system",
			content: m.content,
		}));

		coreMessages = contextManager.compact(coreMessages);

		// 3. AI Processing (Wrapped in Try/Catch for Error Handling)
		try {
			const routing = await agentService.routeQuery(
				message,
				coreMessages,
			);

			let response: {
				content: string;
				agentType: AgentType;
				reasoning: string;
				tokensUsed: number;
			};

			// 4. Handle Routing Decision
			if (routing.type === "clarify") {
				response = {
					content:
						routing.content ??
						"Could you please clarify what you mean?",
					agentType: "router",
					reasoning: routing.reasoning,
					tokensUsed: 0,
				};
			} else {
				const targetAgent: AgentType = routing.agentType ?? "support";
				const agentResult = await agentService.processWithAgent(
					targetAgent,
					message,
					coreMessages,
				);

				response = {
					content: agentResult.content,
					agentType: agentResult.agentType,
					reasoning: `${routing.reasoning} → ${agentResult.reasoning}`,
					tokensUsed: agentResult.tokensUsed ?? 0,
				};
			}

			// 5. Save User Message
			const userMsgId = `msg-${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 11)}`;

			await db.insert(messages).values({
				id: userMsgId,
				conversationId: convId,
				role: "user",
				content: message,
				timestamp: new Date(),
				tokensUsed: response.tokensUsed?.toString() ?? null,
				agentType: null,
				reasoning: null,
			});

			// 6. Save Assistant Message
			const assistantMsgId = `msg-${Date.now() + 1}-${Math.random()
				.toString(36)
				.substring(2, 11)}`;

			const assistantMsg = {
				id: assistantMsgId,
				conversationId: convId,
				role: "assistant",
				content: response.content,
				agentType: response.agentType,
				reasoning: response.reasoning,
				tokensUsed: response.tokensUsed?.toString() ?? null,
				timestamp: new Date(),
			};

			await db.insert(messages).values(assistantMsg);

			// 7. Update conversation timestamp
			await db
				.update(conversations)
				.set({ updatedAt: new Date() })
				.where(eq(conversations.id, convId));

			// 8. Return Success Response
			return c.json({
				success: true,
				conversationId: convId,
				message: assistantMsg,
				agentType: response.agentType,
				reasoning: response.reasoning,
			});
		} catch (error: any) {
			console.error("Controller Error:", error);

			// Specific handling for Gemini Rate Limits
			if (
				error instanceof GeminiRateLimitError ||
				error.name === "GeminiRateLimitError"
			) {
				return c.json(
					{
						success: false,
						error: "AI Model Rate Limit Exceeded",
						details: {
							message:
								"We are experiencing high traffic. Please try again shortly.",
							limitType: error.limitType,
							retryAfterSeconds: error.retryAfterSeconds,
							refreshTime: new Date(
								Date.now() + error.retryAfterSeconds * 1000,
							).toISOString(),
						},
					},
					429,
				);
			}

			// General Error Fallback
			return c.json(
				{
					success: false,
					error: "Internal Server Error during AI processing",
				},
				500,
			);
		}
	}

	// GET /api/conversations
	static async getConversations(c: Context) {
		const userId = c.req.query("userId") || "user-1";
		const convs = await db.query.conversations.findMany({
			where: eq(conversations.userId, userId),
			orderBy: desc(conversations.updatedAt),
		});
		return c.json(convs);
	}

	// GET /api/conversations/:id
	static async getConversation(c: Context) {
		const id = c.req.param("id");
		const conv = await db.query.conversations.findFirst({
			where: eq(conversations.id, id),
			with: {
				messages: {
					orderBy: (messages, { asc }) => [asc(messages.timestamp)],
				},
			},
		});

		if (!conv) return c.json(null, 404);
		return c.json(conv);
	}

	// DELETE /api/conversations/:id
	static async deleteConversation(c: Context) {
		const id = c.req.param("id");
		await db.delete(conversations).where(eq(conversations.id, id));
		return c.json(true);
	}
}
