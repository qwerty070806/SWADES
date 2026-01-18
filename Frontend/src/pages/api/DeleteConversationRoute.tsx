import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { deleteConversation } from '../../lib/api';
import { ArrowLeft } from 'lucide-react';

// API Route Component for DELETE /api/conversations/:id
export default function DeleteConversationRoute() {
  const { id } = useParams();
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const handleDelete = async () => {
      if (id) {
        const success = await deleteConversation(id);
        setResponse({
          success,
          message: success ? 'Conversation deleted successfully' : 'Conversation not found'
        });
      }
    };

    handleDelete();
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
        <h1 className="text-2xl font-bold mb-4">DELETE /api/conversations/{id}</h1>
        <div className="bg-gray-800 rounded-lg p-6 overflow-auto">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
        <div className="mt-4 text-sm text-yellow-400">
          ⚠️ This is a demonstration. In production, use proper HTTP DELETE methods.
        </div>
      </div>
    </div>
  );
}