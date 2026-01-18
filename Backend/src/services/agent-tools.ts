import { tool } from "ai";
import { z } from "zod";
import { db } from "../db";
import { orders, payments, faqs } from "../db/schema";
import { eq, like, or } from "drizzle-orm";

// --- Order Tools ---
export const orderTools = {
	fetchOrderDetails: tool({
		description: "Get details of a specific order by order number",
		parameters: z.object({ orderNumber: z.string() }),
		execute: async ({ orderNumber }) => {
			const order = await db.query.orders.findFirst({
				where: eq(orders.orderNumber, orderNumber),
			});
			return order
				? { success: true, data: order }
				: { success: false, error: "Order not found" };
		},
	}),
	checkDeliveryStatus: tool({
		description: "Check delivery status and tracking for an order",
		parameters: z.object({ orderNumber: z.string() }),
		execute: async ({ orderNumber }) => {
			const order = await db.query.orders.findFirst({
				where: eq(orders.orderNumber, orderNumber),
			});
			if (!order) return { success: false, error: "Order not found" };
			return {
				success: true,
				data: {
					status: order.status,
					trackingNumber: order.trackingNumber,
					estimatedDelivery: order.estimatedDelivery,
				},
			};
		},
	}),
	getUserOrders: tool({
		description: "Get all orders for the current user",
		parameters: z.object({ userId: z.string().default("user-1") }),
		execute: async ({ userId }) => {
			const userOrders = await db.query.orders.findMany({
				where: eq(orders.userId, userId),
			});
			return {
				success: true,
				data: { total: userOrders.length, orders: userOrders },
			};
		},
	}),
};

// --- Billing Tools ---
export const billingTools = {
	getInvoiceDetails: tool({
		description: "Get invoice and payment details for an order",
		parameters: z.object({ orderNumber: z.string() }),
		execute: async ({ orderNumber }) => {
			const order = await db.query.orders.findFirst({
				where: eq(orders.orderNumber, orderNumber),
			});
			if (!order) return { success: false, error: "Order not found" };

			const payment = await db.query.payments.findFirst({
				where: eq(payments.orderId, order.id),
			});

			return payment
				? { success: true, data: { ...payment, items: order.items } }
				: { success: false, error: "Payment not found" };
		},
	}),
	checkRefundStatus: tool({
		description: "Check if an order is refunded or eligible for refund",
		parameters: z.object({ orderNumber: z.string() }),
		execute: async ({ orderNumber }) => {
			const order = await db.query.orders.findFirst({
				where: eq(orders.orderNumber, orderNumber),
			});
			if (!order) return { success: false, error: "Order not found" };

			const payment = await db.query.payments.findFirst({
				where: eq(payments.orderId, order.id),
			});

			if (!payment)
				return { success: false, error: "Payment info not found" };

			const isRefunded = payment.status === "refunded";
			const canRefund =
				payment.status === "completed" && order.status !== "pending";

			return {
				success: true,
				data: { isRefunded, canRefund, status: payment.status },
			};
		},
	}),
};

// --- Support Tools ---
export const supportTools = {
	searchFAQs: tool({
		description: "Search the FAQ database for answers",
		parameters: z.object({ query: z.string() }),
		execute: async ({ query }) => {
			const results = await db
				.select()
				.from(faqs)
				.where(
					or(
						like(faqs.question, `%${query}%`),
						like(faqs.answer, `%${query}%`),
					),
				);
			return { success: true, data: { results } };
		},
	}),
};
