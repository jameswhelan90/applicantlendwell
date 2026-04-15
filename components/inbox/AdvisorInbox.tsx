'use client';

import { useState, useEffect, useRef } from 'react';
import { Inbox, X, Upload, FileSignature, Eye, CheckCircle2, ChevronUp, ChevronDown, ArrowRight, ExternalLink, Phone, Mail } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { SectionId } from '@/types/tasks';

// ─── Types ──────────────────────────────────────────────────────────────────

type TaskType = 'upload' | 'sign' | 'review' | 'action';
type TaskStatus = 'action_needed' | 'waiting' | 'in_review' | 'completed';

type TaskAction =
  | { kind: 'navigate'; sectionId: SectionId }
  | { kind: 'open-form'; stepId: string }
  | { kind: 'sign-document'; document: SignDocument }
  | { kind: 'info'; content: InfoContent };

interface SignDocument {
  title: string;
  reference: string;
  summary: string;
  clauses: string[];
  nextStepLabel: string;
  nextStepSectionId: SectionId;
}

interface InfoContent {
  heading: string;
  body: string;
  offPlatform?: boolean;
  steps?: string[];
  ctaLabel?: string;
  ctaSectionId?: SectionId;
  contactName?: string;
  contactRole?: string;
}

interface AdvisorTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  action: TaskAction;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const INITIAL_TASKS: AdvisorTask[] = [
  {
    id: 'task-1',
    type: 'upload',
    title: 'Upload proof of address',
    description: 'Your adviser has requested a utility bill or council tax letter dated within 3 months.',
    status: 'action_needed',
    createdAt: '2026-04-14',
    action: {
      kind: 'navigate',
      sectionId: 'documents',
    },
  },
  {
    id: 'task-2',
    type: 'sign',
    title: 'Sign your Agreement in Principle',
    description: 'Your AIP is ready to review and sign. This confirms the lender is willing to lend in principle.',
    status: 'action_needed',
    createdAt: '2026-04-14',
    action: {
      kind: 'sign-document',
      document: {
        title: 'Agreement in Principle',
        reference: 'AIP-2026-00412',
        summary: 'This Agreement in Principle (AIP) confirms that, subject to full underwriting and verification of the information provided, the lender is prepared in principle to offer a mortgage of the amount requested.',
        clauses: [
          'This AIP is valid for 90 days from the date of issue.',
          'It is not a formal mortgage offer and does not guarantee lending.',
          'The final offer is subject to a full credit check, property valuation, and income verification.',
          'The rate and terms may change between this AIP and a formal mortgage offer.',
          'Providing false information may result in withdrawal of any offer.',
        ],
        nextStepLabel: 'Go to Agreements section to sign',
        nextStepSectionId: 'agreements',
      },
    },
  },
  {
    id: 'task-3',
    type: 'review',
    title: 'Adviser note: payslip query',
    description: 'LendWell is reviewing your payslips. Your adviser may be in touch if additional information is needed.',
    status: 'in_review',
    createdAt: '2026-04-13',
    action: {
      kind: 'info',
      content: {
        heading: 'Payslip review in progress',
        body: 'Your adviser is reviewing the payslips you uploaded. This is a standard part of the income verification process. No action is needed from you right now — your adviser will contact you directly if anything is outstanding.',
        offPlatform: false,
        contactName: 'Sarah Murphy',
        contactRole: 'Your LendWell Adviser',
      },
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TaskStatus, string> = {
  action_needed: 'Action needed',
  waiting: 'Waiting on you',
  in_review: 'In review',
  completed: 'Completed',
};

const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string; border: string }> = {
  action_needed: { bg: '#FFF6EA', text: '#653701', border: '#FFDAAF' },
  waiting:       { bg: '#EDECFD', text: '#3126E3', border: '#D9D7FF' },
  in_review:     { bg: '#EDECFD', text: '#3126E3', border: '#D9D7FF' },
  completed:     { bg: '#EEFDD9', text: '#3C6006', border: '#CEF88C' },
};

const TYPE_ICONS: Record<TaskType, React.ElementType> = {
  upload: Upload,
  sign:   FileSignature,
  review: Eye,
  action: CheckCircle2,
};

const ACTION_LABELS: Record<TaskType, string> = {
  upload: 'Go to documents',
  sign:   'Review & sign',
  review: 'View update',
  action: 'See instructions',
};

// ─── Task Detail Modal ────────────────────────────────────────────────────────

function TaskDetailModal({
  task,
  onClose,
  onNavigate,
  onComplete,
}: {
  task: AdvisorTask;
  onClose: () => void;
  onNavigate: (sectionId: SectionId) => void;
  onComplete: (id: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const { action } = task;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={task.title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(24,32,38,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          width: '100%',
          maxWidth: '520px',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#EDECFD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {(() => {
              const Icon = TYPE_ICONS[task.type];
              return <Icon style={{ width: '18px', height: '18px', color: '#3126E3' }} />;
            })()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              className="font-display font-medium"
              style={{ fontSize: '18px', color: '#182026', letterSpacing: '-0.01em', margin: 0 }}
            >
              {task.title}
            </h2>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#5A7387', margin: '2px 0 0' }}>
              Received {task.createdAt}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn-interactive"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#5A7387' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>

          {/* Sign document view */}
          {action.kind === 'sign-document' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#F7F8FC',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#182026', margin: 0 }}>
                    {action.document.title}
                  </p>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#5A7387' }}>
                    Ref: {action.document.reference}
                  </span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                  {action.document.summary}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#182026', margin: '0 0 10px' }}>
                  Key terms
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {action.document.clauses.map((clause, i) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, marginTop: '6px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151', lineHeight: '1.5' }}>{clause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  backgroundColor: '#EDECFD',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ArrowRight style={{ width: '16px', height: '16px', color: '#3126E3', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#3126E3', margin: 0 }}>
                  To formally sign, complete the Agreements section of your application.
                </p>
              </div>
            </div>
          )}

          {/* Info / off-platform view */}
          {action.kind === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: 0, lineHeight: '1.6' }}>
                {action.content.body}
              </p>

              {action.content.offPlatform && action.content.steps && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#182026', margin: 0 }}>
                    Steps to complete
                  </p>
                  {action.content.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 12px', backgroundColor: '#F7F8FC', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#EDECFD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#3126E3' }}>{i + 1}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#182026', lineHeight: '1.5' }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {action.content.contactName && (
                <div
                  style={{
                    backgroundColor: '#F7F8FC',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(71,63,230,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#473FE6',
                      flexShrink: 0,
                    }}
                  >
                    {action.content.contactName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#182026', margin: 0 }}>
                      {action.content.contactName}
                    </p>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#5A7387', margin: 0 }}>
                      {action.content.contactRole}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            gap: '10px',
          }}
        >
          {action.kind === 'sign-document' && (
            <button
              type="button"
              onClick={() => {
                onNavigate(action.document.nextStepSectionId);
                onComplete(task.id);
                onClose();
              }}
              className="btn-interactive"
              style={{
                flex: 1,
                padding: '11px 16px',
                backgroundColor: '#3126E3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              Go to Agreements
              <ArrowRight style={{ width: '15px', height: '15px' }} />
            </button>
          )}

          {action.kind === 'info' && action.content.ctaSectionId && (
            <button
              type="button"
              onClick={() => {
                onNavigate(action.content.ctaSectionId!);
                onClose();
              }}
              className="btn-interactive"
              style={{
                flex: 1,
                padding: '11px 16px',
                backgroundColor: '#3126E3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {action.content.ctaLabel ?? 'Go there now'}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn-interactive"
            style={{
              padding: '11px 16px',
              backgroundColor: '#F7F8FC',
              color: '#182026',
              border: '1px solid #E1E8EE',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {action.kind === 'info' ? 'Got it' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onAction,
  onComplete,
}: {
  task: AdvisorTask;
  onAction: (task: AdvisorTask) => void;
  onComplete: (id: string) => void;
}) {
  const statusStyle = STATUS_COLORS[task.status];
  const isCompleted = task.status === 'completed';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#182026', margin: 0, lineHeight: '1.3' }}>
            {task.title}
          </p>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '600',
            padding: '3px 8px',
            borderRadius: '999px',
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '12px', fontWeight: '500', color: '#5A7387', margin: 0, lineHeight: '1.5' }}>
        {task.description}
      </p>

      {/* Action button */}
      {!isCompleted && (
        <button
          type="button"
          onClick={() => onAction(task)}
          className="btn-interactive"
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            color: '#182026',
            border: '1.5px solid #E1E8EE',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {ACTION_LABELS[task.type]}
          <ArrowRight style={{ width: '13px', height: '13px', color: '#5A7387' }} />
        </button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdvisorInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<AdvisorTask[]>(INITIAL_TASKS);
  const [activeTask, setActiveTask] = useState<AdvisorTask | null>(null);
  const { selectJourneyStep } = useApplication();

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !activeTask) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTask]);

  const openTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const badgeCount = tasks.filter((t) => t.status === 'action_needed').length;
  const hasActionNeeded = badgeCount > 0;

  const handleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'completed' as TaskStatus } : t))
    );
  };

  const handleAction = (task: AdvisorTask) => {
    const { action } = task;

    if (action.kind === 'navigate') {
      // Directly navigate — no modal needed
      selectJourneyStep(action.sectionId);
      handleComplete(task.id);
      setIsOpen(false);
    } else {
      // Show the detail modal
      setActiveTask(task);
    }
  };

  const handleNavigate = (sectionId: SectionId) => {
    selectJourneyStep(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Task detail modal — rendered outside the fixed panel so it overlays the full page */}
      {activeTask && (
        <TaskDetailModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onNavigate={handleNavigate}
          onComplete={handleComplete}
        />
      )}

      <div
        className="advisor-inbox-container"
        style={{
          position: 'fixed',
          bottom: '96px',
          left: '24px',
          zIndex: 49,
          width: 'min(360px, calc(100vw - 32px))',
        }}
      >
        {/* Expanded drawer */}
        {isOpen && (
          <div
            style={{
              marginBottom: '12px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0px 8px 32px 0px rgba(24, 32, 38, 0.16)',
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'hidden',
              maxHeight: '480px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Inbox style={{ width: '15px', height: '15px', color: '#3126E3' }} />
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#182026', margin: 0 }}>
                  Adviser Inbox
                </p>
                {badgeCount > 0 && (
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#E07900',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {badgeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close inbox"
                className="btn-interactive"
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A7387' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ padding: '14px', overflowY: 'auto', flex: 1 }}>
              {tasks.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: '#F7F8FC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}
                  >
                    <Inbox style={{ width: '22px', height: '22px', color: '#9CA3AF' }} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#182026', margin: '0 0 4px' }}>
                    No tasks yet
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#5A7387', margin: 0, maxWidth: '240px', marginInline: 'auto' }}>
                    Your adviser will send requests here as your application progresses.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {openTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onAction={handleAction} onComplete={handleComplete} />
                  ))}

                  {completedTasks.length > 0 && (
                    <details>
                      <summary
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                          listStyle: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 0',
                        }}
                      >
                        <CheckCircle2 style={{ width: '13px', height: '13px', color: '#6CAD0A' }} />
                        {completedTasks.length} completed
                      </summary>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                        {completedTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onAction={handleAction} onComplete={handleComplete} />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trigger pill */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Close adviser inbox' : 'Open adviser inbox'}
          aria-expanded={isOpen}
          className="btn-interactive flex items-center gap-2.5"
          style={{
            backgroundColor: '#ffffff',
            border: 'none',
            borderRadius: '999px',
            padding: '10px 18px 10px 12px',
            cursor: 'pointer',
            boxShadow: hasActionNeeded
              ? '0 4px 16px rgba(224,121,0,0.18), 0 1px 4px rgba(0,0,0,0.08)'
              : '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: hasActionNeeded ? '#FFF6EA' : '#F7F8FC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <Inbox style={{ width: '15px', height: '15px', color: hasActionNeeded ? '#E07900' : '#5A7387' }} />
            {badgeCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  backgroundColor: '#E07900',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #ffffff',
                }}
              >
                {badgeCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline" style={{ fontSize: '13px', fontWeight: '600', color: hasActionNeeded ? '#653701' : '#182026' }}>
            {badgeCount > 0 ? `${badgeCount} task${badgeCount > 1 ? 's' : ''} waiting` : 'Adviser inbox'}
          </span>
          {isOpen ? (
            <ChevronDown style={{ width: '14px', height: '14px', color: '#5A7387' }} />
          ) : (
            <ChevronUp style={{ width: '14px', height: '14px', color: '#5A7387' }} />
          )}
        </button>
      </div>
      <style>{`
        @media (max-width: 639px) {
          .advisor-inbox-container {
            left: auto !important;
            right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
