import { CoreMessage } from "ai";

// --- Rate Limiter ---
export class RateLimiter {
	private requests: Map<string, { count: number; resetAt: number }>;
	private limit: number;
	private window: number;

	constructor(limit = 10, windowMs = 60000) {
		this.requests = new Map();
		this.limit = limit;
		this.window = windowMs;
	}

	check(key: string): { allowed: boolean; remaining: number; resetAt: Date } {
		const now = Date.now();
		const record = this.requests.get(key);

		if (!record || now > record.resetAt) {
			const resetAt = now + this.window;
			this.requests.set(key, { count: 1, resetAt });
			return {
				allowed: true,
				remaining: this.limit - 1,
				resetAt: new Date(resetAt),
			};
		}

		if (record.count >= this.limit) {
			return {
				allowed: false,
				remaining: 0,
				resetAt: new Date(record.resetAt),
			};
		}

		record.count++;
		return {
			allowed: true,
			remaining: this.limit - record.count,
			resetAt: new Date(record.resetAt),
		};
	}
}

export const rateLimiter = new RateLimiter(5, 60000); // 20 reqs per minute

export class ContextManager {
	private compactionThreshold: number;

	// Gemini Flash has a huge context (1M tokens).
	// We set a conservative 'soft' limit of 50k or 100k to manage costs/latency
	// rather than hard limits.
	constructor(compactionThreshold = 50000) {
		this.compactionThreshold = compactionThreshold;
	}

	// Gemini uses SentencePiece tokenizer.
	// Average is often ~3-3.5 chars/token. Using 3.5 is a safe over-estimation.
	private estimateTokens(text: string): number {
		return Math.ceil((text || "").length / 3.5);
	}

	private calculateTokens(messages: any[]): number {
		return messages.reduce(
			(acc, msg) =>
				acc +
				this.estimateTokens(
					typeof msg.content === "string"
						? msg.content
						: JSON.stringify(msg.content),
				),
			0,
		);
	}

	compact(messages: CoreMessage[]): CoreMessage[] {
		const tokens = this.calculateTokens(messages);

		// If within limits, return original
		if (tokens <= this.compactionThreshold) return messages;

		console.log(`[ContextManager] Compacting history. Tokens: ${tokens}`);

		// Strategy for Gemini:
		// 1. Always keep the System prompt (instructions).
		// 2. Keep the last 10 messages (high context relevance).
		// 3. Summarize or drop the middle.

		const keepRecent = 10;
		if (messages.length <= keepRecent + 1) return messages;

		// Separate System messages
		const systemMsgs = messages.filter((m) => m.role === "system");
		const nonSystemMsgs = messages.filter((m) => m.role !== "system");

		// Slice the conversation
		const recentMsgs = nonSystemMsgs.slice(-keepRecent);
		const olderMsgs = nonSystemMsgs.slice(0, -keepRecent);

		// Create a summary marker instead of expensive summarization unless needed
		const summaryMsg: CoreMessage = {
			role: "system",
			content: `[System Note: Previous conversation history compacted. ${olderMsgs.length} older messages were removed to maintain efficiency.]`,
		};

		return [...systemMsgs, summaryMsg, ...recentMsgs];
	}
}

export const contextManager = new ContextManager();
