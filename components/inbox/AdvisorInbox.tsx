'use client';

import { useState } from 'react';
import { Inbox, X, Upload, FileSignature, Eye, CheckCircle2, Clock, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type TaskType = 'upload' | 'sign' | 'review' | 'action';
type TaskStatus = 'action_needed' | 'waiting' | 'in_review' | 'completed';

interface AdvisorTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}

// ─── Mock data — replace with API/context when backend is available ──────────

const INITIAL_TASKS: AdvisorTask[] = [
  {
    id: 'task-1',
    type: 'upload',
    title: 'Upload proof of address',
    description: 'Your adviser has requested a utility bill or council tax letter dated within 3 months.',
    status: 'action_needed',
    createdAt: '2026-04-14',
  },
  {
    id: 'task-2',
    type: 'sign',
    title: 'Sign your Agreement in Principle',
    description: 'Your AIP is ready to review and sign. This confirms the lender is willing to lend in principle.',
    status: 'action_needed',
    createdAt: '2026-04-14',
  },
  {
    id: 'task-3',
    type: 'review',
    title: 'Adviser note: payslip query',
    description: 'LendWell is reviewing your payslips. Your adviser may be in touch if additional information is needed.',
    status: 'in_review',
    createdAt: '2026-04-13',
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
  action_needed: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  waiting:       { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  in_review:     { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  completed:     { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
};

const TYPE_ICONS: Record<TaskType, React.ElementType> = {
  upload: Upload,
  sign:   FileSignature,
  review: Eye,
  action: CheckCircle2,
};

function TaskCard({ task, onComplete }: { task: AdvisorTask; onComplete: (id: string) => void }) {
  const Icon = TYPE_ICONS[task.type];
  const statusStyle = STATUS_COLORS[task.status];
  const isCompleted = task.status === 'completed';

  const actionLabel: Record<TaskType, string> = {
    upload: 'Upload document',
    sign:   'Review and sign',
    review: 'View update',
    action: 'Mark as done',
  };

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E5E7EB',
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EDECFD' }}
          >
            <Icon className="w-4 h-4" style={{ color: '#3126E3' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#182026' }}>
            {task.title}
          </p>
        </div>
        {/* Status badge */}
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
        >
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: '#677183' }}>
        {task.description}
      </p>

      {/* Action button */}
      {!isCompleted && (
        <button
          onClick={() => onComplete(task.id)}
          className="w-full text-xs font-semibold py-2 px-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#3126E3', color: '#ffffff', border: 'none', cursor: 'pointer' }}
        >
          {actionLabel[task.type]}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdvisorInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<AdvisorTask[]>(INITIAL_TASKS);

  const openTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const badgeCount = tasks.filter((t) => t.status === 'action_needed').length;
  const hasActionNeeded = badgeCount > 0;

  const handleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'completed' as TaskStatus } : t))
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '96px', // above the FloatingChat button (24px + ~52px + 20px gap)
        left: '24px',
        zIndex: 49,
        width: '360px',
      }}
    >
      {/* Expanded drawer */}
      {isOpen && (
        <div
          className="mb-3 flex flex-col"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0px 8px 32px 0px rgba(24, 32, 38, 0.16)',
            border: `1px solid ${hasActionNeeded ? '#FCD34D' : 'rgba(0,0,0,0.08)'}`,
            overflow: 'hidden',
            maxHeight: '480px',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4" style={{ color: '#3126E3' }} />
              <p className="font-bold text-sm" style={{ color: '#182026' }}>
                Adviser Inbox
              </p>
              {badgeCount > 0 && (
                <span
                  className="flex items-center justify-center text-xs font-bold rounded-full"
                  style={{ width: '20px', height: '20px', backgroundColor: '#EF4444', color: '#ffffff', fontSize: '10px' }}
                >
                  {badgeCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close inbox"
              className="btn-interactive"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X className="w-4 h-4" style={{ color: '#677183' }} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1" style={{ padding: '16px', maxHeight: '380px' }}>
            {tasks.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div
                  className="flex items-center justify-center"
                  style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}
                >
                  <Inbox className="w-6 h-6" style={{ color: '#9CA3AF' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#182026' }}>
                    No adviser tasks yet
                  </p>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: '#677183', maxWidth: '260px' }}>
                    Your adviser and LendWell may send requests here as your application progresses — for example, uploading a document, reviewing a form, or signing something.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Open tasks */}
                {openTasks.length > 0 && (
                  <div className="space-y-3">
                    {openTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onComplete={handleComplete} />
                    ))}
                  </div>
                )}

                {/* Completed tasks (collapsed by default) */}
                {completedTasks.length > 0 && (
                  <details className="group">
                    <summary
                      className="text-xs font-semibold cursor-pointer flex items-center gap-1 py-2"
                      style={{ color: '#9CA3AF', listStyle: 'none' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#6CAD0A' }} />
                      {completedTasks.length} completed
                    </summary>
                    <div className="space-y-3 mt-2">
                      {completedTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onComplete={handleComplete} />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent trigger pill */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close adviser inbox' : 'Open adviser inbox'}
        className="flex items-center gap-2.5 btn-interactive"
        style={{
          backgroundColor: hasActionNeeded ? '#FFFBEB' : '#ffffff',
          border: `1px solid ${hasActionNeeded ? '#FCD34D' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: '999px',
          padding: '10px 18px 10px 12px',
          cursor: 'pointer',
        }}
      >
        {/* Icon bubble */}
        <div
          className="flex items-center justify-center relative"
          style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: hasActionNeeded ? '#FEF3C7' : '#F3F4F6', flexShrink: 0 }}
        >
          <Inbox className="w-4 h-4" style={{ color: hasActionNeeded ? '#D97706' : '#677183' }} />
          {badgeCount > 0 && (
            <span
              className="absolute flex items-center justify-center font-bold rounded-full"
              style={{ top: '-4px', right: '-4px', width: '16px', height: '16px', backgroundColor: '#EF4444', color: '#ffffff', fontSize: '9px', border: '1.5px solid #ffffff' }}
            >
              {badgeCount}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold" style={{ color: hasActionNeeded ? '#92400E' : '#182026' }}>
          {badgeCount > 0 ? `${badgeCount} task${badgeCount > 1 ? 's' : ''} waiting` : 'Adviser inbox'}
        </span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        ) : (
          <ChevronUp className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        )}
      </button>
    </div>
  );
}
