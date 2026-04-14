'use client';

import { useEffect, useState, useRef } from 'react';
import { useApplication, ALL_STEPS, STEP_LABELS, STEP_SECTION, SECTION_LABELS, SECTION_FIRST_STEP } from '@/context/ApplicationContext';
import { X, ArrowLeft, ArrowRight, ChevronUp, Check, MessageSquare } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { FormStepRenderer } from './FormStepRenderer';
import { FormFooterProvider, useFormFooter } from './FormFooterContext';
import { StepProgressNavigator } from './StepProgressNavigator';
import { SectionId, JourneySection } from '@/types/tasks';
import { FormIntelligenceDialog } from '@/components/intelligence/FormIntelligenceDialog';

function ModalContent() {
  const {
    isModalOpen,
    closeModal,
    currentStep,
    goToPrevStep,
    currentSectionId,
    state,
    openModal,
  } = useApplication();

  const { label: continueLabel, onContinue } = useFormFooter();
  const { isChatOpen, toggleChat } = useChat();

  // Journey menu floating panel state
  const [isJourneyMenuOpen, setIsJourneyMenuOpen] = useState(false);
  const journeyMenuRef = useRef<HTMLDivElement>(null);

  // Close journey menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (journeyMenuRef.current && !journeyMenuRef.current.contains(e.target as Node)) {
        setIsJourneyMenuOpen(false);
      }
    };
    if (isJourneyMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isJourneyMenuOpen]);

  const handleSectionClick = (section: JourneySection) => {
    const firstStep = SECTION_FIRST_STEP[section.id];
    openModal(firstStep);
    setIsJourneyMenuOpen(false);
  };

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

  // These variables are kept but no longer used in header - can be removed later if needed
  const stepsInSection = ALL_STEPS.filter((s) => STEP_SECTION[s] === currentSectionId);
  const sectionStepIndex = stepsInSection.indexOf(currentStep);
  const sectionLabel = SECTION_LABELS[currentSectionId as SectionId];
  const stepLabel = STEP_LABELS[currentStep];

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
        <div className="w-full flex items-center justify-between" style={{ backgroundColor: 'transparent', borderWidth: '0px 0px 0px 0px', borderRadius: '16px 16px 0 0', paddingLeft: '16px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '0px' }}>

          {/* Step Progress Navigator - replaces static step counter */}
          <StepProgressNavigator />

          {/* Close */}
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center icon-btn flex-shrink-0"
            style={{ backgroundColor: 'transparent', color: '#171C26', border: '1.5px solid #171C26' }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Scrollable content — bottom padding clears the fixed footer */}
      <main className="flex-1 overflow-y-auto">
        <div
          key={currentStep}
          className="max-w-xl mx-auto px-6 py-14 pb-32 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <FormStepRenderer />
        </div>
      </main>

      {/* Fixed footer — always visible */}
      <footer
        className="flex-shrink-0 flex items-center justify-between px-5 py-5"
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
            onClick={() => {
              if (isFirstStep) {
                closeModal();
              } else {
                goToPrevStep();
              }
            }}
            className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full btn-interactive"
            style={{
              backgroundColor: '#ffffff',
              color: '#374151',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {isFirstStep ? 'Overview' : 'Back'}
          </button>

          {/* Continue — primary style */}
          {onContinue && continueLabel && (
            <button
              onClick={onContinue}
              className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full btn-interactive group"
              style={{ backgroundColor: '#3126E3', color: '#ffffff' }}
            >
              {continueLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Right side — Ask LendWell button */}
        <div className="flex items-center gap-2">

        {/* Ask LendWell button */}
        <button
          onClick={toggleChat}
          aria-label={isChatOpen ? 'Close chat' : 'Ask LendWell'}
          className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full btn-interactive"
          style={{
            backgroundColor: isChatOpen ? '#3126E3' : '#ffffff',
            color: isChatOpen ? '#ffffff' : '#374151',
            border: 'none',
            boxShadow: isChatOpen ? '0 2px 8px rgba(49,38,227,0.25)' : 'none',
          }}
        >
          <MessageSquare className="w-4 h-4" />
          Ask LendWell
        </button>

        <div className="relative" ref={journeyMenuRef} style={{ display: 'none' }}>
          <button
            onClick={() => setIsJourneyMenuOpen(!isJourneyMenuOpen)}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 row-interactive focus-ring"
            style={{
              backgroundColor: isJourneyMenuOpen ? '#F1F3F7' : '#ffffff',
              color: '#374151',
              borderRadius: '999px',
              border: 'none',
            }}
            aria-expanded={isJourneyMenuOpen}
            aria-haspopup="true"
          >
            <span className="text-muted-foreground">Section:</span>
            <span className="font-semibold">{SECTION_LABELS[currentSectionId as SectionId]}</span>
            <ChevronUp
              className="w-4 h-4 text-muted-foreground transition-transform"
              style={{ transform: isJourneyMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
            />
          </button>

          {/* Floating journey menu panel */}
          {isJourneyMenuOpen && (
            <div
              className="absolute bottom-full right-0 mb-2 w-72 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 30px rgba(24, 32, 38, 0.15), 0 2px 8px rgba(24, 32, 38, 0.08)',
                border: '1px solid #E5E7EB',
              }}
            >
              {/* Menu header */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #F1F3F7' }}>
                <p className="text-xs font-semibold text-muted-foreground">Your Journey</p>
              </div>

              {/* Sections list */}
              <div className="py-2 px-2">
                {state.sections.map((section, index) => {
                  const isComplete = section.status === 'complete';
                  const isCurrent = section.id === currentSectionId;
                  const isUpcoming = section.status === 'not_started' && !isCurrent;

                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left row-interactive focus-ring"
                      style={{
                        backgroundColor: isCurrent ? '#F7F8FC' : 'transparent',
                        border: 'none',
                      }}
                    >
                      {/* Step indicator */}
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isComplete ? '#7CC90E' : isCurrent ? '#473FE6' : '#F1F3F7',
                          border: isUpcoming ? '1px solid #E5E7EB' : 'none',
                        }}
                      >
                        {isComplete ? (
                          <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                        ) : (
                          <span
                            className="text-[11px] font-semibold leading-none"
                            style={{ color: isCurrent ? '#ffffff' : '#9CA3AF' }}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className="text-sm flex-1"
                        style={{
                          color: isUpcoming ? '#9CA3AF' : '#182026',
                          fontWeight: isCurrent ? 600 : 500,
                        }}
                      >
                        {SECTION_LABELS[section.id as SectionId]}
                      </span>

                      {/* Current indicator */}
                      {isCurrent && (
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: '#473FE6' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </div>
      </footer>

      </div>

      {/* Form Intelligence Dialog - contextual AI insights (replaces SystemIntelligencePanel) */}
      <FormIntelligenceDialog />
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
