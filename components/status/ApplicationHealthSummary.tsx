'use client';

import { useState } from 'react';
import { useApplication, ALL_STEPS, STEP_SECTION, STEP_LABELS } from '@/context/ApplicationContext';
import { AlertCircle, CheckCircle2, ArrowRight, FileText, Upload, ChevronRight } from 'lucide-react';
import type { StepId } from '@/context/ApplicationContext';

// ─── Types ─────────────────────────────────────────────────────────────────

interface NextTask {
  id: string;
  label: string;
  type: 'question' | 'document';
  stepId?: StepId;
  requirementId?: string;
}

interface SectionPreview {
  sectionId: string;
  label: string;
  missing: string[];
  completed: string[];
  progress: number;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ApplicationHealthSummary() {
  const { state, readinessScore, currentStep, openModal, goToStep } = useApplication();
  const sections = state.sections.filter((s) => s.id !== 'collect_keys');
  const complete = sections.filter((s) => s.status === 'complete').length;
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Build section previews with missing/completed items
  const sectionPreviews: SectionPreview[] = sections.map((section) => {
    const sectionSteps = ALL_STEPS.filter((s) => STEP_SECTION[s] === section.id);
    const currentIdx = currentStep ? ALL_STEPS.indexOf(currentStep) : 0;
    
    // For documents section, check requirements instead of steps
    if (section.id === 'documents') {
      const unverifiedDocs = (state.requirements || []).filter(
        (r) => r.required && r.status !== 'verified'
      );
      const verifiedDocs = (state.requirements || []).filter(
        (r) => r.required && r.status === 'verified'
      );
      return {
        sectionId: section.id,
        label: section.label,
        missing: unverifiedDocs.map((d) => d.title),
        completed: verifiedDocs.map((d) => d.title),
        progress: verifiedDocs.length / (verifiedDocs.length + unverifiedDocs.length) * 100 || 0,
      };
    }
    
    // For other sections, check step completion
    const completedSteps = sectionSteps.filter((s) => ALL_STEPS.indexOf(s) < currentIdx);
    const missingSteps = sectionSteps.filter((s) => ALL_STEPS.indexOf(s) >= currentIdx);
    
    return {
      sectionId: section.id,
      label: section.label,
      missing: missingSteps.slice(0, 5).map((s) => STEP_LABELS[s] || s),
      completed: completedSteps.map((s) => STEP_LABELS[s] || s),
      progress: sectionSteps.length > 0 ? (completedSteps.length / sectionSteps.length) * 100 : 0,
    };
  });

  // Calculate next actionable tasks
  const nextTasks: NextTask[] = [];
  
  // Find next incomplete question step
  const currentIdx = currentStep ? ALL_STEPS.indexOf(currentStep) : 0;
  for (let i = currentIdx; i < ALL_STEPS.length && nextTasks.length < 3; i++) {
    const step = ALL_STEPS[i];
    // Skip intro steps and upload steps for task list
    if (!step.startsWith('intro_') && !step.includes('upload')) {
      nextTasks.push({
        id: `step-${step}`,
        label: STEP_LABELS[step] || step,
        type: 'question',
        stepId: step,
      });
      break; // Only show one question task
    }
  }
  
  // Add unverified required documents
  const unverifiedDocs = (state.requirements || []).filter(
    (r) => r.required && r.status !== 'verified'
  ).slice(0, 3);
  
  unverifiedDocs.forEach((doc) => {
    if (nextTasks.length < 4) {
      nextTasks.push({
        id: `doc-${doc.id}`,
        label: `Upload ${doc.title.toLowerCase()}`,
        type: 'document',
        requirementId: doc.id,
      });
    }
  });

  // Handle clicking a task to navigate
  const handleTaskClick = (task: NextTask) => {
    if (task.stepId) {
      goToStep(task.stepId);
      openModal();
    } else if (task.requirementId) {
      // Navigate to documents section
      const docsStep = ALL_STEPS.find((s) => s === 'docs_overview');
      if (docsStep) {
        goToStep(docsStep);
        openModal();
      }
    }
  };

  // Handle clicking a section pill
  const handleSectionClick = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section && section.steps && section.steps.length > 0) {
      const firstStep = section.steps[0] as StepId;
      goToStep(firstStep);
      openModal();
    }
  };

  return (
    <div className="space-y-5">
      {/* Progress section */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">Application progress</p>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {complete} <span className="text-base font-medium text-muted-foreground">of {sections.length} sections completed</span>
        </p>
        {readinessScore === 100 && (
          <p className="text-xs font-semibold mt-1" style={{ color: '#3C6006' }}>All sections complete — ready to submit</p>
        )}
      </div>

      {/* Section pills with hover previews */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Sections</p>
        <div className="flex flex-wrap gap-2">
          {sectionPreviews.map((section) => {
            const isComplete = section.progress >= 100;
            const isHovered = hoveredSection === section.sectionId;
            return (
              <div key={section.sectionId} className="relative">
                <button
                  onClick={() => handleSectionClick(section.sectionId)}
                  onMouseEnter={() => setHoveredSection(section.sectionId)}
                  onMouseLeave={() => setHoveredSection(null)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: isComplete ? '#EEFDD9' : '#FEF3C7',
                    color: isComplete ? '#3C6006' : '#92400E',
                    border: `1px solid ${isComplete ? '#CEF88C' : '#FCD34D'}`,
                  }}
                >
                  {isComplete ? '✓ ' : ''}{section.label}
                </button>
                
                {/* Hover preview tooltip */}
                {isHovered && section.missing.length > 0 && (
                  <div
                    className="absolute z-50 left-0 top-full mt-2 w-56 p-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-1 duration-150"
                    style={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}
                  >
                    {section.missing.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold mb-1.5" style={{ color: '#92400E' }}>
                          Missing:
                        </p>
                        <ul className="space-y-1">
                          {section.missing.slice(0, 4).map((item, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                              {item}
                            </li>
                          ))}
                          {section.missing.length > 4 && (
                            <li className="text-xs text-muted-foreground">
                              +{section.missing.length - 4} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {section.completed.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: '#3C6006' }}>
                          Completed:
                        </p>
                        <ul className="space-y-1">
                          {section.completed.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" style={{ color: '#6CAD0A' }} />
                              {item}
                            </li>
                          ))}
                          {section.completed.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{section.completed.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next things to complete - with direct navigation */}
      {nextTasks.length > 0 && readinessScore < 100 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Next Things To Complete</p>
          <div className="space-y-1.5">
            {nextTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-muted/50 group text-left"
                style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: task.type === 'document' ? '#DBEAFE' : '#F3E8FF',
                  }}
                >
                  {task.type === 'document' ? (
                    <Upload className="w-3.5 h-3.5" style={{ color: '#2563EB' }} />
                  ) : (
                    <FileText className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {task.label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick action button */}
      {readinessScore < 100 && (
        <button
          onClick={() => openModal()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#3126E3', color: '#ffffff' }}
        >
          Continue application
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* Completion message */}
      {readinessScore === 100 && (
        <div className="rounded-lg p-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <p className="text-xs font-medium" style={{ color: '#065F46' }}>
            Your application is ready for submission.
          </p>
        </div>
      )}
    </div>
  );
}
