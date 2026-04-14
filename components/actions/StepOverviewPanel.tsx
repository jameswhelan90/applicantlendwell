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
      title: "Let's kick start your mortgage journey",
      description: 'Meet your adviser and understand what happens next as we prepare your application for lenders.',
      details: [
        'Get to know your dedicated adviser',
        'Understand the application process',
        'Review what lenders will assess',
      ],
    },
    about_you: {
      title: 'Tell us about yourself',
      description: 'We need to collect some personal details that lenders require to assess your mortgage application.',
      details: [
        'Confirm your identity and contact details',
        'Tell us about your household',
        'Provide residency and address information',
      ],
    },
    property_mortgage: {
      title: 'Property & Mortgage details',
      description: 'This section helps lenders understand your property goals and mortgage requirements.',
      details: [
        'Tell us what you want to buy or refinance',
        'Share the estimated property value',
        'Provide details about your deposit',
      ],
    },
    employment_income: {
      title: 'Employment & Income',
      description: 'Lenders need to understand your income stability and financial commitments to assess affordability.',
      details: [
        'Tell us about your job or business',
        'Share your income sources',
        'Provide details about monthly commitments',
      ],
    },
    documents: {
      title: 'Upload supporting documents',
      description: 'Lenders need specific documents to verify your income, identity, and financial stability.',
      details: [
        'Last 3 months of payslips (all applicants)',
        'Last 3 months of bank statements (all accounts)',
        'Photo ID (passport or driving licence)',
        'Proof of address (utility bill or council tax, dated within 3 months)',
        'P60 or tax return (most recent tax year)',
        'Proof of deposit (savings statements or gift letter)',
        'Credit commitments (loan/credit card statements)',
        'Proof of bonus/commission (if applicable)',
      ],
    },
    agreements: {
      title: 'Review and sign',
      description: 'Confirm your details, sign declarations, and confirm your application is ready for lender review.',
      details: [
        'Review the information you provided',
        'Sign required declarations',
        'Confirm everything is accurate',
      ],
    },
    collect_keys: {
      title: 'Application ready',
      description: 'Your application is prepared and ready for lender review. Submit when you are ready.',
      details: [
        'All sections complete',
        'Ready for lender assessment',
        'Next: Submit your application',
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
            Let&apos;s kick start your mortgage journey
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
                      backgroundColor: '#CBD5E1',
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
          className="font-display font-medium mb-2"
          style={{ fontSize: '24px', color: '#182026', lineHeight: '1.2', letterSpacing: '-0.01em' }}
        >
          {overrideTitle || content.title}
        </h2>
        <p className="text-sm font-medium leading-relaxed" style={{ color: '#5A7387' }}>
          {content.description}
        </p>
      </div>

      {/* Details card */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.07)',
        }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: '#182026' }}>
          What&apos;s in this section
        </p>
        <ul className="space-y-3 mb-6">
          {content.details.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 mt-[5px]"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#CBD5E1',
                }}
              />
              <span className="text-sm font-medium leading-snug" style={{ color: '#374151' }}>{detail}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleStartClick}
          className="w-full py-3 font-semibold text-sm flex items-center justify-center gap-2 btn-interactive"
          style={{
            backgroundColor: isComplete ? 'rgba(255,255,255,0.65)' : '#3126E3',
            color: isComplete ? '#5A7387' : '#ffffff',
            borderRadius: '999px',
            border: 'none',
          }}
        >
          {isComplete ? 'Review section' : isInProgress ? 'Continue section' : 'Start section'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
