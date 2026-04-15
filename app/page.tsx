'use client';

import { useApplication } from '@/context/ApplicationContext';
import { getProgressSummary } from '@/utils/taskHelpers';

import { JourneyTracker } from '@/components/progress/JourneyTracker';
import { MobileJourneyNav } from '@/components/progress/MobileJourneyNav';
import { StepOverviewPanel } from '@/components/actions/StepOverviewPanel';
import { NextActionCard } from '@/components/actions/NextActionCard';
import { TaskList } from '@/components/actions/TaskList';
import { AIActivityIndicator } from '@/components/status/AIActivityIndicator';
import { ApplicationFormModal } from '@/components/form/ApplicationFormModal';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { AdvisorInbox } from '@/components/inbox/AdvisorInbox';
import { ActivityProvider } from '@/context/ActivityContext';

export default function MortgageApplication() {
  const { state, selectedJourneyStep } = useApplication();

  // Override welcome section title for the main page
  const pageTitle = selectedJourneyStep === 'welcome' 
    ? "Let's kick start your mortgage journey"
    : undefined;

  return (
    <ActivityProvider>
    <div className="h-screen overflow-hidden flex flex-col bg-background" style={{ backgroundColor: '#F7F8FC' }}>
      {/* Header — full-width sticky band with inset glass card */}
      <header
        className="flex-shrink-0 z-20 w-full pt-4 px-4 sm:pt-6 sm:px-6"
        style={{ backgroundColor: 'transparent' }}
      >
        <div
          className="w-full px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '16px',
          }}
        >
          <div className="flex items-center gap-3">
            <img src="/images/logotype.svg" alt="Lendwell" className="h-5 w-auto" />
            <span className="w-px h-4 bg-border" style={{ display: 'none' }} />
            <span className="text-sm font-semibold" style={{ color: '#182026', display: 'none' }}>
              Mortgage Application
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AIActivityIndicator />
            <span className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2" style={{ borderRadius: '9999px' }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-semibold"
                style={{ backgroundColor: 'rgba(71, 63, 230, 0.10)', color: '#473FE6', fontSize: '10px' }}
              >
                SM
              </div>
              <span className="text-sm font-semibold hidden sm:block" style={{ color: '#182026' }}>
                Sarah Murphy
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile journey section nav — select-style, hidden on desktop */}
      <MobileJourneyNav />

      {/* Page — two-column master-detail layout */}
      <main className="flex-1 overflow-hidden w-full" style={{ backgroundColor: '#F7F8FC' }}>
        <div className="flex h-full">

          {/* Left sidebar — journey navigation, never scrolls */}
          <aside className="hidden lg:flex lg:flex-col w-80 flex-shrink-0 px-6 py-6 overflow-hidden" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
            <nav style={{ paddingTop: '0px', paddingBottom: '12px', paddingRight: '12px' }}>
              <JourneyTracker />
            </nav>
          </aside>

          {/* Main content — scrollable column */}
          <div className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 pb-28 sm:pb-6 pt-4 sm:pt-6" style={{ paddingBottom: '24px' }}>
            <div className={`mx-auto space-y-8 ${selectedJourneyStep === 'documents' ? 'max-w-6xl' : 'max-w-3xl'}`} style={{ paddingTop: '16px' }}>

              {/* Step overview panel — updates based on selected journey step */}
              <StepOverviewPanel sectionId={selectedJourneyStep} overrideTitle={pageTitle} />

              {/* Application readiness + next action cards — visible below step overview (hidden on documents page) */}
              {selectedJourneyStep !== 'documents' && (
                <div className="space-y-8" style={{ marginTop: '24px', paddingTop: '24px' }}>
                  <TaskList />

                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Full-screen form modal */}
      <ApplicationFormModal />

      {/* Adviser Inbox — persistent lower-left, always visible */}
      <AdvisorInbox />

      {/* Floating chat button + window — button hidden on documents page (bottom bar replaces it) */}
      <FloatingChat hideButton={selectedJourneyStep === 'documents'} />

    </div>
    </ActivityProvider>
  );
}

