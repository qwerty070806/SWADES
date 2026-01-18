import { pgTable, text, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name"),
	email: text("email"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => users.id),
	title: text("title"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
	id: text("id").primaryKey(),
	conversationId: text("conversation_id").references(() => conversations.id, {
		onDelete: "cascade",
	}),
	role: text("role").notNull(), // 'user' | 'assistant' | 'system'
	content: text("content").notNull(),
	agentType: text("agent_type"),
	reasoning: text("reasoning"),
	timestamp: timestamp("timestamp").defaultNow(),
	tokensUsed: text("tokens_used"),
});

export const orders = pgTable("orders", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => users.id),
	orderNumber: text("order_number").unique().notNull(),
	status: text("status").notNull(),
	total: decimal("total", { precision: 10, scale: 2 }).notNull(),
	items: jsonb("items").notNull(),
	trackingNumber: text("tracking_number"),
	estimatedDelivery: timestamp("estimated_delivery"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => users.id),
	orderId: text("order_id").references(() => orders.id),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	status: text("status").notNull(),
	method: text("method").notNull(),
	invoiceUrl: text("invoice_url"),
	createdAt: timestamp("created_at").defaultNow(),
	refundedAt: timestamp("refunded_at"),
});

export const faqs = pgTable("faqs", {
	id: text("id").primaryKey(),
	question: text("question").notNull(),
	answer: text("answer").notNull(),
	category: text("category").notNull(),
});

export const conversationsRelations = relations(conversations, ({ many }) => ({
	messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id],
	}),
}));
