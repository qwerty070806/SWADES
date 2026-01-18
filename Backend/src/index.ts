import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ChatController } from "./controllers/chat-controller";
import { AgentController } from "./controllers/agent-controller";
import { rateLimiter } from "./lib/utils";
import { seedDatabase } from "./db";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Rate Limiting Middleware
app.use("/api/*", async (c, next) => {
	// Use IP address for rate limiting since there is no auth
	const ip =
		c.req.header("x-forwarded-for") ||
		c.req.header("x-real-ip") ||
		"127.0.0.1";
	const limit = rateLimiter.check(ip);

	if (!limit.allowed) {
		// Calculate seconds until reset
		const retryAfterSeconds = Math.ceil(
			(limit.resetAt.getTime() - Date.now()) / 1000,
		);
		return c.json(
			{
				success: false,
				error: "Rate limit exceeded. Please try again later.",
				details: {
					message: "You are sending messages too quickly.",
					limitType: "IP_LIMIT",
					retryAfterSeconds: retryAfterSeconds,
					refreshTime: limit.resetAt.toISOString(),
				},
			},
			429,
		);
	}

	await next();
});

// Error Handling Middleware
app.onError((err, c) => {
	console.error("Server Error:", err);
	return c.json({ success: false, error: "Internal Server Error" }, 500);
});

// Routes
app.post("/api/chat/messages", ChatController.sendMessage);
app.get("/api/conversations", ChatController.getConversations);
app.get("/api/conversations/:id", ChatController.getConversation);
app.delete("/api/conversations/:id", ChatController.deleteConversation);

app.get("/api/agents", AgentController.getAgents);
app.get("/api/agents/:type/capabilities", AgentController.getCapabilities);

app.get("/api/health", (c) =>
	c.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// Initialize
// seedDatabase().catch(console.error);

const port = Number(process.env.PORT) || 5000;

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.log(`Hono server running at http://localhost:${info.port}`);
	},
);
