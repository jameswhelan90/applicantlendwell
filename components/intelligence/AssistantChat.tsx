'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AssistantChatProps {
  onClose: () => void;
}

export function AssistantChat({ onClose }: AssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hi! I can answer questions about your application. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        sender: 'assistant',
        text: 'Thanks for your question! I can help guide you through your application. Feel free to ask me anything else.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div
      className="flex flex-col p-4"
      style={{
        backgroundColor: '#FAFBFC',
        borderTop: '1px solid #E5E7EB',
      }}
    >
      {/* Chat Messages */}
      <div
        className="mb-3 overflow-y-auto"
        style={{
          maxHeight: '200px',
        }}
      >
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="px-3 py-2 rounded-lg max-w-xs break-words"
                style={{
                  backgroundColor: msg.sender === 'user' ? '#3126E3' : '#F7F8FC',
                  color: msg.sender === 'user' ? '#ffffff' : '#182026',
                }}
              >
                <p className="text-xs">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: '#9CA3AF',
                        animation: 'typing-bounce 1.1s ease-in-out infinite',
                        animationDelay: `${i * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask a question…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
          style={{
            borderColor: '#E5E7EB',
            backgroundColor: '#ffffff',
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="p-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
          style={{
            backgroundColor: '#3126E3',
            color: '#ffffff',
          }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
