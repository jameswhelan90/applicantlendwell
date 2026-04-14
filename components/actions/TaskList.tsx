'use client';

import { useApplication, ALL_STEPS, STEP_SECTION, STEP_LABELS, SECTION_LABELS } from '@/context/ApplicationContext';
import { SectionId } from '@/types/tasks';
import { Check, ChevronRight } from 'lucide-react';

// ─── Immediate tasks helper ────────────────────────────────────────────────

function getImmediateTasks(
  state: ReturnType<typeof useApplication>['state'],
): { label: string; sectionId: SectionId }[] {
  const tasks: { label: string; sectionId: SectionId }[] = [];

  for (const section of state.sections) {
    if (section.id === 'collect_keys') continue;
    if (section.status === 'complete') continue;
    if (tasks.length >= 3) break;

    if (section.id === 'documents') {
      const missingDocs = state.requirements
        .filter((r) => r.required && r.status === 'required')
        .slice(0, 2);
      for (const doc of missingDocs) {
        if (tasks.length >= 3) break;
        tasks.push({ label: `Upload ${doc.title.toLowerCase()}`, sectionId: 'documents' });
      }
    } else {
      const sectionSteps = ALL_STEPS.filter((s) => STEP_SECTION[s] === section.id);
      const firstStep = sectionSteps[0];
      if (firstStep) {
        tasks.push({ label: STEP_LABELS[firstStep], sectionId: section.id });
      }
    }
  }

  return tasks.slice(0, 3);
}

// ─── Heading helper ────────────────────────────────────────────────────────

function getEncouragingHeading(completedCount: number, totalCount: number, isComplete: boolean): string {
  if (isComplete) return 'You\'re all set!';
  if (completedCount === 0) return 'Let\'s get started';
  if (completedCount === 1) return 'Great first step!';
  if (completedCount / totalCount < 0.5) return 'You\'re making progress';
  if (completedCount / totalCount < 0.8) return 'More than halfway there!';
  return 'Almost done!';
}

// ─── Main Component ────────────────────────────────────────────────────────

export function TaskList() {
  const { state, readinessScore, goToSection } = useApplication();

  const sections = state.sections.filter((s) => s.id !== 'collect_keys');
  const isComplete = readinessScore === 100;

  const completedCount = sections.filter((s) => s.status === 'complete').length;
  const totalCount = sections.length;

  const heading = getEncouragingHeading(completedCount, totalCount, isComplete);
  const subheading = isComplete
    ? `All ${totalCount} sections completed — ready to submit`
    : `${completedCount} of ${totalCount} sections completed`;

  const immediateTasks = getImmediateTasks(state);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Header ── */}
        <div>
          <h2
            className="font-display font-medium"
            style={{ fontSize: '22px', color: '#182026', letterSpacing: '-0.01em', marginBottom: '4px' }}
          >
            {heading}
          </h2>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#5A7387' }}>
            {subheading}
          </p>
        </div>

        {/* ── Segmented progress bars ── */}
        <div
          style={{ display: 'flex', gap: '4px', height: '6px' }}
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label="Application section progress"
        >
          {sections.map((section) => (
            <div
              key={section.id}
              style={{
                flex: 1,
                borderRadius: '999px',
                backgroundColor: section.status === 'complete' ? '#3126E3' : '#E1E8EE',
                transition: 'background-color 500ms ease',
              }}
            />
          ))}
        </div>

        {/* ── Separator ── */}
        <div style={{ height: '1px', backgroundColor: '#E1E8EE' }} />

        {/* ── Checklist rows ── */}
        {!isComplete && immediateTasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#5A7387', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Up next
            </p>
            {immediateTasks.map((task, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSection(task.sectionId)}
                className="focus-ring row-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 8px',
                  borderRadius: '8px',
                }}
              >
                {/* Circle indicator */}
                <div
                  style={{
                    flexShrink: 0,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
                <span style={{ flex: 1, fontSize: '13px', color: '#182026', fontWeight: '600' }}>
                  {task.label}
                </span>
                <ChevronRight style={{ flexShrink: 0, width: '14px', height: '14px', color: '#9CA3AF' }} />
              </button>
            ))}
          </div>
        )}

        {/* ── All sections checklist (when no immediate tasks, show section list) ── */}
        {!isComplete && immediateTasks.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => goToSection(section.id)}
                className="focus-ring row-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 8px',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: section.status === 'complete' ? 'none' : '1.5px solid #CBD5E1',
                    backgroundColor: section.status === 'complete' ? '#6CAD0A' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {section.status === 'complete' && (
                    <Check style={{ width: '11px', height: '11px', color: '#ffffff', strokeWidth: 2.5 }} />
                  )}
                </div>
                <span style={{
                  flex: 1,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: section.status === 'complete' ? '#5A7387' : '#182026',
                  textDecoration: section.status === 'complete' ? 'line-through' : 'none',
                }}>
                  {SECTION_LABELS[section.id as SectionId]}
                </span>
                {section.status !== 'complete' && (
                  <ChevronRight style={{ flexShrink: 0, width: '14px', height: '14px', color: '#9CA3AF' }} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Completion state ── */}
        {isComplete && (
          <div
            style={{
              backgroundColor: '#EEFDD9',
              border: '1px solid #CEF88C',
              borderRadius: '8px',
              padding: '12px 16px',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#3C6006', margin: 0 }}>
              All sections complete — your application is ready for lender review.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
