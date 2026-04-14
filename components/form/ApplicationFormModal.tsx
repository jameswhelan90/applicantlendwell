'use client';

import { useEffect, useState } from 'react';
import { useApplication, ALL_STEPS, STEP_SECTION, StepId } from '@/context/ApplicationContext';
import { X, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { FormStepRenderer } from './FormStepRenderer';
import { FormFooterProvider, useFormFooter } from './FormFooterContext';
import { StepProgressNavigator } from './StepProgressNavigator';

const STEP_LABELS: Partial<Record<StepId, string>> = {
  id_name: 'Your name', id_dob: 'Date of birth', id_contact: 'Contact details',
  id_nationality: 'Nationality', id_ni_pps: 'National Insurance', id_address: 'Current address',
  id_address_history: 'Address history', hh_circumstances: 'Relationship status',
  hh_application_mode: 'Joint or sole', hh_second_applicant: 'Second applicant',
  hh_second_applicant_contact: 'Second applicant contact', hh_dependants: 'Dependants',
  intent_type: 'Mortgage type', intent_remortgage: 'Remortgage details',
  intent_btl: 'Buy-to-let', intent_timeline: 'Timeline',
  prop_stage: 'Property stage', prop_details: 'Property details', prop_value: 'Property value',
  dep_amount: 'Deposit amount', dep_source: 'Deposit source', dep_gift_details: 'Gift details',
  pm_affordability: 'Affordability',
  emp_status: 'Employment status', emp_details: 'Employment details',
  emp_self_employed: 'Self-employment', emp_second_applicant: 'Joint employment',
  inc_salary: 'Salary', inc_additional: 'Additional income', inc_second_applicant: 'Joint income',
  commit_outgoings: 'Monthly outgoings', commit_childcare: 'Childcare costs',
  id_upload_photo: 'Photo ID', hh_upload_joint_id: 'Joint applicant ID',
  intent_upload_mortgage: 'Mortgage statement', intent_upload_rental: 'Rental income proof',
  emp_upload_payslips: 'Payslips', emp_upload_tax: 'Tax returns', emp_upload_joint: 'Joint payslips',
  inc_upload_bank: 'Bank statements', inc_upload_joint_bank: 'Joint bank statements',
  dep_upload_gift: 'Gift letter', dep_upload_giftor: 'Giftor ID',
  ag_declarations: 'Declarations', ag_signature: 'Signature',
};

const NON_QUESTION_STEPS = new Set<StepId>([
  'welcome', 'orientation', 'intro_about_you', 'intro_property_mortgage',
  'intro_employment_income', 'intro_documents', 'intro_agreements',
  'docs_overview', 'completion',
]);

function StepDotsIndicator() {
  const { currentStep, currentSectionId } = useApplication();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const sectionSteps = ALL_STEPS.filter(
    s => STEP_SECTION[s] === currentSectionId && !NON_QUESTION_STEPS.has(s)
  );
  const currentIdx = sectionSteps.indexOf(currentStep);
  if (sectionSteps.length < 2 || currentIdx === -1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {sectionSteps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step} style={{ position: 'relative' }}>
            {hoveredIdx === idx && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 7px)',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#182026',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '500',
                padding: '3px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 100,
                lineHeight: '1.5',
              }}>
                {STEP_LABELS[step] ?? step}
              </div>
            )}
            <div
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                width: isCurrent ? '26px' : '18px',
                height: '4px',
                borderRadius: '999px',
                backgroundColor: isCompleted || isCurrent ? '#3126E3' : 'rgba(24,32,38,0.12)',
                opacity: isCompleted ? 0.45 : 1,
                transition: 'all 180ms ease',
                cursor: 'default',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function ModalContent() {
  const {
    isModalOpen,
    closeModal,
    currentStep,
    goToPrevStep,
  } = useApplication();

  const { label: continueLabel, onContinue } = useFormFooter();
  const { isChatOpen, toggleChat } = useChat();

  // Close on Escape, lock body scroll, Enter to submit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      // Enter to submit current step (when not in a textarea)
      if (e.key === 'Enter' && onContinue && e.target instanceof HTMLInputElement && !e.shiftKey) {
        e.preventDefault();
        onContinue();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, closeModal, onContinue]);

  if (!isModalOpen) return null;

  const stepIndex = ALL_STEPS.indexOf(currentStep);
  const isFirstStep = stepIndex === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-stretch"
      style={{ padding: '12px' }}
      role="dialog"
      aria-modal="true"
      aria-label="Mortgage application form"
    >
      {/* Floating modal card */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{
          backgroundColor: '#F7F8FC',
          borderRadius: '16px',
          boxShadow: '0 8px 40px 0 rgba(24, 32, 38, 0.18), 0 2px 8px 0 rgba(24, 32, 38, 0.08)',
        }}
      >

      {/* Header */}
      <header className="sticky top-0 flex-shrink-0 z-10">
        <div className="w-full flex items-center" style={{ position: 'relative', backgroundColor: 'transparent', borderRadius: '16px 16px 0 0', paddingLeft: '16px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '0px' }}>

          {/* Step Progress Navigator */}
          <StepProgressNavigator />

          {/* Centered question step dots */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <StepDotsIndicator />
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Ask LendWell */}
            <button
              type="button"
              onClick={() => toggleChat()}
              aria-label={isChatOpen ? 'Close chat' : 'Ask LendWell'}
              className="inline-flex items-center gap-1.5 font-semibold text-xs px-3 py-1.5 rounded-full btn-interactive"
              style={{
                backgroundColor: isChatOpen ? '#3126E3' : 'transparent',
                color: isChatOpen ? '#ffffff' : '#5A7387',
                border: 'none',
              }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask LendWell
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={closeModal}
              className="w-8 h-8 rounded-full flex items-center justify-center btn-interactive flex-shrink-0"
              style={{ backgroundColor: 'transparent', color: '#5A7387', border: 'none' }}
              aria-label="Close application form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable content — centers when content fits, scrolls when it overflows */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center py-8">
          <div
            key={currentStep}
            className="max-w-xl w-full mx-auto px-6 animate-in fade-in slide-in-from-bottom-6 duration-300"
          >
            <FormStepRenderer />
          </div>
        </div>
      </main>

      {/* Fixed footer — always visible */}
      <footer
        className="flex-shrink-0 flex items-center px-5 py-5"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderTop: '1px solid #e8eaee',
          borderRadius: '0 0 16px 16px',
        }}
      >
        {/* Left side — navigation buttons */}
        <div className="flex items-center gap-3">
          {/* Back / Overview — secondary style */}
          <button
            type="button"
            onClick={() => {
              if (isFirstStep) {
                closeModal();
              } else {
                goToPrevStep();
              }
            }}
            aria-label={isFirstStep ? 'Return to overview' : 'Go to previous step'}
            className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-full btn-interactive"
            style={{
              backgroundColor: 'transparent',
              color: '#5A7387',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {isFirstStep ? 'Overview' : 'Back'}
          </button>

          {/* Continue — primary style */}
          {onContinue && continueLabel && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full btn-interactive group"
                style={{ backgroundColor: '#3126E3', color: '#ffffff' }}
              >
                {continueLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <span
                className="hidden sm:inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: '#9CA3AF' }}
              >
                or press
                <kbd
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', fontFamily: 'inherit' }}
                >
                  Enter ↵
                </kbd>
              </span>
            </div>
          )}
        </div>

      </footer>

      </div>

    </div>
  );
}

export function ApplicationFormModal() {
  return (
    <FormFooterProvider>
      <ModalContent />
    </FormFooterProvider>
  );
}
