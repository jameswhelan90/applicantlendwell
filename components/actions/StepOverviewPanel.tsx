'use client';

import { useApplication, SECTION_LABELS, SECTION_FIRST_STEP } from '@/context/ApplicationContext';
import { SectionId } from '@/types/tasks';
import { ChevronRight } from 'lucide-react';
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

  // Check if all main sections (excluding collect_keys) are complete
  const mainSections = state.sections.filter(s => s.id !== 'collect_keys');
  const allSectionsComplete = mainSections.every(s => s.status === 'complete');

  // Render special completion section for the collect_keys tab
  if (sectionId === 'collect_keys') {
    return <CompletionSection isFullyComplete={allSectionsComplete} />;
  }

  // Render expanded documents upload section
  if (sectionId === 'documents') {
    return <DocumentsUploadSection />;
  }

  const handleStartClick = () => {
    openModal(firstStep);
  };

  // Overview content for each section
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
  
  // Guard against undefined content (documents/completion return early above)
  if (!content) return null;

  return (
    <div className="space-y-8">
      {/* Step overview section */}
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#182026' }}>{sectionId === 'welcome' ? "Let's kick start your mortgage journey" : (overrideTitle || content.title)}</h2>
        <p className="text-base text-foreground font-medium leading-relaxed" style={{ fontSize: '18px' }}>
          {content.description}
        </p>
      </div>

      {/* Details list with white card styling */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0px 2px 10px 0px rgba(24, 32, 38, 0.10)',
        }}
      >
        <p className="text-base font-bold mb-4" style={{ color: '#1C15A3', fontSize: '16px' }}>
          {sectionId === 'documents' ? "What We'll Need" : "What's in This Section"}
        </p>
        <ul className="space-y-4 mb-6">
          {content.details.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#3126E3' }} />
              <span className="text-base font-medium" style={{ color: '#1C15A3', fontSize: '16px' }}>{detail}</span>
            </li>
          ))}
        </ul>

        {/* CTA button inside container */}
        <button
          onClick={handleStartClick}
          className="w-full px-4 py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 btn-interactive"
          style={{
            backgroundColor: isComplete ? '#F7F8FC' : '#3126E3',
            color: isComplete ? '#182026' : '#ffffff',
            fontWeight: '700',
          }}
        >
          {isComplete ? 'Review section' : isInProgress ? 'Continue section' : 'Start section'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
