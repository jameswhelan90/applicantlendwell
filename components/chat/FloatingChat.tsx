'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Phone, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApplication } from '@/context/ApplicationContext';

type ChatTab = 'ai' | 'adviser';

interface Message {
  id: string;
  sender: 'user' | 'adviser' | 'ai';
  text: string;
  timestamp: Date;
}

const ADVISER_INITIAL: Message = {
  id: 'adviser-intro',
  sender: 'adviser',
  text: "Hi there! I'm Ciara, your dedicated mortgage adviser. Send me a message and I'll get back to you as soon as I can.",
  timestamp: new Date(),
};

const AI_INITIAL: Message = {
  id: 'ai-intro',
  sender: 'ai',
  text: "Hello! I'm here to help with your mortgage application. I can answer questions, explain terms, or guide you through any step. How can I help?",
  timestamp: new Date(),
};

interface FloatingChatProps {
  hideButton?: boolean;
}

export function FloatingChat({ hideButton = false }: FloatingChatProps) {
  const { isChatOpen: isOpen, anchorRect, openChat, closeChat, toggleChat } = useChat();
  const { isModalOpen } = useApplication();
  const [activeTab, setActiveTab] = useState<ChatTab>('adviser');
  const [adviserMessages, setAdviserMessages] = useState<Message[]>([ADVISER_INITIAL]);
  const [aiMessages, setAiMessages] = useState<Message[]>([AI_INITIAL]);
  const [inputValue, setInputValue] = useState('');
  const [isAdviserTyping, setIsAdviserTyping] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const messages = activeTab === 'adviser' ? adviserMessages : aiMessages;

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [adviserMessages, aiMessages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Dismiss on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeChat();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    if (activeTab === 'adviser') {
      setAdviserMessages((prev) => [...prev, userMsg]);
      // Show adviser typing indicator immediately, resolve after short delay
      setIsAdviserTyping(true);
      setTimeout(() => {
        setIsAdviserTyping(false);
        const adviserReply: Message = {
          id: `adviser-reply-${Date.now()}`,
          sender: 'adviser',
          text: "Thanks for reaching out! I'll review your message and get back to you shortly. If it's urgent, feel free to use the Schedule Call option below.",
          timestamp: new Date(),
        };
        setAdviserMessages((prev) => [...prev, adviserReply]);
      }, 1800);
    } else {
      setAiMessages((prev) => [...prev, userMsg]);
      // Show LendWell typing indicator immediately, resolve quickly
      setIsAiTyping(true);
      setTimeout(() => {
        setIsAiTyping(false);
        const aiReply: Message = {
          id: `ai-reply-${Date.now()}`,
          sender: 'ai',
          text: "Thanks for your message! I'm processing your question and will have an answer for you shortly. In the meantime, feel free to explore the other sections of your application.",
          timestamp: new Date(),
        };
        setAiMessages((prev) => [...prev, aiReply]);
      }, 1500);
    }

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholder = activeTab === 'adviser' ? 'Message Ciara...' : 'Ask LendWell...';

  // When an anchorRect is provided (bottom bar button), position the panel
  // directly above the triggering button, aligned to its right edge.
  const PANEL_WIDTH = 360;
  const PANEL_HEIGHT = 520;
  const GAP = 12; // space between panel bottom and button top

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Panel always anchors above the bottom-left trigger button
  const anchoredStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: `${24 + 52 + GAP}px`, // trigger height (~52px) + gap above it
    left: '24px',
    zIndex: 50,
  };

  return (
    <>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    <div ref={containerRef} style={anchoredStyle}>
      {/* Chat window */}
      {isOpen && (
        <div
          className="mb-3 flex flex-col"
          style={{
            width: `${PANEL_WIDTH}px`,
            height: `${PANEL_HEIGHT}px`,
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0px 8px 32px 0px rgba(24, 32, 38, 0.16)',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{ padding: '20px 20px 0 20px' }}
          >
            <div>
              <p
                className="font-bold"
                style={{ fontSize: '18px', color: '#182026', lineHeight: 1.2 }}
              >
                {activeTab === 'adviser' ? 'Ciara Murphy' : 'LendWell'}
              </p>
              {activeTab === 'adviser' && (
                <p className="text-xs mt-0.5" style={{ color: '#677183' }}>
                  Your mortgage adviser
                </p>
              )}
              {activeTab === 'ai' && (
                <p className="text-xs mt-0.5" style={{ color: '#677183' }}>
                  Your mortgage guide
                </p>
              )}
            </div>
            <button
              onClick={closeChat}
              aria-label="Close chat"
              className="flex items-center justify-center btn-interactive"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#3126E3',
                flexShrink: 0,
              }}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex flex-shrink-0"
            style={{ padding: '16px 20px 0 20px', borderBottom: '1px solid #E5E7EB', gap: '24px' }}
          >
            {(['ai', 'adviser'] as ChatTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="pb-3 text-sm font-semibold transition-interaction focus-ring relative"
                style={{
                  color: activeTab === tab ? '#182026' : '#9CA3AF',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 0 12px 0',
                }}
              >
                {tab === 'ai' ? 'LendWell' : 'Ciara'}
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: '2px',
                      backgroundColor: '#3126E3',
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Typing indicator — shown immediately when adviser/LendWell is responding */}
            {(activeTab === 'adviser' ? isAdviserTyping : isAiTyping) && (
              <div className="flex gap-3 items-start">
                {activeTab === 'ai' ? (
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                    }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: '#3126E3' }} />
                  </div>
                ) : (
                  <img
                    src="/images/adviser-avatar.jpg"
                    alt="Ciara Murphy"
                    className="flex-shrink-0 object-cover"
                    style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                  />
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: '#182026' }}>
                    {activeTab === 'ai' ? 'LendWell' : 'Ciara Murphy'}
                  </span>
                  <div
                    style={{
                      backgroundColor: '#F7F8FC',
                      borderRadius: '2px 12px 12px 12px',
                      padding: '14px 16px',
                      border: '1px solid #E5E7EB',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-block',
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
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

            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      style={{
                        maxWidth: '80%',
                        backgroundColor: '#3126E3',
                        color: '#ffffff',
                        borderRadius: '12px 12px 2px 12px',
                        padding: '10px 14px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              }

              const isAI = msg.sender === 'ai';

              return (
                <div key={msg.id} className="flex gap-3 items-start">
                  {/* Avatar */}
                  {isAI ? (
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#EDECFD',
                        border: '1px solid #D9D7FF',
                      }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: '#3126E3' }} />
                    </div>
                  ) : (
                    <img
                      src="/images/adviser-avatar.jpg"
                      alt="Ciara Murphy"
                      className="flex-shrink-0 object-cover"
                      style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                    />
                  )}

                  {/* Bubble */}
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#182026' }}
                    >
                      {isAI ? 'LendWell' : 'Ciara Murphy'}
                    </span>
                    <div
                      style={{
                        backgroundColor: '#F7F8FC',
                        borderRadius: '2px 12px 12px 12px',
                        padding: '12px 14px',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#182026',
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Action buttons (adviser tab only) */}
          {activeTab === 'adviser' && (
            <div
              className="flex gap-3 flex-shrink-0"
              style={{ padding: '0 20px 16px 20px' }}
            >
              <button
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold chat-action"
                style={{
                  padding: '10px 12px',
                  border: '1.5px solid #E1E8EE',
                  borderRadius: '999px',
                  color: '#182026',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <Phone className="w-3.5 h-3.5" />
                Schedule Call
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold chat-action"
                style={{
                  padding: '10px 12px',
                  border: '1.5px solid #E1E8EE',
                  borderRadius: '999px',
                  color: '#182026',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <Mail className="w-3.5 h-3.5" />
                Send Email
              </button>
            </div>
          )}

          {/* Input */}
          <div
            className="flex-shrink-0"
            style={{ padding: '0 20px 20px 20px' }}
          >
            <div
              className="flex items-center gap-2"
              style={{
                border: '1.5px solid #D9D7FF',
                borderRadius: '12px',
                padding: '10px 12px',
                backgroundColor: '#ffffff',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: '#182026' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                aria-label="Send message"
                className="icon-btn rounded-full p-1"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: inputValue.trim() ? 'pointer' : 'default',
                  opacity: inputValue.trim() ? 1 : 0.4,
                }}
              >
                <Send className="w-4 h-4" style={{ color: '#3126E3' }} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

      {/* Floating trigger button — always fixed to bottom-left, independent of panel position */}
      {!isModalOpen && !hideButton && (
        <button
          onClick={toggleChat}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          className="flex items-center gap-2.5 btn-interactive"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 51,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '999px',
            padding: '10px 18px 10px 12px',
            cursor: 'pointer',
          }}
        >
          {/* Icon bubble */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3126E3',
              flexShrink: 0,
            }}
          >
            {isOpen ? (
              <X className="w-4 h-4 text-white" />
            ) : (
              <MessageSquare className="w-4 h-4 text-white" />
            )}
          </div>
          <span
            className="text-sm font-semibold"
            style={{ color: '#182026' }}
          >
            Chat with us
          </span>
        </button>
      )}
    </>
  );
}
