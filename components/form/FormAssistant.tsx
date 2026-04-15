'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { X, ChevronRight, Send } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

// ─── Per-step curated tips ───────────────────────────────────────────────────

interface StepTip {
  headline: string;
  bullets: string[];
}

const STEP_TIPS: Record<string, StepTip> = {
  id_name: {
    headline: 'Your legal name',
    bullets: [
      'Enter your name exactly as it appears on your passport or driving licence.',
      'Irish applicants: include any Irish-language variations shown on your passport.',
    ],
  },
  id_dob: {
    headline: 'Date of birth',
    bullets: [
      'Borrowers must typically be 18 or over at application and under 70–75 at the end of the mortgage term, depending on the lender.',
    ],
  },
  id_contact: {
    headline: 'Contact details',
    bullets: [
      'Your email and phone number will be used for identity checks and correspondence.',
      'Make sure both are active — lenders and your adviser will use them throughout the process.',
    ],
  },
  id_nationality: {
    headline: 'Nationality & right to reside',
    bullets: [
      'UK and Irish lenders require evidence of your right to remain if you are a non-EEA national.',
      'EU citizens with settled or pre-settled status are generally eligible.',
    ],
  },
  id_ni_pps: {
    headline: 'National Insurance / PPS number',
    bullets: [
      'UK: this is your National Insurance number (e.g. AB 12 34 56 C).',
      'Ireland: this is your PPS number, used for credit referencing and identity checks.',
    ],
  },
  id_address: {
    headline: 'Current address',
    bullets: [
      'Include your full postcode (UK) or Eircode (Ireland).',
      'Most lenders require 3 years of continuous address history for credit checks.',
    ],
  },
  id_address_history: {
    headline: 'Address history',
    bullets: [
      'Most lenders require at least 3 years of continuous address history.',
      'Include all addresses you have lived at, even if only briefly.',
    ],
  },
  id_upload_photo: {
    headline: 'Photo ID',
    bullets: [
      'Upload a valid passport or full driving licence.',
      'Irish applicants: an Irish passport card is also acceptable.',
      'Make sure all four corners are visible and the document is in date.',
    ],
  },
  hh_circumstances: {
    headline: 'Personal circumstances',
    bullets: [
      'Lenders use relationship status and household composition to calculate affordability.',
      'Be accurate — this information forms part of your legal application.',
    ],
  },
  hh_application_mode: {
    headline: 'Sole or joint application',
    bullets: [
      "A joint application combines both applicants' incomes, which can increase your borrowing power.",
      'Both applicants will be jointly and severally liable for the mortgage.',
    ],
  },
  hh_second_applicant: {
    headline: 'Co-applicant details',
    bullets: [
      "Enter the co-applicant's details exactly as they appear on their ID.",
      'Both applicants will need to provide identity, employment, and income documents.',
    ],
  },
  hh_dependants: {
    headline: 'Dependants',
    bullets: [
      'Include all children and other dependants you financially support.',
      'Ireland: Central Bank rules apply up to a 3.5× income multiplier. UK: typically 4–4.5×.',
      'More dependants can reduce the maximum amount you can borrow.',
    ],
  },
  intent_type: {
    headline: 'Mortgage type',
    bullets: [
      'Residential purchase: buying a home to live in.',
      'Remortgage: switching lender or releasing equity on a home you already own.',
      'Buy-to-let: buying a property to rent out — different rules and stamp duty apply.',
    ],
  },
  intent_remortgage: {
    headline: 'Remortgage details',
    bullets: [
      "You'll need your current lender name, outstanding balance, and monthly payment.",
      "Have your most recent mortgage statement to hand — you'll upload it shortly.",
    ],
  },
  intent_btl: {
    headline: 'Buy-to-let',
    bullets: [
      'Lenders typically require rental income to cover 125–145% of the monthly mortgage payment.',
      'Stamp duty surcharges apply for additional properties in both the UK and Ireland.',
      'An interest-only mortgage is the most common structure for buy-to-let.',
    ],
  },
  intent_timeline: {
    headline: 'Your timeline',
    bullets: [
      'An Agreement in Principle (AIP) is usually valid for 90 days.',
      'A full mortgage offer is issued once you have identified a specific property.',
    ],
  },
  prop_stage: {
    headline: 'Property stage',
    bullets: [
      'You can get an AIP before you have found a property — it shows sellers you are serious.',
      'A full mortgage offer requires a specific property address and a lender valuation.',
    ],
  },
  prop_details: {
    headline: 'Property details',
    bullets: [
      'Leasehold properties need a minimum remaining lease term — typically 70+ years for mortgage eligibility.',
      'New builds may have specific lender restrictions or require a larger deposit.',
    ],
  },
  prop_value: {
    headline: 'Property value & LTV',
    bullets: [
      'LTV (loan-to-value) is the ratio of your mortgage to the property value.',
      'Lower LTV typically means better interest rates.',
      'Most lenders offer improved rates at 60%, 75%, 80%, and 90% LTV thresholds.',
    ],
  },
  dep_amount: {
    headline: 'Deposit amount',
    bullets: [
      'UK: minimum 5% deposit for a government-backed scheme; 10% or more gives better rates.',
      'Ireland (first-time buyers): minimum 10% under Central Bank rules.',
      'Ireland (second and subsequent buyers): minimum 20%.',
    ],
  },
  dep_source: {
    headline: 'Deposit source',
    bullets: [
      'All deposit funds must be evidenced and declared — this is a legal anti-money laundering requirement.',
      'Common sources: savings, family gift, inheritance, proceeds from a property sale, Help to Buy.',
    ],
  },
  dep_gift_details: {
    headline: 'Gifted deposit',
    bullets: [
      'Lenders require a signed letter from the donor confirming the amount, relationship, and that it is non-repayable.',
      "The donor's bank statements showing the source of funds may also be required.",
    ],
  },
  emp_status: {
    headline: 'Employment status',
    bullets: [
      'PAYE employees, self-employed, contractors, and retired applicants are each assessed differently.',
      'Choose the option that best describes your current main source of income.',
    ],
  },
  emp_details: {
    headline: 'Employment details',
    bullets: [
      'Lenders typically require a minimum of 6–12 months with your current employer.',
      'If you are still in a probation period, some lenders will not proceed until it ends.',
    ],
  },
  emp_self_employed: {
    headline: 'Self-employment',
    bullets: [
      'UK: 2–3 years of SA302 forms (HMRC tax calculations) and tax year overviews are required.',
      "Ireland: 2–3 years of certified business accounts and often an accountant's reference letter.",
    ],
  },
  emp_upload_payslips: {
    headline: 'Payslips',
    bullets: [
      'Most lenders require your 3 most recent consecutive payslips.',
      'Payslips must show your employer name, your name, tax code, and payment date.',
    ],
  },
  emp_upload_tax: {
    headline: 'Tax returns',
    bullets: [
      'UK: upload SA302 forms downloaded from your HMRC online account.',
      'Ireland: upload Form 11 submissions or certified accounts from your accountant.',
    ],
  },
  inc_salary: {
    headline: 'Your salary',
    bullets: [
      'Enter your gross annual salary — before tax and deductions.',
      'If you receive a regular bonus, your lender may use a different income multiple for that portion.',
    ],
  },
  inc_additional: {
    headline: 'Additional income',
    bullets: [
      'Include overtime, commission, bonuses, rental income, dividends, or state benefits.',
      'Variable income (e.g. commission) is often averaged over 2–3 years by lenders.',
      'Regular guaranteed overtime is usually fully accepted.',
    ],
  },
  inc_upload_bank: {
    headline: 'Bank statements',
    bullets: [
      'Most lenders require the 3 most recent months of all current and savings accounts.',
      'Statements must show your name, account number, sort code, and a regular salary credit.',
    ],
  },
  commit_outgoings: {
    headline: 'Monthly outgoings',
    bullets: [
      'Include all personal loans, credit card minimum payments, car finance, and hire purchase agreements.',
      'Lenders use this to stress-test affordability at higher interest rates.',
    ],
  },
  commit_childcare: {
    headline: 'Childcare costs',
    bullets: [
      'Include nursery fees, childminder costs, after-school clubs, and private school fees.',
      "This is a significant line item in lenders' affordability models.",
    ],
  },
  pm_affordability: {
    headline: 'Affordability overview',
    bullets: [
      'This gives you an estimate of what you can borrow based on the information provided.',
      'Speak to your mortgage adviser for a formal assessment and a personalised recommendation.',
    ],
  },
  ag_declarations: {
    headline: 'Declarations',
    bullets: [
      'Read each point carefully — these confirm the accuracy of your application.',
      'Making a false statement on a mortgage application is a criminal offence in both the UK and Ireland.',
    ],
  },
  ag_signature: {
    headline: 'Your signature',
    bullets: [
      'Your electronic signature confirms all information is true and complete.',
      'By signing, you consent to credit and identity checks by your adviser and lenders.',
    ],
  },
  docs_overview: {
    headline: 'Documents checklist',
    bullets: [
      'Accepted formats: PDF, JPG, or PNG. All four corners of physical documents must be visible.',
      'Payslips and bank statements should be dated within the last 3 months. Photo ID must be in date.',
    ],
  },
  completion: {
    headline: "You're done!",
    bullets: [
      'LendWell will review your information and prepare your application for lenders.',
      'Your adviser will be in touch to discuss suitability and next steps.',
    ],
  },
};

// Steps where we should NOT auto-show the assistant
const SILENT_STEPS = new Set([
  'welcome', 'orientation', 'intro_about_you', 'intro_property_mortgage',
  'intro_employment_income', 'intro_documents', 'intro_agreements', 'completion',
]);

// ─── Component ───────────────────────────────────────────────────────────────

interface FormAssistantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormAssistant({ isOpen, onOpenChange }: FormAssistantProps) {
  const { currentStep, state, currentSectionId } = useApplication();
  const [mode, setMode] = useState<'tip' | 'chat'>('tip');
  const [inputValue, setInputValue] = useState('');

  // Generative reveal state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [revealedBullets, setRevealedBullets] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastAutoStepRef = useRef<string | null>(null);

  const tip = STEP_TIPS[currentStep];

  // Trigger the generative reveal sequence
  const triggerGenerate = (bullets: string[]) => {
    // Clear any in-progress timers
    generateTimerRef.current.forEach(clearTimeout);
    generateTimerRef.current = [];
    setIsGenerating(true);
    setShowHeadline(false);
    setRevealedBullets(0);

    // After thinking delay, cascade reveal
    const t1 = setTimeout(() => {
      setIsGenerating(false);
      setShowHeadline(true);
      bullets.forEach((_, i) => {
        const t = setTimeout(() => {
          setRevealedBullets(i + 1);
        }, 100 + i * 130);
        generateTimerRef.current.push(t);
      });
    }, 700);
    generateTimerRef.current.push(t1);
  };

  // Auto-open with 1.5s delay on step change (question steps only)
  useEffect(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (SILENT_STEPS.has(currentStep) || !tip) return;
    if (lastAutoStepRef.current === currentStep) return;

    autoTimerRef.current = setTimeout(() => {
      lastAutoStepRef.current = currentStep;
      setMode('tip');
      onOpenChange(true);
    }, 1500);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Trigger generative animation when panel opens or step changes while open
  useEffect(() => {
    if (!isOpen || mode !== 'tip') return;
    if (tip) {
      triggerGenerate(tip.bullets);
    }
    return () => {
      generateTimerRef.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isOpen]);

  // Reset to tip mode when step changes
  useEffect(() => {
    setMode('tip');
  }, [currentStep]);

  // AI chat transport
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

  const { messages, sendMessage, status, setMessages } = useChat({ transport });
  const isTyping = status === 'submitted' || status === 'streaming';

  // Seed intro message when switching to chat
  const handleExpandToChat = () => {
    if (messages.length === 0) {
      const tipHeadline = tip?.headline ?? 'this step';
      setMessages([
        {
          id: 'assistant-intro',
          role: 'assistant',
          parts: [{ type: 'text', text: `Happy to help with ${tipHeadline.toLowerCase()}. What would you like to know?` }],
        },
      ]);
    }
    setMode('chat');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (mode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mode]);

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;
    sendMessage({ text: inputValue });
    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="form-assistant-panel"
      style={{
        position: 'fixed',
        top: '68px',
        right: '12px',
        zIndex: 60,
        width: '280px',
        borderRadius: '14px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 24px rgba(24,32,38,0.10), 0 1px 4px rgba(24,32,38,0.06)',
        border: '1px solid rgba(49,38,227,0.10)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header — light, airy */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '11px 12px 10px',
          borderBottom: '1px solid rgba(49,38,227,0.07)',
          backgroundColor: '#F7F8FF',
        }}
      >
        {/* LendWell AI logo */}
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '7px',
            background: 'linear-gradient(135deg, rgba(49,38,227,0.12) 0%, rgba(71,63,230,0.18) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            animation: isGenerating ? 'sparkle-pulse 1s ease-in-out infinite' : 'none',
          }}
        >
          <img
            src="/images/lendwell-ai-logo.svg"
            alt=""
            style={{ width: '13px', height: '13px' }}
          />
        </div>
        <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#3126E3', letterSpacing: '0.01em' }}>
          Application Guide
        </span>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close assistant"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <X className="w-3 h-3" style={{ color: '#9CA3AF' }} />
        </button>
      </div>

      {/* Tip mode */}
      {mode === 'tip' && (
        <div style={{ padding: '13px 14px 12px' }}>

          {/* Generating state — bouncing dots */}
          {isGenerating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '2px' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(49,38,227,0.35)',
                    animation: 'thinking-bounce 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Headline */}
          {!isGenerating && tip && showHeadline && (
            <p
              className="assistant-reveal"
              style={{ fontSize: '12px', fontWeight: 700, color: '#182026', marginBottom: '8px' }}
            >
              {tip.headline}
            </p>
          )}

          {/* Bullets */}
          {!isGenerating && tip && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tip.bullets.map((b, i) =>
                i < revealedBullets ? (
                  <li
                    key={i}
                    className="assistant-reveal"
                    style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}
                  >
                    <div
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(49,38,227,0.4)',
                        flexShrink: 0,
                        marginTop: '6px',
                      }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#42535F', lineHeight: '1.6' }}>
                      {b}
                    </span>
                  </li>
                ) : null
              )}
            </ul>
          )}

          {/* No tip fallback */}
          {!isGenerating && !tip && (
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#5A7387', lineHeight: '1.6' }}>
              Have a question about this step? Ask LendWell for help.
            </p>
          )}

          {/* Ask a follow-up — only show after content has revealed */}
          {!isGenerating && (tip ? revealedBullets >= tip.bullets.length : true) && (
            <button
              type="button"
              onClick={handleExpandToChat}
              className="assistant-reveal"
              style={{
                marginTop: '11px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(49,38,227,0.12)',
                backgroundColor: 'rgba(49,38,227,0.04)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                color: '#3126E3',
              }}
            >
              Ask a follow-up
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Chat mode */}
      {mode === 'chat' && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '260px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {messages.map((msg) => {
              const text = msg.parts
                .filter((p) => p.type === 'text')
                .map((p) => (p as { type: 'text'; text: string }).text)
                .join('');
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '86%',
                      padding: '7px 10px',
                      borderRadius: isUser ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                      backgroundColor: isUser ? '#3126E3' : '#F7F8FC',
                      color: isUser ? '#ffffff' : '#182026',
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '1.55',
                    }}
                  >
                    {text}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px 10px 10px 2px',
                    backgroundColor: '#F7F8FC',
                    display: 'flex',
                    gap: '3px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(49,38,227,0.35)',
                        animation: 'thinking-bounce 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid rgba(49,38,227,0.07)',
              display: 'flex',
              gap: '7px',
              alignItems: 'center',
              backgroundColor: '#F7F8FF',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a question…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSend();
                }
              }}
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(49,38,227,0.12)',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                fontWeight: 500,
                color: '#182026',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: inputValue.trim() && !isTyping ? '#3126E3' : 'rgba(49,38,227,0.08)',
                border: 'none',
                cursor: inputValue.trim() && !isTyping ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 150ms ease',
              }}
            >
              <Send
                className="w-3.5 h-3.5"
                style={{ color: inputValue.trim() && !isTyping ? '#ffffff' : 'rgba(49,38,227,0.3)' }}
              />
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes thinking-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes assistant-reveal {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .assistant-reveal {
          animation: assistant-reveal 180ms ease-out both;
        }
        .form-assistant-panel {
          animation: assistant-slide-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes assistant-slide-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
