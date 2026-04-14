'use client';

import { useApplication, SECTION_LABELS, SECTION_FIRST_STEP } from '@/context/ApplicationContext';
import { JourneySection, SectionId } from '@/types/tasks';
import { Check } from 'lucide-react';

interface JourneyTrackerProps {
  compact?: boolean;
}

export function JourneyTracker({ compact = false }: JourneyTrackerProps) {
  const { state, selectedJourneyStep, selectJourneyStep } = useApplication();
  const { sections } = state;

  const handleSectionClick = (section: JourneySection) => {
    // Only update the sidebar selection to show the section overview panel — do not open the form modal
    selectJourneyStep(section.id);
  };

  return (
    <nav
      aria-label="Application journey"
      style={{
        paddingTop: '16px',
        paddingBottom: '12px',
        paddingLeft: '12px',
        paddingRight: '12px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      }}
    >
      <p
        style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', marginLeft: '10px', marginRight: '10px', color: '#5A7387' }}
      >
        Your Journey
</p>

      <ol className="space-y-1">
        {sections.map((section, index) => {
          const isComplete = section.status === 'complete';
          const isSelected = section.id === selectedJourneyStep;
          const isUpcoming = section.status === 'not_started' && !isSelected;

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleSectionClick(section)}
                aria-current={isSelected ? 'page' : undefined}
                className={`w-full flex items-center gap-3 py-2.5 nav-interactive ${
                  isSelected
                    ? 'bg-white'
                    : ''
                }`}
                style={
                  isSelected
                    ? { boxShadow: '0px 2px 8px 0px rgba(24, 32, 38, 0.12)', paddingRight: '20px', paddingLeft: '10px', borderRadius: '999px', border: 'none', background: '#ffffff', cursor: 'pointer' }
                    : { paddingLeft: '10px', paddingRight: '12px', borderRadius: '999px', border: 'none', background: 'transparent', cursor: 'pointer' }
                }
              >
                {/* Step indicator */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: isComplete
                      ? '#3126E3'
                      : isSelected
                      ? 'rgba(49,38,227,0.10)'
                      : '#F7F8FC',
                    border: isUpcoming ? '1px solid #E5E7EB' : 'none',
                  }}
                >
                  {isComplete ? (
                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  ) : (
                    <span
                      className="text-[11px] font-semibold leading-none"
                      style={{ color: isSelected ? '#3126E3' : '#9CA3AF' }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className="text-sm leading-snug"
                  style={{
                    color: isComplete || isSelected ? '#182026' : '#6B7280',
                    fontWeight: '600',
                  }}
                >
                  {SECTION_LABELS[section.id as SectionId]}
                </span>

                {/* Active indicator dot — only on current step */}
                {isSelected && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 dot-pulse"
                    style={{ backgroundColor: '#3126E3' }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
