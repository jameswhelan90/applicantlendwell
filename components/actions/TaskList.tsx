'use client';

import { useApplication, ALL_STEPS, STEP_SECTION, STEP_LABELS } from '@/context/ApplicationContext';
import { SectionId } from '@/types/tasks';

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

// ─── Main Component ────────────────────────────────────────────────────────

export function TaskList() {
  const { state, readinessScore, currentSectionId, goToSection } = useApplication();

  const sections = state.sections.filter((s) => s.id !== 'collect_keys');
  const isComplete = readinessScore === 100;

  const completedCount = sections.filter((s) => s.status === 'complete').length;
  const totalCount = sections.length;

  const milestoneLabel = isComplete
    ? `All ${totalCount} sections completed`
    : completedCount === 0
    ? `0 of ${totalCount} sections completed`
    : `${completedCount} of ${totalCount} sections completed`;

  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const incompleteSections = sections
    .filter((s) => s.status !== 'complete')
    .slice(0, 4);

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#182026' }}>
            Application Readiness
          </span>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#5A7387' }}>
            {milestoneLabel}
          </span>
        </div>

        {/* ── Progress bar ── */}
        <div
          style={{
            width: '100%',
            height: '4px',
            borderRadius: '999px',
            backgroundColor: '#F1F5F9',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Application completion progress"
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              borderRadius: '999px',
              backgroundColor: '#3126E3',
              transition: 'width 600ms ease',
            }}
          />
        </div>

        {/* ── Separator ── */}
        <div style={{ height: '1px', backgroundColor: '#E1E8EE', margin: '-4px 0' }} />

        {/* ── Remaining sections ── */}
        {!isComplete && incompleteSections.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#5A7387', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Remaining
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {incompleteSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(section.id)}
                  className="focus-ring transition-interaction"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#42535F',
                    backgroundColor: '#F7F8FC',
                    border: '1px solid #E1E8EE',
                    borderRadius: '999px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                  }}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Next tasks ── */}
        {!isComplete && immediateTasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#5A7387', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Next to complete
            </span>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {immediateTasks.map((task, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => goToSection(task.sectionId)}
                    className="focus-ring row-interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: '#3126E3',
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#182026', fontWeight: '500' }}>
                      {task.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
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
