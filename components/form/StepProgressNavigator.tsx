'use client';

import React, { useState } from 'react';
import { useApplication, SECTION_LABELS, SECTION_FIRST_STEP } from '@/context/ApplicationContext';
import { Check, ChevronDown } from 'lucide-react';
import { SectionId } from '@/types/tasks';

// Inject hover/focus styles once
const STEP_NAV_STYLES = `
  .step-nav-item {
    transition: background-color 120ms ease, opacity 120ms ease;
  }
  .step-nav-item:hover {
    background-color: #F7F8FC !important;
  }
  .step-nav-item:hover .step-nav-title {
    color: #3126E3 !important;
  }
  .step-nav-item:focus-visible {
    outline: 2px solid #3126E3;
    outline-offset: 2px;
    background-color: #F7F8FC !important;
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
  const { currentSectionId, state, openModal, goToSection } = useApplication();
  const sectionFirstStep = SECTION_FIRST_STEP;
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
      description: STEP_DESCRIPTIONS[section.id] ?? '',
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

  const currentIndex = currentProgressItem ? progressItems.indexOf(currentProgressItem) + 1 : 1;
  const totalSteps = progressItems.length;

  return (
    <div className="relative inline-flex items-center">
      <style>{STEP_NAV_STYLES}</style>
      {/* Collapsed — minimal text pill */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onBlur={() => setTimeout(() => setIsExpanded(false), 100)}
        className="flex items-center gap-2 px-3 py-1.5 btn-interactive"
        style={{
          backgroundColor: 'transparent',
          border: '1.5px solid #E1E8EE',
          borderRadius: '999px',
          cursor: 'pointer',
        }}
        aria-expanded={isExpanded}
        aria-label="Step progress indicator"
      >
        {currentProgressItem && (
          <>
            <span className="text-sm font-semibold" style={{ color: '#182026' }}>
              {currentProgressItem.label}
            </span>
            <span className="text-sm" style={{ color: '#9CA3AF', fontWeight: '500' }}>
              {currentIndex} / {totalSteps}
            </span>
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-150"
              style={{ color: '#9CA3AF', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </>
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
                  backgroundColor: item.status === 'current' ? '#F7F8FC' : 'transparent',
                  cursor: item.status === 'current' ? 'default' : 'pointer',
                  border: 'none',
                }}
              >
                {/* Status indicator */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-120"
                  style={{
                    backgroundColor:
                      item.status === 'completed' ? '#6CAD0A' :
                      item.status === 'current' ? '#3126E3' :
                      '#E5E7EB',
                  }}
                >
                  {item.status === 'completed' ? (
                    <Check className="w-3 h-3 text-white stroke-[2.5]" />
                  ) : (
                    <span
                      className="text-[10px] font-semibold leading-none"
                      style={{ color: item.status === 'current' ? '#ffffff' : '#9CA3AF' }}
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
