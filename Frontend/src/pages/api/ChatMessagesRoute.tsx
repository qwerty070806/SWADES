import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { sendMessage } from '../../lib/api';
import { ArrowLeft } from 'lucide-react';

// API Route Component for POST /api/chat/messages
export default function ChatMessagesRoute() {
  const [searchParams] = useSearchParams();
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const handleRequest = async () => {
      // This is a demonstration - in a real app, this would be a server endpoint
      // For demo purposes, we'll accept query params
      const message = searchParams.get('message');
      const conversationId = searchParams.get('conversationId');

      if (message) {
        const result = await sendMessage({
          message,
          conversationId: conversationId || undefined
        });
        setResponse(result);
      } else {
        setResponse({
          error: 'Message parameter is required',
          usage: 'POST /api/chat/messages?message=your+message&conversationId=optional'
        });
      }
    };

    handleRequest();
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
        <h1 className="text-2xl font-bold mb-4">POST /api/chat/messages</h1>
        <div className="bg-gray-800 rounded-lg p-6 overflow-auto">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Parameters:</p>
          <ul className="list-disc list-inside mt-2">
            <li>message (required): The user's message</li>
            <li>conversationId (optional): Existing conversation ID</li>
          </ul>
        </div>
      </div>
    </div>
  );
}