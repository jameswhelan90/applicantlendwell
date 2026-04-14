import { SectionId } from '@/types/tasks';

export const APPLICATION_PHASES: SectionId[] = [
  'welcome',
  'financial_profile',
  'documents',
  'house_hunting',
  'agreements',
  'completion',
];

export const PHASE_DESCRIPTIONS: Record<SectionId, string> = {
  welcome: 'Introduction and overview of the application process.',
  financial_profile: 'Your personal details, employment, income, and financial commitments.',
  documents: 'Upload and verify your supporting documents.',
  house_hunting: 'Your property search stage and purchase details.',
  agreements: 'Review declarations, give consent, and sign your application.',
  completion: 'Finalise and submit your mortgage application.',
};
