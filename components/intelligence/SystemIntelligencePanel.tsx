'use client';

import { useState, useEffect, useRef } from 'react';
import { useApplication } from '@/context/ApplicationContext';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { AILogo } from '@/components/status/AIActivityIndicator';
import { NextActionCard } from './NextActionCard';
import { SystemActivityFeed } from './SystemActivityFeed';
import { AssistantChat } from './AssistantChat';
import { useActivityStream } from '@/hooks/useActivityStream';

export type ActivityStatus = 'processing' | 'complete' | 'needs_attention';

export interface Activity {
  id: string;
  description: string;
  status: ActivityStatus;
  timestamp: Date;
  isMessage?: boolean;
}

interface NextAction {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}

export function SystemIntelligencePanel() {
  const { state, currentStep, currentSectionId } = useApplication();
  const { activities: streamActivities, isConnected, connectionError } = useActivityStream();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  // Convert stream activities to the panel's Activity format
  const activities: Activity[] = streamActivities.map((a) => ({
    id: a.id,
    description: a.description,
    status: a.status === 'processing' ? 'processing' : a.status === 'needs_review' ? 'needs_attention' : 'complete',
    timestamp: new Date(a.timestamp),
  }));

  // Determine next action based on current step and application state
  useEffect(() => {
    if (currentSectionId === 'documents') {
      const incompleteDocReq = state.requirements?.find(
        (req) => req.status === 'required' || req.status === 'issue'
      );
      if (incompleteDocReq) {
        setNextAction({
          title: `Upload ${incompleteDocReq.title}`,
          description: incompleteDocReq.description,
          actionLabel: 'Upload document',
        });
      } else {
        setNextAction({
          title: "You're all set for now",
          description: "We're reviewing your information.",
          actionLabel: 'Continue',
        });
      }
    } else if (currentStep === 'welcome') {
      setNextAction({
        title: 'Get started',
        description: 'Begin your mortgage application by telling us about yourself.',
        actionLabel: 'Start application',
      });
    } else if (currentSectionId === 'about_you') {
      setNextAction({
        title: 'Complete your profile',
        description: 'We need your personal and household details to proceed.',
        actionLabel: 'Continue',
      });
    } else if (currentSectionId === 'property_mortgage') {
      setNextAction({
        title: 'Property information',
        description: "Tell us about your mortgage goals and property.",
        actionLabel: 'Continue',
      });
    } else if (currentSectionId === 'employment_income') {
      setNextAction({
        title: 'Employment & Income',
        description: "Tell us about your income and commitments.",
        actionLabel: 'Continue',
      });
    } else if (currentSectionId === 'agreements') {
      setNextAction({
        title: 'Review agreements',
        description: 'Please review and sign the required documents.',
        actionLabel: 'Review',
      });
    } else {
      setNextAction(null);
    }
  }, [currentStep, currentSectionId, state.requirements]);



  // Hide panel on welcome or completion steps
  useEffect(() => {
    setIsHidden(currentStep === 'welcome' || currentStep === 'completion');
  }, [currentStep]);

  if (isHidden) return null;

  return (
    <div
      className="fixed flex flex-col"
      style={{
        // bottom = outer modal padding (12px) + footer height (~80px) + gap (16px)
        bottom: '108px',
        // left = outer modal padding (12px) + gap (12px)
        left: '24px',
        width: '360px',
        zIndex: 40,
      }}
    >
      {/* Collapsed State */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95"
          style={{
            backgroundColor: '#3126E3',
            color: '#ffffff',
          }}
          aria-label="Open Application Intelligence"
        >
          <AILogo size={26} />
        </button>
      ) : (
        /* Expanded Panel */
        <div
          className="flex flex-col shadow-lg border overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#E5E7EB',
            maxHeight: '600px',
            borderRadius: '12px',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center justify-center flex-shrink-0">
                <AILogo size={28} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#182026' }}>
                  Application Intelligence
                </p>
                <p className="text-xs font-medium" style={{ color: '#182026' }}>
                  Helping complete your application
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 hover:opacity-70 transition-opacity flex-shrink-0"
              aria-label="Collapse"
            >
              <ChevronDown className="w-5 h-5" style={{ color: '#6B7183' }} />
            </button>
          </div>

          {/* Content Area */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              maxHeight: '400px',
            }}
          >
            {/* Next Action Section */}
            {nextAction && (
              <NextActionCard action={nextAction} />
            )}

            {/* System Activity Section */}
            <div className="p-4">
              <p className="text-xs font-semibold mb-3" style={{ color: '#182026' }}>
                What the system is doing
              </p>
              <SystemActivityFeed activities={activities} />
            </div>
          </div>

          {/* Footer with Chat Trigger */}
          <div
            className="p-4 border-t cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#E5E7EB' }}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <div className="flex items-center gap-2" style={{ color: '#3126E3' }}>
              <MessageSquare className="w-4 h-4" />
              <p className="text-sm font-medium">Ask a question…</p>
            </div>
          </div>

          {/* Chat Panel */}
          {isChatOpen && (
            <>
              <div style={{ borderTop: '1px solid #E5E7EB' }} />
              <AssistantChat onClose={() => setIsChatOpen(false)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
