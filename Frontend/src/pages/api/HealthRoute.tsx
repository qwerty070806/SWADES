import { useEffect, useState } from 'react';
import { healthCheck } from '../../lib/api';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// API Route Component for GET /api/health
export default function HealthRoute() {
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const health = await healthCheck();
      setResponse(health);
    };

    checkHealth();
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
        <h1 className="text-2xl font-bold mb-4">GET /api/health</h1>
        <div className="bg-gray-800 rounded-lg p-6 overflow-auto">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
        <div className="mt-4">
          {response?.status === 'ok' ? (
            <div className="flex items-center gap-2 text-green-400">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              All systems operational
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              System issues detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}