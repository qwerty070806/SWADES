export interface Order {
	id: string;
	userId: string;
	orderNumber: string;
	status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
	items: { name: string; quantity: number; price: number }[];
	total: number;
	createdAt: Date;
	estimatedDelivery?: Date;
	trackingNumber?: string;
}

export interface Payment {
	id: string;
	userId: string;
	orderId: string;
	amount: number;
	status: "completed" | "pending" | "failed" | "refunded";
	method: "credit_card" | "paypal" | "bank_transfer";
	invoiceUrl: string;
	createdAt: Date;
	refundedAt?: Date;
}

export interface Conversation {
	id: string;
	userId: string;
	title: string;
	messages: Message[];
	createdAt: Date;
	updatedAt: Date;
}

export interface Message {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	agentType?: string;
	reasoning?: string;
	timestamp: Date;
	tokens_used: string;
}

export interface FAQ {
	id: string;
	question: string;
	answer: string;
	category: string;
}
