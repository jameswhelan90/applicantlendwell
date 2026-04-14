'use client';

import { useEffect } from 'react';
import { useApplication, ALL_STEPS } from '@/context/ApplicationContext';
import { X, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { FormStepRenderer } from './FormStepRenderer';
import { FormFooterProvider, useFormFooter } from './FormFooterContext';
import { StepProgressNavigator } from './StepProgressNavigator';

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
        <div className="w-full flex items-center justify-between" style={{ backgroundColor: 'transparent', borderWidth: '0px 0px 0px 0px', borderRadius: '16px 16px 0 0', paddingLeft: '16px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '0px' }}>

          {/* Step Progress Navigator - replaces static step counter */}
          <StepProgressNavigator />

          {/* Header actions */}
          <div className="flex items-center gap-1">
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

      {/* Scrollable content — bottom padding clears the fixed footer */}
      <main className="flex-1 overflow-y-auto">
        <div
          key={currentStep}
          className="max-w-xl mx-auto px-6 py-14 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-300"
        >
          <FormStepRenderer />
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
