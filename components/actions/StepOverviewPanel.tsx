'use client';

import { useApplication, SECTION_LABELS, SECTION_FIRST_STEP } from '@/context/ApplicationContext';
import { SectionId } from '@/types/tasks';
import { ChevronRight, Clock } from 'lucide-react';
import { CompletionSection } from './CompletionSection';
import { DocumentsUploadSection } from '@/components/documents/DocumentsUploadSection';

interface StepOverviewPanelProps {
  sectionId: SectionId;
  overrideTitle?: string;
}

export function StepOverviewPanel({ sectionId, overrideTitle }: StepOverviewPanelProps) {
  const { state, openModal, isSectionComplete } = useApplication();
  const section = state.sections.find((s) => s.id === sectionId);

  if (!section) return null;

  const isComplete = section.status === 'complete';
  const isInProgress = section.status === 'in_progress';
  const firstStep = SECTION_FIRST_STEP[sectionId];

  const mainSections = state.sections.filter(s => s.id !== 'collect_keys');
  const allSectionsComplete = mainSections.every(s => s.status === 'complete');

  if (sectionId === 'collect_keys') {
    return <CompletionSection isFullyComplete={allSectionsComplete} />;
  }

  if (sectionId === 'documents') {
    return <DocumentsUploadSection />;
  }

  const handleStartClick = () => {
    openModal(firstStep);
  };

  const overviewContent: Partial<Record<SectionId, { title: string; description: string; details: string[] }>> = {
    welcome: {
      title: "Let's get your mortgage journey started",
      description: 'Meet your adviser and find out what to expect as we prepare your application.',
      details: [
        'Get to know your dedicated adviser',
        'Understand how the process works',
        'See what lenders will look at',
      ],
    },
    about_you: {
      title: 'Tell us about yourself',
      description: 'We need a few personal details that lenders require to assess your application.',
      details: [
        'Your identity and contact details',
        'Your household situation',
        'Your address and residency information',
      ],
    },
    property_mortgage: {
      title: 'Property & mortgage',
      description: 'Tell us about the property you have in mind and how you plan to fund it.',
      details: [
        'What you want to buy or remortgage',
        'The estimated property value',
        'Your deposit and where it comes from',
      ],
    },
    employment_income: {
      title: 'Employment & income',
      description: 'We\'ll cover your job or business, how much you earn, and your regular monthly outgoings.',
      details: [
        'Your employment type and employer details',
        'Your income from all sources',
        'Your regular monthly commitments',
      ],
    },
    documents: {
      title: 'Upload your supporting documents',
      description: 'Lenders need specific documents to verify your income, identity, and finances.',
      details: [
        'Last three months of payslips (all applicants)',
        'Last three months of bank statements (all accounts)',
        'Photo ID — passport or driving licence',
        'Proof of address — utility bill or council tax, dated within three months',
        'P60 or tax return (most recent tax year)',
        'Proof of deposit — savings statements or gift letter',
        'Credit commitments — loan and credit card statements',
        'Proof of bonus or commission (if applicable)',
      ],
    },
    agreements: {
      title: 'Review and sign',
      description: 'Read through your declarations, confirm everything is accurate, and add your signature.',
      details: [
        'Review the information you\'ve provided',
        'Confirm your consent and declarations',
        'Sign your application',
      ],
    },
    collect_keys: {
      title: 'Application ready',
      description: 'Your application is ready for lender review. Submit whenever you\'re ready.',
      details: [
        'All sections complete',
        'Ready for lender assessment',
        'Next: submit your application',
      ],
    },
  };

  const content = overviewContent[sectionId] as { title: string; description: string; details: string[] } | undefined;
  if (!content) return null;

  // ── Welcome section: full-bleed photo card ──────────────────────────────
  if (sectionId === 'welcome') {
    return (
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h2
            className="font-display font-medium mb-2"
            style={{ fontSize: '24px', color: '#182026', lineHeight: '1.2', letterSpacing: '-0.01em' }}
          >
            Let&apos;s get your mortgage journey started
          </h2>
          <p className="text-sm font-medium leading-relaxed" style={{ color: '#5A7387' }}>
            {content.description}
          </p>
        </div>

        {/* Full-bleed Bristol photo card */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {/* Background photo */}
          <img
            src="/images/Bristol1.jpg"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
            }}
          />

          {/* Light gradient — white rises from bottom */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.90) 55%, rgba(255,255,255,0.50) 75%, transparent 100%)',
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, padding: '28px' }}>
            {/* Pill badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,255,255,0.90)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#182026',
                }}
              >
                <Clock className="w-3.5 h-3.5" />
                15 min to complete
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,255,255,0.90)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#182026',
                }}
              >
                Expert advisers
              </span>
            </div>

            {/* What's in this section */}
            <p className="text-sm font-semibold mb-3" style={{ color: '#182026' }}>
              What&apos;s in this section
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {content.details.map((detail, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div
                    style={{
                      flexShrink: 0,
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#3126E3',
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#374151' }}>{detail}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={handleStartClick}
              className="w-full py-3 font-semibold text-sm flex items-center justify-center gap-2 btn-interactive"
              style={{
                backgroundColor: isComplete ? 'rgba(255,255,255,0.65)' : '#3126E3',
                color: isComplete ? '#5A7387' : '#ffffff',
                borderRadius: '8px',
                border: 'none',
                boxShadow: isComplete ? 'none' : undefined,
              }}
            >
              {isComplete ? 'Review section' : isInProgress ? 'Continue section' : 'Start section'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Standard sections ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page title + description */}
      <div>
        <h2
          className="font-display font-medium mb-2 text-xl sm:text-2xl"
          style={{ color: '#182026', lineHeight: '1.2', letterSpacing: '-0.01em' }}
        >
          {overrideTitle || content.title}
        </h2>
        <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: '#5A7387' }}>
          {content.description}
        </p>
      </div>

      {/* Details card — Practical UI: crisp border + light shadow, intentional list markers */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #EAECF0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* List */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#9CA3AF',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            margin: '0 0 14px',
          }}>
            What&apos;s in this section
          </p>
          <ul style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {content.details.map((detail, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#3126E3',
                    flexShrink: 0,
                    marginTop: '8px',
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#182026', lineHeight: '1.5' }}>
                  {detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider + CTA */}
        <div style={{ borderTop: '1px solid #F0F2F5', padding: '16px 20px' }}>
          <button
            onClick={handleStartClick}
            className="w-full py-3 font-semibold text-sm flex items-center justify-center gap-2 btn-interactive"
            style={{
              backgroundColor: isComplete ? '#F9FAFB' : '#3126E3',
              color: isComplete ? '#5A7387' : '#ffffff',
              borderRadius: '8px',
              border: isComplete ? '1px solid #E5E7EB' : 'none',
            }}
          >
            {isComplete ? 'Review section' : isInProgress ? 'Continue section' : 'Start section'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
