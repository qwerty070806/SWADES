import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getConversation } from '../../lib/api';
import { ArrowLeft } from 'lucide-react';

// API Route Component for GET /api/conversations/:id
export default function ConversationRoute() {
  const { id } = useParams();
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (id) {
        const conversation = await getConversation(id);
        if (conversation) {
          setResponse({
            success: true,
            data: conversation
          });
        } else {
          setResponse({
            success: false,
            error: 'Conversation not found'
          });
        }
      }
    };

    loadConversation();
  }, [id]);

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
        <h1 className="text-2xl font-bold mb-4">GET /api/conversations/{id}</h1>
        <div className="bg-gray-800 rounded-lg p-6 overflow-auto">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}