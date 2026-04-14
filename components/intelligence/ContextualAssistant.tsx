'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useApplication } from '@/context/ApplicationContext';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AssistantContext {
  step: string;
  field?: string;
  userMessage?: string | null;
}

export function ContextualAssistant() {
  const { state, currentStep, isModalOpen } = useApplication();

  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastContext, setLastContext] = useState<AssistantContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch contextual guidance when step changes
  useEffect(() => {
    // Clear previous timer
    if (contextTimerRef.current) clearTimeout(contextTimerRef.current);

    const newContext: AssistantContext = {
      step: currentStep,
      field: undefined,
      userMessage: null,
    };

    // Don't fetch if context hasn't changed
    if (
      lastContext &&
      lastContext.step === newContext.step &&
      lastContext.field === newContext.field
    ) {
      return;
    }

    setLastContext(newContext);

    // Delay guidance to make it feel intentional (700-1200ms)
    contextTimerRef.current = setTimeout(() => {
      fetchAssistantGuidance(newContext);
    }, 900);

    return () => {
      if (contextTimerRef.current) clearTimeout(contextTimerRef.current);
    };
  }, [currentStep, lastContext]);

  const fetchAssistantGuidance = useCallback(async (context: AssistantContext) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) throw new Error('Failed to fetch guidance');

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        // Remove old guidance messages if adding new proactive guidance
        if (!context.userMessage) {
          return [assistantMessage];
        }
        return [...prev, assistantMessage];
      });

      setIsLoading(false);
    } catch (error) {
      console.error('[ContextualAssistant] Error fetching guidance:', error);
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(() => {
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

    // Fetch assistant response
    const context: AssistantContext = {
      step: currentStep,
      userMessage: inputValue,
    };

    fetchAssistantGuidance(context);
  }, [inputValue, currentStep, fetchAssistantGuidance]);

  // Hide when form modal is not open
  if (!isModalOpen) {
    return null;
  }

  return (
    <>
      {/* Minimized pill — visible when not expanded */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          aria-label="Open assistant"
          className="flex items-center gap-2 transition-all hover:shadow-lg"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 40,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '999px',
            padding: '10px 16px 10px 12px',
            boxShadow: '0px 4px 16px 0px rgba(24, 32, 38, 0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          {/* LendWell icon */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3126E3, #473FE6)',
              flexShrink: 0,
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#182026]">Ask LendWell</span>
        </button>
      )}

      {/* Expanded chat window */}
      {isExpanded && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 41,
            width: '340px',
            height: '500px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0px 10px 40px 0px rgba(24, 32, 38, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFBFC' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3126E3, #473FE6)',
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#182026]">Application Guide</span>
            </div>
            <button
              onClick={() => {
                setIsExpanded(false);
                setMessages([]);
              }}
              aria-label="Close assistant"
              className="p-1 hover:bg-muted/60 transition-colors"
              style={{ borderRadius: '6px' }}
            >
              <X className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ backgroundColor: '#ffffff' }}
          >
            {messages.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full text-center"
                style={{ color: '#6B7280' }}
              >
                <Sparkles className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">Hi there! I'm your guide</p>
                <p className="text-xs mt-1">
                  I'll provide tips and answer questions about your application.
                </p>
              </div>
            ) : (
              <>
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
                      <p className="text-xs leading-relaxed">{msg.text}</p>
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
              </>
            )}
          </div>

          {/* Input area */}
          <div
            className="px-4 py-3 border-t flex gap-2"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: '#FAFBFC',
            }}
          >
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
      )}
    </>
  );
}
