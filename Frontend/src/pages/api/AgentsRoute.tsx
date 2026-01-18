import { useEffect, useState } from 'react';
import { getAgents } from '../../lib/api';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// API Route Component for GET /api/agents
export default function AgentsRoute() {
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const loadAgents = async () => {
      const agents = await getAgents();
      setResponse({
        success: true,
        data: agents,
        total: agents.length
      });
    };

    loadAgents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/api-docs"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to API Docs
        </Link>
        <h1 className="text-2xl font-bold mb-4">GET /api/agents</h1>
        <div className="bg-gray-800 rounded-lg p-6 overflow-auto">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Returns all available agents in the multi-agent system</p>
        </div>
      </div>
    </div>
  );
}