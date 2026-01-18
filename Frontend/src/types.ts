// frontend/types.ts

/** Frontend-safe Message */
export interface MessageSafe {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	agentType?: string;
	reasoning?: string; // include reasoning for display
	timestamp: Date;
	tokens_used?: string; // optional if you want to show token usage
}

/** Frontend-safe Conversation */
export interface ConversationSafe {
	id: string;
	title: string;
	messages: MessageSafe[];
	createdAt: Date;
	updatedAt: Date;
}

/** Frontend-safe Order */
export interface OrderSafe {
	id: string;
	orderNumber: string;
	status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
	items: { name: string; quantity: number; price: number }[];
	total: number;
	createdAt: Date;
	estimatedDelivery?: Date;
	trackingNumber?: string;
}

/** Frontend-safe Payment */
export interface PaymentSafe {
	id: string;
	orderId: string;
	amount: number;
	status: "completed" | "pending" | "failed" | "refunded";
	method: "credit_card" | "paypal" | "bank_transfer";
	invoiceUrl: string;
	createdAt: Date;
	refundedAt?: Date;
}

/** Frontend-safe FAQ */
export interface FAQSafe {
	id: string;
	question: string;
	answer: string;
	category: string;
}
