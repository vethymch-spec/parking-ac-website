import React, { useState, useRef, useEffect } from 'react';
import { Send, GitBranch, Rocket, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../utils/api';

interface AdminChatProps {
  apiEndpoint: string;
  authToken: string;
}

export const AdminChat: React.FC<AdminChatProps> = ({ apiEndpoint, authToken }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'kimi'>('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${apiEndpoint}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          message: input,
          provider,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessageType = {
        id: data.id,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        actions: data.actions,
        branch: data.branch,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold">AI Admin Chat</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="openai">OpenAI GPT-4</option>
            <option value="anthropic">Anthropic Claude</option>
            <option value="kimi">Kimi</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg mb-2">Welcome to AI Admin Chat</p>
            <p className="text-sm">Describe what you want to change and I'll help you modify the code.</p>
            <div className="mt-8 space-y-2 text-left max-w-md mx-auto">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Examples:</p>
              {[
                'Update the hero title to "Best Parking AC for Trucks"',
                'Add a new FAQ section about installation',
                'Change the primary color to blue',
                'Update the contact phone number',
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInput(example)}
                  className="block w-full text-left text-sm p-3 bg-white rounded-lg border hover:border-blue-500 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} apiEndpoint={apiEndpoint} authToken={authToken} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you want to change..."
            className="flex-1 p-3 border rounded-lg resize-none h-24"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: ChatMessageType;
  apiEndpoint: string;
  authToken: string;
}> = ({ message, apiEndpoint, authToken }) => {
  const isUser = message.role === 'user';
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);

  const handleDeploy = async () => {
    if (!message.branch || deploying) return;

    setDeploying(true);
    setDeployStatus('Deploying...');

    try {
      const response = await fetch(`${apiEndpoint}/api/deploy/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ branch: message.branch }),
      });

      if (!response.ok) throw new Error('Deploy failed');

      const data = await response.json();
      setDeployStatus(`Preview: ${data.previewUrl}`);
    } catch (error) {
      setDeployStatus('Deploy failed');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'bg-blue-600 text-white' : 'bg-white border'} rounded-lg p-4`}>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>

        {!isUser && message.branch && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <GitBranch className="w-4 h-4" />
              Branch: {message.branch}
            </div>

            {deployStatus ? (
              <div className={`text-sm ${deployStatus.includes('Preview:') ? 'text-green-600' : 'text-red-600'}`}>
                {deployStatus.includes('Preview:') ? (
                  <a
                    href={deployStatus.replace('Preview: ', '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    View Preview →
                  </a>
                ) : (
                  deployStatus
                )}
              </div>
            ) : (
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deploying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Deploy Preview
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className={`text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
