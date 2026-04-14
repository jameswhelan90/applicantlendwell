import { JourneySection, SectionId, ApplicationState } from '@/types/tasks';

/**
 * Returns the number of completed sections
 */
export function getCompletedSectionCount(sections: JourneySection[]): number {
  return sections.filter((s) => s.status === 'complete').length;
}

/**
 * Returns the current active section (first in_progress or the first not_started)
 */
export function getCurrentSection(sections: JourneySection[]): JourneySection | null {
  const inProgress = sections.find((s) => s.status === 'in_progress');
  if (inProgress) return inProgress;
  const notStarted = sections.find((s) => s.status === 'not_started');
  return notStarted ?? null;
}

/**
 * Returns a friendly progress summary string
 */
export function getProgressSummary(sections: JourneySection[]): string {
  const completed = getCompletedSectionCount(sections);
  const total = sections.filter((s) => s.id !== 'collect_keys').length;
  if (completed === 0) return "Let's get your application started";
  if (completed < 2) return 'Good start — keep going';
  if (completed < total - 1) return 'Good progress — keep going';
  return 'Almost there';
}

/**
 * Determines the readiness score from 0-100
 * Based on completed sections and verified requirements
 */
export function calculateReadiness(state: ApplicationState): number {
  const sections = state.sections.filter((s) => s.id !== 'collect_keys');
  const completedSections = sections.filter((s) => s.status === 'complete').length;
  const sectionScore = (completedSections / sections.length) * 60; // 60% from sections
  
  // Add 40% from requirements verification (documents section)
  const requiredReqs = (state.requirements || []).filter((r) => r.required);
  const verifiedReqs = requiredReqs.filter((r) => r.status === 'verified').length;
  const requirementsScore = requiredReqs.length > 0
    ? (verifiedReqs / requiredReqs.length) * 40
    : 40;
  
  return Math.round(sectionScore + requirementsScore);
}

/**
 * Whether the application can be submitted
 */
export function canSubmitApplication(state: ApplicationState): boolean {
  const required: SectionId[] = ['welcome', 'about_you', 'property_mortgage', 'employment_income', 'documents', 'agreements'];
  return required.every((sid) => {
    const section = state.sections.find((s) => s.id === sid);
    return section?.status === 'complete';
  });
}

/**
 * Returns human-readable document status label
 */
export function getDocumentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    required: 'Required',
    optional: 'Optional',
    uploaded: 'Uploaded',
    processing: 'Processing',
    verified: 'Verified',
    rejected: 'Needs attention',
  };
  return labels[status] ?? status;
}
