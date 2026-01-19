import { Link } from "react-router-dom";
import { ArrowLeft, Server } from "lucide-react";

export default function ApiDocsPage() {
	const routes = [
		{
			method: "POST",
			path: "https://multi-agent-ai-ec79.onrender.com/api/chat/messages",
			description: "Send a new message to the AI assistant",
			params: ["message (required)", "conversationId (optional)"],
		},
		{
			method: "GET",
			path: "https://multi-agent-ai-ec79.onrender.com/api/conversations/:id",
			description: "Get conversation history by ID",
			params: ["id (path parameter)"],
		},
		{
			method: "GET",
			path: "https://multi-agent-ai-ec79.onrender.com/api/conversations",
			description: "List all user conversations",
			params: ["userId (optional)"],
		},
		{
			method: "DELETE",
			path: "https://multi-agent-ai-ec79.onrender.com/api/conversations/:id",
			description: "Delete a conversation",
			params: ["id (path parameter)"],
		},
		{
			method: "GET",
			path: "https://multi-agent-ai-ec79.onrender.com/api/agents",
			description: "List all available agents",
			params: [],
		},
		{
			method: "GET",
			path: "https://multi-agent-ai-ec79.onrender.com/api/agents/:type/capabilities",
			description: "Get agent capabilities",
			params: ["type (path parameter: support|order|billing)"],
		},
		{
			method: "GET",
			path: "https://multi-agent-ai-ec79.onrender.com/api/health",
			description: "Health check endpoint",
			params: [],
		},
	];

	const getMethodColor = (method: string) => {
		switch (method) {
			case "GET":
				return "bg-blue-500";
			case "POST":
				return "bg-green-500";
			case "DELETE":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<Link
					to="/"
					className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4 md:mb-6 text-sm md:text-base">
					<ArrowLeft className="w-4 h-4" />
					Back to Chat
				</Link>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-8">
					<div className="flex items-center gap-3 mb-4 md:mb-6">
						<Server className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
						<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
							API Documentation
						</h1>
					</div>

					<p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
						Multi-agent customer support system API endpoints
					</p>

					<div className="space-y-3 md:space-y-4">
						{routes.map((route, index) => (
							<div
								key={index}
								className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
									<span
										className={`${getMethodColor(route.method)} text-white px-3 py-1 rounded text-xs md:text-sm font-semibold w-fit`}>
										{route.method}
									</span>
									<code className="text-sm md:text-lg font-mono text-gray-900 dark:text-gray-100 break-all">
										{route.path}
									</code>
								</div>

								<p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-3">
									{route.description}
								</p>

								{route.params.length > 0 && (
									<div>
										<span className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400">
											Parameters:
										</span>
										<ul className="list-disc list-inside mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{route.params.map((param, i) => (
												<li key={i}>{param}</li>
											))}
										</ul>
									</div>
								)}

								{/* ... inside your map function ... */}

								<div className="mt-4">
									{/* Only show "Try it out" for GET requests because links are always GET */}
									{route.method === "GET" ? (
										<a
											href={route.path
												.replace(":id", "demo-id")
												.replace(":type", "support")}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:underline">
											Try it out →
										</a>
									) : (
										<span className="text-xs md:text-sm text-gray-400 cursor-not-allowed">
											Use Postman or Curl to test{" "}
											{route.method}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
