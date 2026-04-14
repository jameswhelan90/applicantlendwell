import { SectionId } from '@/types/tasks';

export const APPLICATION_PHASES: SectionId[] = [
  'welcome',
  'about_you',
  'property_mortgage',
  'employment_income',
  'documents',
  'agreements',
  'collect_keys',
];

export const PHASE_DESCRIPTIONS: Record<SectionId, string> = {
  welcome: 'Introduction and overview of the application process.',
  about_you: 'Your personal details, household, and residency information.',
  property_mortgage: 'Your property goals and mortgage requirements.',
  employment_income: 'Your employment, income, and financial commitments.',
  documents: 'Upload and verify your supporting documents.',
  agreements: 'Review declarations, give consent, and sign your application.',
  collect_keys: 'Finalise and submit your mortgage application.',
};
