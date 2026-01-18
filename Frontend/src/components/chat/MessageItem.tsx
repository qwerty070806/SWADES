import { MessageSafe as Message } from "../../types";
import { Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface MessageItemProps {
	message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
	const [showReasoning, setShowReasoning] = useState(false);
	const isUser = message.role === "user";

	const getAgentBadge = () => {
		const currentType = message.agentType || "router";

		const colors = {
			support:
				"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
			order: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
			billing:
				"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
			// Leave router empty here; we will handle it via inline styles below
			router: "",
		};

		const names = {
			support: "Support Agent",
			order: "Order Agent",
			billing: "Billing Agent",
			router: "Routing Agent",
		};

		// Manual Inline Styles for Router (Gold/Amber)
		// This guarantees visibility regardless of Tailwind config
		const routerStyles = {
			backgroundColor: "rgba(245, 158, 11, 0.15)", // Transparent Amber
			color: "#fbbf24", // Bright Amber text (visible on dark)
			border: "1px solid rgba(245, 158, 11, 0.1)", // Subtle border to make it pop
		};

		const isRouter = currentType === "router";
		const colorClass = colors[currentType as keyof typeof colors] || "";
		const nameText =
			names[currentType as keyof typeof names] || names.router;

		return (
			<span
				// Apply manual styles ONLY if it is the Router agent
				style={isRouter ? routerStyles : {}}
				className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
				{nameText}
			</span>
		);
	};
	return (
		<div
			className={`flex items-start gap-3 p-4 ${
				isUser ? "bg-transparent" : "bg-gray-50 dark:bg-gray-800/50"
			}`}>
			{/* Avatar */}
			<div
				className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
					isUser ? "bg-gray-700 dark:bg-gray-600" : "bg-blue-600"
				}`}>
				{isUser ? (
					<User className="w-5 h-5 text-white" />
				) : (
					<Bot className="w-5 h-5 text-white" />
				)}
			</div>

			{/* Message Content */}
			<div className="flex-1 space-y-2">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-gray-900 dark:text-gray-100">
						{isUser ? "You" : "AI Assistant"}
					</span>
					{!isUser && getAgentBadge()}
				</div>

				{/* Message text with markdown-like formatting */}
				<div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
					{message.content.split("\n").map((line, i) => {
						// Bold headers
						if (line.startsWith("**") && line.endsWith("**")) {
							return (
								<div key={i} className="font-semibold mt-2">
									{line.replace(/\*\*/g, "")}
								</div>
							);
						}
						// Inline bold
						if (line.includes("**")) {
							const parts = line.split(/(\*\*.*?\*\*)/g);
							return (
								<div key={i}>
									{parts.map((part, j) => {
										if (
											part.startsWith("**") &&
											part.endsWith("**")
										) {
											return (
												<strong key={j}>
													{part.replace(/\*\*/g, "")}
												</strong>
											);
										}
										return <span key={j}>{part}</span>;
									})}
								</div>
							);
						}
						return <div key={i}>{line || "\u00A0"}</div>;
					})}
				</div>

				{/* Reasoning toggle */}
				{!isUser && message.reasoning && (
					<div className="mt-2">
						<button
							onClick={() => setShowReasoning(!showReasoning)}
							className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
							{showReasoning ? (
								<>
									<ChevronUp className="w-3 h-3" />
									Hide reasoning
								</>
							) : (
								<>
									<ChevronDown className="w-3 h-3" />
									Show reasoning
								</>
							)}
						</button>

						{showReasoning && (
							<div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
								<div className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
									AI Reasoning Process:
								</div>
								{message.reasoning}
							</div>
						)}
					</div>
				)}

				{/* Timestamp */}
				<div className="text-xs text-gray-500 dark:text-gray-400">
					{new Date(message.timestamp).toLocaleTimeString()}
				</div>
			</div>
		</div>
	);
}
