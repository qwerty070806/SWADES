import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export async function seedDatabase() {
	try {
		// Avoid duplicate seeding
		const existingUser = await db.query.users.findFirst();
		if (existingUser) return;

		console.log("Seeding database...");

		await db.insert(schema.users).values([
			{
				id: "user-1",
				name: "Demo User",
				email: "demo@example.com",
			},
			{
				id: "user-2",
				name: "Jane Customer",
				email: "jane@example.com",
			},
		]);

		await db.insert(schema.conversations).values([
			{
				id: "conv-1",
				userId: "user-1",
				title: "Order tracking help",
			},
			{
				id: "conv-2",
				userId: "user-1",
				title: "Return policy clarification",
			},
			{
				id: "conv-3",
				userId: "user-2",
				title: "Payment issue",
			},
		]);

		await db.insert(schema.messages).values([
			{
				id: "msg-1",
				conversationId: "conv-1",
				role: "user",
				content: "Where is my order ORD-2024-001?",
				agentType: null,
				reasoning: null,
				tokensUsed: "12",
			},
			{
				id: "msg-2",
				conversationId: "conv-1",
				role: "assistant",
				content:
					"Your order has been shipped and is expected to arrive in 2 days.",
				agentType: "order_agent",
				reasoning: "Fetched order status using order number",
				tokensUsed: "25",
			},
			{
				id: "msg-3",
				conversationId: "conv-2",
				role: "user",
				content: "Can I return my headphones?",
				tokensUsed: "8",
			},
			{
				id: "msg-4",
				conversationId: "conv-2",
				role: "assistant",
				content: "Yes, returns are accepted within 30 days if unused.",
				agentType: "faq_agent",
				reasoning: "Matched return policy FAQ",
				tokensUsed: "18",
			},
			{
				id: "msg-5",
				conversationId: "conv-3",
				role: "user",
				content: "My payment failed but money was deducted.",
				tokensUsed: "11",
			},
		]);

		await db.insert(schema.orders).values([
			{
				id: "ord-1",
				userId: "user-1",
				orderNumber: "ORD-2024-001",
				status: "shipped",
				total: "299.00",
				items: [
					{ name: "Wireless Headphones", quantity: 1, price: 299.0 },
				],
				trackingNumber: "TRK-998877",
				estimatedDelivery: new Date(Date.now() + 86400000 * 2),
			},
			{
				id: "ord-2",
				userId: "user-2",
				orderNumber: "ORD-2024-002",
				status: "processing",
				total: "1499.00",
				items: [
					{ name: "Mechanical Keyboard", quantity: 1, price: 999.0 },
					{ name: "Gaming Mouse", quantity: 1, price: 500.0 },
				],
				trackingNumber: null,
				estimatedDelivery: new Date(Date.now() + 86400000 * 5),
			},
		]);

		await db.insert(schema.payments).values([
			{
				id: "pay-1",
				userId: "user-1",
				orderId: "ord-1",
				amount: "299.00",
				status: "completed",
				method: "credit_card",
				invoiceUrl: "https://example.com/invoices/inv-001.pdf",
			},
			{
				id: "pay-2",
				userId: "user-2",
				orderId: "ord-2",
				amount: "1499.00",
				status: "pending",
				method: "upi",
				invoiceUrl: null,
			},
		]);

		await db.insert(schema.faqs).values([
			{
				id: "faq-ship-1",
				question: "How do I track my order?",
				answer: "You can track your order from the My Orders section using the tracking number sent to your registered email.",
				category: "shipping",
			},
			{
				id: "faq-ship-2",
				question: "How long does delivery usually take?",
				answer: "Standard delivery usually takes 3 to 7 business days depending on your location.",
				category: "shipping",
			},
			{
				id: "faq-ship-3",
				question: "Do you ship internationally?",
				answer: "Yes, we ship to selected international locations. Delivery timelines and charges vary by country.",
				category: "shipping",
			},

			{
				id: "faq-ret-1",
				question: "What is your return policy?",
				answer: "Items can be returned within 30 days of delivery if they are unused and in original packaging.",
				category: "returns",
			},
			{
				id: "faq-ret-2",
				question: "How do I initiate a return?",
				answer: "You can request a return from the My Orders page by selecting the order and clicking on Return Item.",
				category: "returns",
			},
			{
				id: "faq-ret-3",
				question: "When will I receive my refund?",
				answer: "Refunds are processed within 5 to 7 business days after the returned item is received and inspected.",
				category: "returns",
			},

			{
				id: "faq-acc-1",
				question: "How can I reset my password?",
				answer: "Go to the login page and click on Forgot Password. A reset link will be sent to your registered email.",
				category: "account",
			},
			{
				id: "faq-acc-2",
				question: "How do I update my account information?",
				answer: "You can update your personal details from the Account Settings section after logging in.",
				category: "account",
			},
			{
				id: "faq-acc-3",
				question: "Can I change my registered email address?",
				answer: "Yes, you can change your email address from Account Settings. Verification may be required.",
				category: "account",
			},

			{
				id: "faq-pay-1",
				question: "What payment methods are supported?",
				answer: "We support credit cards, debit cards, UPI, and net banking.",
				category: "payment",
			},
			{
				id: "faq-pay-2",
				question:
					"My payment failed but money was deducted. What should I do?",
				answer: "In most cases, deducted amounts are automatically refunded within 3 to 5 business days.",
				category: "payment",
			},
			{
				id: "faq-pay-3",
				question: "How can I download my invoice?",
				answer: "Invoices can be downloaded from the My Orders page once the order payment is completed.",
				category: "payment",
			},
		]);
		console.log("Database seeded successfully.");
	} catch (error) {
		console.error("Error seeding database:", error);
	}
}
