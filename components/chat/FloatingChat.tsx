'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, Phone, Mail, MessageSquare } from 'lucide-react';
import { useChat as useChatPanel } from '@/context/ChatContext';
import { useApplication } from '@/context/ApplicationContext';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

type ChatTab = 'ai' | 'adviser';

interface AdviserMessage {
  id: string;
  sender: 'user' | 'adviser';
  text: string;
  timestamp: Date;
}

const ADVISER_INITIAL: AdviserMessage = {
  id: 'adviser-intro',
  sender: 'adviser',
  text: "Hi there! I'm Ciara, your dedicated mortgage adviser. Send me a message and I'll get back to you as soon as I can.",
  timestamp: new Date(),
};

interface FloatingChatProps {
  hideButton?: boolean;
}

export function FloatingChat({ hideButton = false }: FloatingChatProps) {
  const { isChatOpen: isOpen, closeChat, toggleChat } = useChatPanel();
  const { isModalOpen, currentStep, state, currentSectionId } = useApplication();
  const [activeTab, setActiveTab] = useState<ChatTab>('adviser');
  const [adviserMessages, setAdviserMessages] = useState<AdviserMessage[]>([ADVISER_INITIAL]);
  const [adviserInput, setAdviserInput] = useState('');
  const [aiInputValue, setAiInputValue] = useState('');
  const [isAdviserTyping, setIsAdviserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Real AI chat transport — passes current step and form data as context
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/assistant',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            step: currentStep,
            sectionId: currentSectionId,
            formData: state.data ?? {},
          },
        }),
      }),
    [currentStep, currentSectionId, state.data]
  );

  const {
    messages: aiMessages,
    sendMessage,
    status: aiStatus,
    setMessages: setAiMessages,
  } = useChat({ transport });

  // Seed the intro message once on mount
  useEffect(() => {
    setAiMessages([
      {
        id: 'lendwell-intro',
        role: 'assistant',
        parts: [{ type: 'text', text: "Hello! I'm LendWell, your mortgage application guide. I can answer questions, explain terms, or help you through any step. How can I help?" }],
      },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAiTyping = aiStatus === 'submitted' || aiStatus === 'streaming';

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [adviserMessages, aiMessages, isAiTyping]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Dismiss on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeChat();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeChat]);

  // ── Adviser tab ──────────────────────────────────────────────────────────────
  const handleAdviserSend = () => {
    const text = adviserInput.trim();
    if (!text) return;
    const userMsg: AdviserMessage = { id: `user-${Date.now()}`, sender: 'user', text, timestamp: new Date() };
    setAdviserMessages((prev) => [...prev, userMsg]);
    setAdviserInput('');
    setIsAdviserTyping(true);
    setTimeout(() => {
      setIsAdviserTyping(false);
      setAdviserMessages((prev) => [
        ...prev,
        {
          id: `adviser-${Date.now()}`,
          sender: 'adviser',
          text: "Thanks for reaching out! I'll review your message and get back to you shortly. If it's urgent, feel free to use the Schedule Call option below.",
          timestamp: new Date(),
        },
      ]);
    }, 1800);
  };

  // ── LendWell tab ─────────────────────────────────────────────────────────────
  const handleAiSend = () => {
    const text = aiInputValue.trim();
    if (!text || isAiTyping) return;
    sendMessage({ text });
    setAiInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      activeTab === 'adviser' ? handleAdviserSend() : handleAiSend();
    }
  };

  const currentInput = activeTab === 'adviser' ? adviserInput : aiInputValue;
  const setCurrentInput = activeTab === 'adviser' ? setAdviserInput : setAiInputValue;
  const placeholder = activeTab === 'adviser' ? 'Message Ciara...' : 'Ask LendWell...';

  const PANEL_WIDTH = 360;
  const PANEL_HEIGHT = 520;
  const GAP = 12;

  const anchoredStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: `${24 + 52 + GAP}px`,
    left: '24px',
    zIndex: 50,
  };

  // Extract text from an AI SDK message — check parts first, fall back to content string
  const getMessageText = (msg: (typeof aiMessages)[number]): string => {
    if (Array.isArray(msg.parts)) {
      const fromParts = msg.parts
        .filter((p) => p.type === 'text')
        .map((p) => (p as { type: 'text'; text: string }).text)
        .join('');
      if (fromParts) return fromParts;
    }
    const content = (msg as { content?: string }).content;
    if (typeof content === 'string' && content) return content;
    return '';
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
            <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '20px 20px 0 20px' }}>
              <div>
                <p className="font-bold" style={{ fontSize: '18px', color: '#182026', lineHeight: 1.2 }}>
                  {activeTab === 'adviser' ? 'Ciara Murphy' : 'LendWell'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#677183' }}>
                  {activeTab === 'adviser' ? 'Your mortgage adviser' : 'Your mortgage guide'}
                </p>
              </div>
              <button
                onClick={closeChat}
                aria-label="Close chat"
                className="flex items-center justify-center btn-interactive"
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#3126E3', border: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-shrink-0" style={{ padding: '16px 20px 0 20px', borderBottom: '1px solid #E5E7EB', gap: '24px' }}>
              {(['ai', 'adviser'] as ChatTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="pb-3 text-sm font-semibold transition-interaction focus-ring relative"
                  style={{ color: activeTab === tab ? '#182026' : '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px 0' }}
                >
                  {tab === 'ai' ? 'LendWell' : 'Ciara'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0" style={{ height: '2px', backgroundColor: '#3126E3', borderRadius: '2px 2px 0 0' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ── Adviser tab messages ── */}
              {activeTab === 'adviser' && (
                <>
                  {adviserMessages.map((msg) => {
                    if (msg.sender === 'user') {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div style={{ maxWidth: '80%', backgroundColor: '#3126E3', color: '#ffffff', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', fontSize: '14px', lineHeight: '1.5' }}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={msg.id} className="flex gap-3 items-start">
                        <img src="/images/adviser-avatar.jpg" alt="Ciara Murphy" className="flex-shrink-0 object-cover" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold" style={{ color: '#182026' }}>Ciara Murphy</span>
                          <div style={{ backgroundColor: '#F7F8FC', borderRadius: '2px 12px 12px 12px', padding: '12px 14px', fontSize: '14px', lineHeight: '1.6', color: '#182026', border: '1px solid #E5E7EB' }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isAdviserTyping && <TypingIndicator name="Ciara Murphy" isAdviser />}
                </>
              )}

              {/* ── LendWell tab messages ── */}
              {activeTab === 'ai' && (
                <>
                  {aiMessages.map((msg) => {
                    const text = getMessageText(msg);
                    if (!text) return null;
                    if (msg.role === 'user') {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div style={{ maxWidth: '80%', backgroundColor: '#3126E3', color: '#ffffff', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', fontSize: '14px', lineHeight: '1.5' }}>
                            {text}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={msg.id} className="flex gap-3 items-start">
                        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EDECFD', border: '1px solid #D9D7FF' }}>
                          <img src="/images/lendwell-ai-logo.svg" alt="" className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold" style={{ color: '#182026' }}>LendWell</span>
                          <div style={{ backgroundColor: '#F7F8FC', borderRadius: '2px 12px 12px 12px', padding: '12px 14px', fontSize: '14px', lineHeight: '1.6', color: '#182026', border: '1px solid #E5E7EB' }}>
                            {text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isAiTyping && <TypingIndicator name="LendWell" isAdviser={false} />}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Adviser action buttons */}
            {activeTab === 'adviser' && (
              <div className="flex gap-3 flex-shrink-0" style={{ padding: '0 20px 16px 20px' }}>
                <button className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold chat-action" style={{ padding: '10px 12px', border: '1.5px solid #E1E8EE', borderRadius: '999px', color: '#182026', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                  <Phone className="w-3.5 h-3.5" /> Schedule Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold chat-action" style={{ padding: '10px 12px', border: '1.5px solid #E1E8EE', borderRadius: '999px', color: '#182026', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                  <Mail className="w-3.5 h-3.5" /> Send Email
                </button>
              </div>
            )}

            {/* Input */}
            <div className="flex-shrink-0" style={{ padding: '0 20px 20px 20px' }}>
              <div className="flex items-center gap-2" style={{ border: '1.5px solid #D9D7FF', borderRadius: '12px', padding: '10px 12px', backgroundColor: '#ffffff' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={activeTab === 'ai' && isAiTyping}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: '#182026' }}
                />
                <button
                  onClick={activeTab === 'adviser' ? handleAdviserSend : handleAiSend}
                  disabled={!currentInput.trim() || (activeTab === 'ai' && isAiTyping)}
                  aria-label="Send message"
                  className="icon-btn rounded-full p-1"
                  style={{ background: 'none', border: 'none', cursor: currentInput.trim() ? 'pointer' : 'default', opacity: currentInput.trim() && !(activeTab === 'ai' && isAiTyping) ? 1 : 0.4 }}
                >
                  <Send className="w-4 h-4" style={{ color: '#3126E3' }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating trigger */}
      {!isModalOpen && !hideButton && (
        <button
          onClick={() => toggleChat()}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          className="flex items-center gap-2.5 btn-interactive"
          style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 51, backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '999px', padding: '10px 18px 10px 12px', cursor: 'pointer' }}
        >
          <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3126E3', flexShrink: 0 }}>
            {isOpen ? <X className="w-4 h-4 text-white" /> : <MessageSquare className="w-4 h-4 text-white" />}
          </div>
          <span className="text-sm font-semibold" style={{ color: '#182026' }}>Chat with us</span>
        </button>
      )}
    </>
  );
}

function TypingIndicator({ name, isAdviser }: { name: string; isAdviser: boolean }) {
  return (
    <div className="flex gap-3 items-start">
      {isAdviser ? (
        <img src="/images/adviser-avatar.jpg" alt={name} className="flex-shrink-0 object-cover" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
      ) : (
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE' }}>
          <img src="/images/lendwell-ai-logo.svg" alt="" className="w-4 h-4" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold" style={{ color: '#182026' }}>{name}</span>
        <div style={{ backgroundColor: '#F7F8FC', borderRadius: '2px 12px 12px 12px', padding: '14px 16px', border: '1px solid #E5E7EB', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#9CA3AF', animation: 'typing-bounce 1.1s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
