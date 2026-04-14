'use client';

import React, { useState } from 'react';
import { useApplication, ALL_STEPS, STEP_SECTION, SECTION_LABELS, SECTION_FIRST_STEP } from '@/context/ApplicationContext';
import { Check } from 'lucide-react';
import { SectionId } from '@/types/tasks';

// Inject hover/focus styles once
const STEP_NAV_STYLES = `
  .step-nav-item {
    transition: background-color 120ms ease, opacity 120ms ease;
  }
  .step-nav-item:hover {
    background-color: #F1F3F7 !important;
  }
  .step-nav-item:hover .step-nav-title {
    color: #3126E3 !important;
  }
  .step-nav-item:focus-visible {
    outline: 2px solid #3126E3;
    outline-offset: 2px;
    background-color: #F1F3F7 !important;
  }
  .step-nav-item:hover .step-nav-arrow,
  .step-nav-item:focus-visible .step-nav-arrow {
    opacity: 1;
    transform: translateX(2px);
  }
  .step-nav-arrow {
    opacity: 0;
    transform: translateX(0);
    transition: opacity 120ms ease, transform 120ms ease;
  }
`;

// Step descriptions for the expanded view
const STEP_DESCRIPTIONS: Partial<Record<SectionId, string>> = {
  welcome: 'Get started with your application',
  about_you: 'Personal details and household info',
  property_mortgage: 'Property and mortgage requirements',
  employment_income: 'Income and employment verification',
  documents: 'Upload identity and income documents',
  agreements: 'Review and sign your agreement',
  collect_keys: 'Final submission and next steps',
};

interface StepProgressItem {
  sectionId: SectionId;
  label: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  isClickable: boolean;
  isUnlocked: boolean;
}

export function StepProgressNavigator() {
  const { currentSectionId, state, openModal, goToSection, SECTION_FIRST_STEP: sectionFirstStep } = useApplication();
  const [isExpanded, setIsExpanded] = useState(false);

  // Build the progress items
  const progressItems: StepProgressItem[] = state.sections.map((section) => {
    const isCurrent = section.id === currentSectionId;
    const isCompleted = section.status === 'complete';
    const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming';
    const isUnlocked = isCompleted || isCurrent || section.status === 'in_progress';

    return {
      sectionId: section.id,
      label: SECTION_LABELS[section.id],
      description: STEP_DESCRIPTIONS[section.id],
      status,
      isClickable: true, // all sections are always navigable
      isUnlocked,
    };
  });

  const currentProgressItem = progressItems.find(item => item.status === 'current');

  const handleStepClick = (item: StepProgressItem) => {
    if (item.sectionId === currentSectionId) {
      setIsExpanded(false);
      return;
    }
    if (item.status === 'completed') {
      // Already have data — navigate directly
      const firstStep = SECTION_FIRST_STEP[item.sectionId];
      openModal(firstStep);
    } else {
      // Upcoming — jump to the section's first step
      goToSection(item.sectionId);
    }
    setIsExpanded(false);
  };

  return (
    <div className="relative inline-flex items-center" style={{ border: '1.5px solid #E1E8EE', borderRadius: '8px', paddingLeft: '4px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px' }}>
      <style>{STEP_NAV_STYLES}</style>
      {/* Collapsed view - horizontal step indicators */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onBlur={() => setTimeout(() => setIsExpanded(false), 100)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-full row-interactive"
        style={{
          backgroundColor: 'transparent',
          border: '0px',
          cursor: 'pointer',
        }}
        aria-expanded={isExpanded}
        aria-label="Step progress indicator"
      >
        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {progressItems.map((item, index) => (
            <React.Fragment key={item.sectionId}>
              {/* Step circle */}
              <div
                className="w-6 h-6 flex items-center justify-center transition-interaction flex-shrink-0"
                style={{
                  borderRadius: '8px',
                  backgroundColor:
                    item.status === 'completed' ? '#6CAD0A' :
                    item.status === 'current' ? '#3126E3' :
                    '#ffffff',
                  border: item.status === 'current' ? '2px solid #3126E3' : 'none',
                  boxShadow: item.status === 'current' ? '0 0 0 4px rgba(49, 38, 227, 0.1)' : 'none',
                }}
                title={item.label}
              >
                {item.status === 'completed' ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: item.status === 'upcoming' ? '#6B7A8D' : '#ffffff' }}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Connector line - not after last */}
              {index < progressItems.length - 1 && (
                <div
                  className="h-0.5 w-2 transition-all duration-120"
                  style={{
                    backgroundColor:
                      item.status === 'completed' ? '#6CAD0A' :
                      '#E1E8EE',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Current section label */}
        {currentProgressItem && (
          <div className="flex flex-col gap-0.5 ml-1">
            <p className="text-xs font-semibold text-foreground">{currentProgressItem.label}</p>
            <p className="text-[10px]" style={{ fontWeight: '500', color: '#182026' }}>
              {progressItems.indexOf(currentProgressItem) + 1} of {progressItems.length}
            </p>
          </div>
        )}
      </button>

      {/* Expanded view - detailed section list */}
      {isExpanded && (
        <div
          className="absolute top-full left-0 mt-2 w-80 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-160 z-50"
          style={{
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 30px rgba(24, 32, 38, 0.15), 0 2px 8px rgba(24, 32, 38, 0.08)',
            border: '1px solid #E5E7EB',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #F1F3F7' }}>
            <p className="text-xs font-semibold text-muted-foreground">Your Progress</p>
          </div>

          {/* Section list */}
          <div className="py-2 px-2 max-h-96 overflow-y-auto">
            {progressItems.map((item) => (
              <button
                key={item.sectionId}
                onClick={() => handleStepClick(item)}
                className="step-nav-item w-full px-3 py-2.5 text-left flex items-start gap-3"
                style={{
                  borderRadius: '8px',
                  backgroundColor: item.status === 'current' ? '#F1F3F7' : 'transparent',
                  cursor: item.status === 'current' ? 'default' : 'pointer',
                  border: 'none',
                }}
              >
                {/* Status indicator circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-120"
                  style={{
                    borderRadius: '8px',
                    backgroundColor:
                      item.status === 'completed' ? '#6CAD0A' :
                      item.status === 'current' ? '#3126E3' :
                      '#C8D0D8',
                    border: item.status === 'current' ? '2px solid #3126E3' : 'none',
                    boxShadow: item.status === 'current' ? '0 0 0 4px rgba(49, 38, 227, 0.1)' : 'none',
                  }}
                >
                  {item.status === 'completed' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span
                      className="text-sm font-semibold"
                      style={{ color: item.status === 'upcoming' ? '#6B7A8D' : '#ffffff' }}
                    >
                      {progressItems.indexOf(item) + 1}
                    </span>
                  )}
                </div>

                {/* Section info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="step-nav-title text-sm font-semibold"
                    style={{
                      color: item.status === 'upcoming' ? '#6B7A8D' : '#182026',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-xs mt-0.5 line-clamp-2"
                    style={{
                      color: item.status === 'upcoming' ? '#9AA5B1' : '#5A6A75',
                    }}
                  >
                    {item.description}
                  </p>
                  {item.status === 'completed' && (
                    <p className="text-xs font-semibold mt-1" style={{ color: '#3C6006' }}>Completed</p>
                  )}
                  {item.status === 'current' && (
                    <p className="text-xs font-semibold mt-1" style={{ color: '#3126E3' }}>In progress</p>
                  )}
                </div>

                {/* Animated arrow for all non-current items */}
                {item.status !== 'current' && (
                  <div
                    className="step-nav-arrow flex-shrink-0 mt-1 text-sm"
                    style={{ color: '#3126E3' }}
                  >
                    →
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close expanded view */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
          style={{ backgroundColor: 'transparent' }}
        />
      )}
    </div>
  );
}
