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

  const currentSection = sections.find((s) => s.id === currentSectionId);
  const currentSectionLabel = currentSection?.label ?? null;

  const incompleteSections = sections
    .filter((s) => s.status !== 'complete')
    .slice(0, 4);

  const immediateTasks = getImmediateTasks(state);

  return (
    <div
      style={{
        border: '1px solid #E1E8EE',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#182026' }}>
            Application Readiness
          </span>
          <span style={{ fontSize: '16px', fontWeight: '500', color: '#182026' }}>
            {milestoneLabel}
          </span>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Track */}
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '999px',
              backgroundColor: '#ffffff',
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

          {/* Current section label */}
          {currentSectionLabel && !isComplete && (
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#182026' }}>
              Current section: <span style={{ color: '#182026', fontWeight: '600' }}>{currentSectionLabel}</span>
            </span>
          )}
        </div>

        {/* ── Separator ── */}
        <div style={{ height: '1px', backgroundColor: '#F7F8FC' }} />

        {/* ── Remaining sections ── */}
        {!isComplete && incompleteSections.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#182026', textTransform: 'capitalize', letterSpacing: '0em' }}>
              Remaining
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {incompleteSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => goToSection(section.id)}
                  className="focus-ring row-interactive"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#42535F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                  }}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Separator ── */}
        {!isComplete && immediateTasks.length > 0 && (
          <div style={{ height: '1px', backgroundColor: '#F7F8FC' }} />
        )}

        {/* ── Next tasks ── */}
        {!isComplete && immediateTasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#182026', textTransform: 'capitalize', letterSpacing: '0em' }}>
              Next things to complete
            </span>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {immediateTasks.map((task, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => goToSection(task.sectionId)}
                    className="focus-ring row-interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
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
                    <span style={{ fontSize: '14px', color: '#182026', fontWeight: '500' }}>
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
              backgroundColor: '#EDECFD',
              border: '1px solid #D9D7FF',
              borderRadius: '8px',
              padding: '12px 14px',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#3126E3', margin: 0 }}>
              Your application is ready for lender review.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
