import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAgentCapabilities } from "../../lib/api";
import { ArrowLeft } from "lucide-react";

// API Route Component for GET /api/agents/:type/capabilities
export default function AgentCapabilitiesRoute() {
	const { type } = useParams();
	const [response, setResponse] = useState<any>(null);

	useEffect(() => {
		const loadCapabilities = async () => {
			if (type && ["support", "order", "billing"].includes(type)) {
				const capabilities = await getAgentCapabilities(type);
				setResponse({
					success: true,
					data: capabilities,
				});
			} else {
				setResponse({
					success: false,
					error: "Invalid agent type. Valid types: support, order, billing",
				});
			}
		};

		loadCapabilities();
	}, [type]);

	return (
		<div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
			<div className="max-w-4xl mx-auto">
				<Link
					to="/api-docs"
					className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors">
					<ArrowLeft className="w-4 h-4" />
					Back to API Docs
				</Link>
				<h1 className="text-2xl font-bold mb-4">
					GET /api/agents/{type}/capabilities
				</h1>
				<div className="bg-gray-800 rounded-lg p-6 overflow-auto">
					<pre>{JSON.stringify(response, null, 2)}</pre>
				</div>
				<div className="mt-4 text-sm text-gray-400">
					<p>Valid agent types:</p>
					<ul className="list-disc list-inside mt-2">
						<li>support - Support Agent capabilities</li>
						<li>order - Order Agent capabilities</li>
						<li>billing - Billing Agent capabilities</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
