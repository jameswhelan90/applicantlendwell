'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Image from 'next/image';
import { useApplication, StepId, STEP_LABELS } from '@/context/ApplicationContext';
import { X, Lightbulb, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Send, Loader2, MessageSquare } from 'lucide-react';

// LendWell Logo component for consistent branding
const LendWellAILogo = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <Image
    src="/images/lendwell-ai-logo.svg"
    alt="LendWell"
    width={size}
    height={size}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// ─── Types ────────────────────────────────────────────────────────────────────

type InsightType = 'tip' | 'warning' | 'success' | 'info';

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface StepInsights {
  [key: string]: Insight[];
}

// ─── Step-specific insights configuration ─────────────────────────────────────

const STEP_INSIGHTS: StepInsights = {
  fp_name: [
    {
      id: 'name-legal',
      type: 'tip',
      title: 'Use your legal name',
      message: 'Enter your name exactly as it appears on official documents like your passport or driving licence.',
    },
  ],
  fp_dob: [
    {
      id: 'dob-age',
      type: 'info',
      title: 'Age requirements',
      message: 'Most lenders require applicants to be at least 18 years old and under 75 at the end of the mortgage term.',
    },
  ],
  fp_contact: [
    {
      id: 'contact-verify',
      type: 'tip',
      title: 'Verification required',
      message: 'We\'ll send a verification code to your email and phone number to confirm your contact details.',
    },
  ],
  fp_income: [
    {
      id: 'income-accuracy',
      type: 'warning',
      title: 'Be accurate',
      message: 'Your income will be verified against payslips and tax returns. Inaccurate figures may delay your application.',
    },
    {
      id: 'income-bonus',
      type: 'tip',
      title: 'Include all income',
      message: 'Don\'t forget to include bonuses, overtime, and any additional income sources.',
    },
  ],
  fp_outgoings: [
    {
      id: 'outgoings-all',
      type: 'tip',
      title: 'Include all commitments',
      message: 'List all regular payments including subscriptions, childcare, and any other recurring expenses.',
    },
  ],
  fp_deposit: [
    {
      id: 'deposit-source',
      type: 'warning',
      title: 'Source of funds',
      message: 'Lenders require proof of where your deposit comes from. Keep documentation ready.',
    },
  ],
  fp_employment_status: [
    {
      id: 'employment-type',
      type: 'info',
      title: 'Employment matters',
      message: 'Different employment types may require different documentation. Self-employed applicants typically need 2-3 years of accounts.',
    },
  ],
  docs_overview: [
    {
      id: 'docs-lendwell',
      type: 'success',
      title: 'LendWell checks your documents',
      message: 'LendWell securely reviews your documents to confirm details and reduce errors, saving you time.',
    },
  ],
  hh_property: [
    {
      id: 'property-valuation',
      type: 'info',
      title: 'Property valuation',
      message: 'We\'ll arrange an independent valuation once your application progresses.',
    },
  ],
  ag_declarations: [
    {
      id: 'declarations-read',
      type: 'warning',
      title: 'Read carefully',
      message: 'Please read each declaration carefully before agreeing. These are legally binding statements.',
    },
  ],
};

// ─── Helper functions ─────────────────────────────────────────────────────────

function getInsightIcon(type: InsightType) {
  switch (type) {
    case 'tip':
      return <Lightbulb className="w-4 h-4" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />;
    case 'success':
      return <CheckCircle2 className="w-4 h-4" />;
case 'info':
  default:
    return <LendWellAILogo size={16} />;
  }
}

function getInsightColors(type: InsightType) {
  switch (type) {
    case 'tip':
      // Warning palette for tips/attention
      return { bg: '#FFF6EA', border: '#E07900', icon: '#E07900', text: '#653701' };
    case 'warning':
      // Danger palette for warnings/errors
      return { bg: '#FFEAF1', border: '#CC013D', icon: '#CC013D', text: '#7B0024' };
    case 'success':
      // Success palette
      return { bg: '#EEFDD9', border: '#6CAD0A', icon: '#6CAD0A', text: '#3C6006' };
    case 'info':
    default:
      // Indigo palette for info
      return { bg: '#EDECFD', border: '#3126E3', icon: '#3126E3', text: '#090736' };
  }
}

// Helper to extract text from message parts
function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return '';
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text)
    .join('');
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FormIntelligenceDialog() {
  const { currentStep, state, isModalOpen } = useApplication();
  const [isMinimized, setIsMinimized] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(currentStep);

  // Create transport with dynamic body for form context
  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/assistant',
    prepareSendMessagesRequest: ({ messages }) => ({
      body: {
        messages,
        step: currentStep,
        formData: state.data || {},
      },
    }),
  }), [currentStep, state.data]);

  // Use AI SDK useChat hook with streaming
  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    id: `form-intelligence-${currentStep}`,
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Get insights for current step
  const currentInsights = (STEP_INSIGHTS[currentStep] || []).filter(
    (insight) => !dismissedInsights.includes(insight.id)
  );

  // Dynamic insights based on form data
  const dynamicInsights: Insight[] = [];

  // Check income vs outgoings ratio
  if (currentStep === 'fp_outgoings' && state.data?.annualIncome && state.data?.monthlyOutgoings) {
    const monthlyIncome = (state.data.annualIncome as number) / 12;
    const ratio = (state.data.monthlyOutgoings as number) / monthlyIncome;
    if (ratio > 0.5) {
      dynamicInsights.push({
        id: 'high-outgoings',
        type: 'warning',
        title: 'High commitments detected',
        message: `Your monthly commitments are ${Math.round(ratio * 100)}% of your income. This may affect your borrowing capacity.`,
      });
    }
  }

  // Check deposit percentage
  if (currentStep === 'fp_deposit' && state.data?.depositAmount && state.data?.propertyValue) {
    const ltv = (((state.data.propertyValue as number) - (state.data.depositAmount as number)) / (state.data.propertyValue as number)) * 100;
    if (ltv <= 80) {
      dynamicInsights.push({
        id: 'good-ltv',
        type: 'success',
        title: 'Great deposit!',
        message: `With a ${Math.round(100 - ltv)}% deposit, you may qualify for better interest rates.`,
      });
    } else if (ltv > 90) {
      dynamicInsights.push({
        id: 'high-ltv',
        type: 'info',
        title: 'Consider saving more',
        message: `A ${Math.round(100 - ltv)}% deposit means higher LTV. Aim for 10%+ to access better rates.`,
      });
    }
  }

  const allInsights = [...currentInsights, ...dynamicInsights];

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat when step changes
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      setMessages([]);
      setIsChatMode(false);
      setIsMinimized(false);
      prevStepRef.current = currentStep;
    }
  }, [currentStep, setMessages]);

  const handleDismiss = useCallback((id: string) => {
    setDismissedInsights((prev) => [...prev, id]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || isLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    await sendMessage({ text: userMessage });
  }, [chatInput, isLoading, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Don't render if modal not open or on welcome/completion
  if (!isModalOpen || currentStep === 'welcome' || currentStep === 'completion') {
    return null;
  }

  // Show panel if we have insights OR chat has started
  const shouldShow = allInsights.length > 0 || isChatMode || messages.length > 0;
  
  if (!shouldShow && !isChatMode) {
    // Show minimized state to allow opening chat
    return (
      <div
        className="fixed z-50"
        style={{
          top: '100px',
          right: '24px',
        }}
      >
        <button
          onClick={() => {
            setIsMinimized(false);
            setIsChatMode(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-98"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          >
            <LendWellAILogo size={24} />
          </div>
          <span className="text-sm font-medium" style={{ color: '#182026' }}>
            Ask LendWell
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 transition-all duration-200"
      style={{
        top: '100px',
        right: '24px',
        width: isMinimized ? 'auto' : '340px',
      }}
    >
      {isMinimized ? (
        /* Minimized state - floating pill */
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full btn-interactive"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
          }}
        >
<div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          <LendWellAILogo size={28} />
        </div>
          <span className="text-sm font-medium" style={{ color: '#182026' }}>
            {isChatMode ? 'LendWell Guide' : `${allInsights.length} insight${allInsights.length !== 1 ? 's' : ''}`}
          </span>
        </button>
      ) : (
        /* Expanded panel */
        <div
          className="overflow-hidden shadow-xl animate-in fade-in slide-in-from-right-2 duration-200"
          style={{
            backgroundColor: '#ffffff',
            border: 'none',
            borderRadius: '8px',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid #F1F3F7' }}
          >
<div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                >
                  <LendWellAILogo size={32} />
                </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#182026' }}>
                  Application Guide
                </p>
                <p className="text-[11px] font-semibold" style={{ color: '#6B7280' }}>
                  Powered by LendWell
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-md icon-btn"
                aria-label="Minimize"
              >
                <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />
              </button>
              <button
                onClick={() => {
                  setIsMinimized(true);
                  setIsChatMode(false);
                }}
                className="p-1.5 rounded-md icon-btn"
                aria-label="Close"
              >
                <X className="w-4 h-4" style={{ color: '#6B7280' }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: isChatMode ? '350px' : '280px' }}
          >
            {!isChatMode ? (
              /* Insights view */
              <div className="p-4 space-y-3">
                {allInsights.map((insight) => {
                  const colors = getInsightColors(insight.type);
                  return (
                    <div
                      key={insight.id}
                      className="p-3 rounded-lg relative group card-interactive"
                      style={{
                        backgroundColor: colors.bg,
                        borderLeft: `3px solid ${colors.border}`,
                        border: 'none',
                        borderLeftWidth: '3px',
                        borderLeftStyle: 'solid',
                        borderLeftColor: colors.border,
                      }}
                    >
                      {/* Dismiss button */}
                      <button
                        onClick={() => handleDismiss(insight.id)}
                        className="absolute top-2 right-2 p-1 rounded icon-btn opacity-0 group-hover:opacity-100"
                        style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                        aria-label="Dismiss"
                      >
                        <X className="w-3 h-3" style={{ color: colors.text }} />
                      </button>

                      <div className="flex items-start gap-2.5 pr-6">
                        <div
                          className="flex-shrink-0 mt-0.5"
                          style={{ color: colors.icon }}
                        >
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold mb-0.5"
                            style={{ color: colors.text }}
                          >
                            {insight.title}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: colors.text, opacity: 0.85 }}>
                            {insight.message}
                          </p>
                          {insight.actionLabel && (
                            <button
                              onClick={insight.onAction}
                              className="text-xs font-semibold mt-2 underline underline-offset-2"
                              style={{ color: colors.icon }}
                            >
                              {insight.actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {allInsights.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No insights for this step</p>
                  </div>
                )}
              </div>
            ) : (
              /* Chat view */
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {messages.length === 0 ? (
<div className="text-center py-8">
                        <div className="mx-auto mb-2 w-10 h-10 opacity-60">
                          <LendWellAILogo size={40} />
                        </div>
                      <p className="text-sm text-muted-foreground">
                        Ask me anything about this step
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        I can help with {STEP_LABELS[currentStep] || 'your application'}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const text = getMessageText(msg);
                      if (!text) return null;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className="px-3 py-2 max-w-[85%]"
                            style={{
                              backgroundColor: msg.role === 'user' ? '#3126E3' : '#F7F8FC',
                              color: msg.role === 'user' ? '#ffffff' : '#182026',
                              borderRadius: '4px',
                            }}
                          >
                            <p className="text-xs leading-relaxed whitespace-pre-wrap font-semibold">{text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div
                        className="px-3 py-2 flex items-center gap-2"
                        style={{ backgroundColor: '#F7F8FC', borderRadius: '4px' }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#3126E3' }} />
                        <span className="text-xs" style={{ color: '#6B7280' }}>Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Footer with chat input */}
          <div
            className="px-4 py-3"
            style={{ borderTop: '1px solid #F1F3F7' }}
          >
            {isChatMode ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about this step..."
                  className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus-ring"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    transition: 'border-color 120ms ease-out',
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isLoading}
                  className="p-2 rounded-lg btn-interactive disabled:opacity-50"
                  style={{ backgroundColor: '#3126E3', color: '#ffffff' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsChatMode(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg row-interactive"
                style={{ color: '#473FE6' }}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Ask LendWell</span>
              </button>
            )}

            {isChatMode && (
              <button
                onClick={() => setIsChatMode(false)}
                className="w-full text-center mt-2 text-xs text-muted-foreground transition-interaction focus-ring"
              >
                Back to insights
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
