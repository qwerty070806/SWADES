import { Context } from "hono";

export class AgentController {
	static getAgents(c: Context) {
		return c.json([
			{
				name: "Support Agent",
				type: "support",
				capabilities: ["General questions", "FAQs"],
			},
			{
				name: "Order Agent",
				type: "order",
				capabilities: ["Order status", "Tracking"],
			},
			{
				name: "Billing Agent",
				type: "billing",
				capabilities: ["Invoices", "Refunds"],
			},
		]);
	}

	static getCapabilities(c: Context) {
		const type = c.req.param("type");
		let capabilities: string[] = [];

		switch (type) {
			case "support":
				capabilities = ["Answer general questions", "Provide FAQs"];
				break;
			case "order":
				capabilities = ["Check order status", "Track deliveries"];
				break;
			case "billing":
				capabilities = ["View invoices", "Process refunds"];
				break;
			default:
				capabilities = ["Route queries", "Fallback"];
		}

		return c.json({
			name: `${type.charAt(0).toUpperCase() + type.slice(1)} Agent`,
			type,
			capabilities,
		});
	}
}
