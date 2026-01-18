import { useEffect, useRef, useState } from "react";
import { MessageSafe as Message } from "../../types";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { sendMessage } from "../../lib/api";
import { AlertCircle, Book, Clock } from "lucide-react"; // Added Clock icon
import { Link } from "react-router-dom";

interface ChatInterfaceProps {
	conversationId: string | null;
	messages: Message[];
	onMessagesUpdate: () => void;
}

export function ChatInterface({
	conversationId,
	messages,
	onMessagesUpdate,
}: ChatInterfaceProps) {
	const [isLoading, setIsLoading] = useState(false);

	// We can store error as a string OR an object if we want richer UI.
	// For simplicity, we'll keep it as a string but format it nicely.
	const [error, setError] = useState<string | null>(null);
	const [isRateLimited, setIsRateLimited] = useState(false); // New state to style the error differently

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isLoading]);

	const handleSendMessage = async (content: string) => {
		setError(null);
		setIsRateLimited(false);
		setIsLoading(true);

		try {
			const response = await sendMessage({
				conversationId,
				message: content,
			});

			if (!response.success) {
				// Check if the backend sent us specific Rate Limit details
				if (response.details && response.details.retryAfterSeconds) {
					setIsRateLimited(true);
					const seconds = response.details.retryAfterSeconds;

					// Format a friendly message
					setError(
						`High traffic volume: Please wait ${seconds} seconds before sending the next message.`,
					);
				} else {
					// Standard error fallback
					setError(response.error || "Failed to send message");
				}
			} else {
				onMessagesUpdate();
			}
		} catch (err: any) {
			// Handle network level errors (like 500s that don't return JSON)
			setError(
				"An unexpected error occurred. Please check your connection.",
			);
			console.error("Error sending message:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-screen bg-white dark:bg-gray-900">
			{/* Header */}
			<div className="border-b dark:border-gray-700 p-3 md:p-4 bg-white dark:bg-gray-900 flex items-center justify-between">
				<div className="flex-1 min-w-0 ml-12 md:ml-0">
					<h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
						AI Customer Support
					</h1>
					<p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
						Multi-agent system with Support, Order, and Billing
						specialists
					</p>
				</div>
				<Link
					to="/api-docs"
					className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex-shrink-0"
					title="API Documentation">
					<Book className="w-4 h-4" />
					<span className="hidden sm:inline">API Docs</span>
				</Link>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto">
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full p-4 md:p-8 text-center">
						<div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
								/>
							</svg>
						</div>
						<h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
							Welcome to AI Customer Support
						</h2>
						<p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 max-w-md">
							Ask me anything about your orders, billing, or
							general support questions. I'll route your query to
							the right specialist!
						</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-8 max-w-3xl w-full">
							<div className="p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<div className="text-sm md:text-base font-semibold text-green-900 dark:text-green-100 mb-1 md:mb-2">
									Support Agent
								</div>
								<p className="text-xs md:text-sm text-green-700 dark:text-green-300">
									General help, FAQs, account issues
								</p>
							</div>
							<div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<div className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-100 mb-1 md:mb-2">
									Order Agent
								</div>
								<p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
									Track orders, check delivery status
								</p>
							</div>
							<div className="p-3 md:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
								<div className="text-sm md:text-base font-semibold text-purple-900 dark:text-purple-100 mb-1 md:mb-2">
									Billing Agent
								</div>
								<p className="text-xs md:text-sm text-purple-700 dark:text-purple-300">
									Invoices, refunds, payment history
								</p>
							</div>
						</div>
					</div>
				) : (
					<div>
						{messages.map((message) => (
							<MessageItem key={message.id} message={message} />
						))}
						{isLoading && <ThinkingIndicator />}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* Error Display */}
			{error && (
				<div
					className={`mx-3 md:mx-4 mb-2 p-3 border rounded-lg flex items-start gap-2 ${
						isRateLimited
							? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
							: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
					}`}>
					{isRateLimited ? (
						<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
					) : (
						<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
					)}

					<div className="flex-1 min-w-0">
						<div
							className={`font-semibold text-sm ${
								isRateLimited
									? "text-amber-900 dark:text-amber-100"
									: "text-red-900 dark:text-red-100"
							}`}>
							{isRateLimited ? "System Busy" : "Error"}
						</div>
						<div
							className={`text-xs md:text-sm ${
								isRateLimited
									? "text-amber-700 dark:text-amber-300"
									: "text-red-700 dark:text-red-300"
							}`}>
							{error}
						</div>
					</div>
					<button
						onClick={() => setError(null)}
						className={`text-xl leading-none ${
							isRateLimited
								? "text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
								: "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
						}`}>
						×
					</button>
				</div>
			)}

			{/* Input */}
			<MessageInput onSend={handleSendMessage} disabled={isLoading} />
		</div>
	);
}
