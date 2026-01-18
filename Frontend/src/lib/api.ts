import { ConversationSafe, MessageSafe } from "../types";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export interface ChatMessageRequest {
	conversationId?: string | null;
	message: string;
	userId?: string;
}

export interface ChatMessageResponse {
	success: boolean;
	conversationId?: string; // Made optional as errors won't have it
	message?: MessageSafe; // Made optional as errors won't have it
	agentType?: string; // Made optional
	reasoning?: string; // Made optional
	error?: string;

	// NEW: Add the details object for Rate Limits
	details?: {
		message: string;
		limitType: string;
		retryAfterSeconds: number;
		refreshTime: string;
	};
}

// POST /api/chat/messages
export async function sendMessage(
	request: ChatMessageRequest,
): Promise<ChatMessageResponse> {
	const payload = {
		message: request.message,
		userId: request.userId || "user-1",
		...(request.conversationId
			? { conversationId: request.conversationId }
			: {}),
	};

	try {
		const response = await fetch(`${API_BASE_URL}/chat/messages`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		// 1. Always parse the JSON, even if status is 4xx or 5xx
		const data = await response.json();

		// 2. If the request failed (e.g. 429), return the data object
		// so the UI can read data.error and data.details
		if (!response.ok) {
			return {
				success: false,
				error: data.error || "Failed to send message",
				details: data.details, // Pass the details through
				// Return defaults for other required fields if needed, or rely on optional types
			} as ChatMessageResponse;
		}

		return data;
	} catch (error) {
		// Network errors (fetch failed completely)
		console.error("Network error:", error);
		return {
			success: false,
			error: "Network error: Unable to reach server",
		} as ChatMessageResponse;
	}
}

// GET /api/conversations/:id
export async function getConversation(
	id: string,
): Promise<ConversationSafe | null> {
	const response = await fetch(`${API_BASE_URL}/conversations/${id}`);
	if (response.status === 404) return null;
	if (!response.ok) {
		throw new Error("Failed to fetch conversation");
	}
	return response.json();
}

// GET /api/conversations
export async function getConversations(
	userId: string = "user-1",
): Promise<ConversationSafe[]> {
	const response = await fetch(
		`${API_BASE_URL}/conversations?userId=${userId}`,
	);
	if (!response.ok) {
		throw new Error("Failed to fetch conversations");
	}
	return response.json();
}

// DELETE /api/conversations/:id
export async function deleteConversation(id: string): Promise<boolean> {
	const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
		method: "DELETE",
	});
	return response.ok;
}

// GET /api/agents
export async function getAgents() {
	const response = await fetch(`${API_BASE_URL}/agents`);
	if (!response.ok) throw new Error("Failed to fetch agents");
	return response.json();
}

// GET /api/agents/:type/capabilities
export async function getAgentCapabilities(agentType: string) {
	const response = await fetch(
		`${API_BASE_URL}/agents/${agentType}/capabilities`,
	);
	if (!response.ok) throw new Error("Failed to fetch capabilities");
	return response.json();
}

// GET /api/health
export async function healthCheck() {
	const response = await fetch(`${API_BASE_URL}/health`);
	return response.json();
}
