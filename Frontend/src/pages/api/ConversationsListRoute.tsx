import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getConversations } from '../../lib/api';
import { ArrowLeft } from 'lucide-react';

// API Route Component for GET /api/conversations
export default function ConversationsListRoute() {
  const [searchParams] = useSearchParams();
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const loadConversations = async () => {
      const userId = searchParams.get('userId') || 'user-1';
      const conversations = await getConversations(userId);
      
      setResponse({
        success: true,
        data: conversations,
        total: conversations.length
      });
    };

    loadConversations();
  }, [searchParams]);

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
        <h1 className="text-2xl font-bold mb-4">GET /api/conversations</h1>
        <div className="bg-gray-800 rounded-lg p-6 overflow-auto">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Parameters:</p>
          <ul className="list-disc list-inside mt-2">
            <li>userId (optional): User ID (default: user-1)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}