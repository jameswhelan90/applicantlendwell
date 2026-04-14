'use client';

import { useApplication, SECTION_LABELS, SECTION_FIRST_STEP, STEP_LABELS } from '@/context/ApplicationContext';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { SectionId } from '@/types/tasks';

const SECTION_DESCRIPTIONS: Partial<Record<SectionId, string>> = {
  welcome: 'Begin your application — it takes about 15 minutes to complete.',
  about_you: 'Tell us about yourself and your household.',
  property_mortgage: 'Tell us about your property goals and mortgage requirements.',
  employment_income: 'Tell us about your employment, income, and monthly outgoings.',
  documents: 'Upload your supporting documents so we can verify your details.',
  agreements: 'Review the declarations and sign your application.',
  collect_keys: 'Your application is ready — review and submit.',
};

const SECTION_WHY: Partial<Record<SectionId, string>> = {
  welcome: 'Starting your application locks in your place in the queue and protects your details.',
  about_you: 'Lenders need to verify your identity and understand your household circumstances.',
  property_mortgage: 'Knowing your property situation helps us match you with the right products.',
  employment_income: 'Accurate income and employment details are the foundation of your mortgage assessment.',
  documents: 'Lenders require verified documentation before progressing any application.',
  agreements: 'Your application cannot be submitted without your signed declarations.',
  collect_keys: 'Submitting now gives your broker everything they need to approach lenders on your behalf.',
};

export function NextActionCard() {
  const { state, openModal, canSubmit } = useApplication();

  // Find the first incomplete section
  const nextSection = state.sections.find((s) => s.status !== 'complete');

  // All complete
  if (!nextSection) {
    return (
      <div
        className="bg-card rounded-xl shadow-card border border-border p-6 text-center"
        style={{ borderWidth: '0px' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#EEFDD9' }}
        >
          <CheckCircle2 className="w-6 h-6" style={{ color: '#6CAD0A' }} />
        </div>
        <h2 className="text-lg font-display font-medium text-foreground mb-1">
          Application complete
        </h2>
        <p className="text-sm text-muted-foreground font-medium text-pretty">
          You have completed all sections. Your application is ready to submit.
        </p>
      </div>
    );
  }

  const sectionId = nextSection.id as SectionId;
  const firstStep = SECTION_FIRST_STEP[sectionId];
  const isWelcome = sectionId === 'welcome';

  // Special welcome card layout - horizontal hero with team photo
  if (isWelcome) {
    return (
      <div
        className="rounded-xl overflow-hidden flex items-stretch"
        style={{
          minHeight: '280px',
          boxShadow: '0 4px 12px rgba(24, 32, 38, 0.08)',
        }}
      >
        {/* Left content */}
        <div className="flex-1 flex flex-col justify-between" style={{ maxWidth: '55%', backgroundColor: '#ffffff', padding: '20px' }}>
          <div className="space-y-5">
            <div>
              <h2
                className="font-display font-semibold text-balance leading-tight"
                style={{ fontSize: '24px', color: '#182026', marginBottom: '6px' }}
              >
                Welcome
              </h2>
              <p className="font-medium text-muted-foreground leading-relaxed" style={{ fontSize: '16px' }}>
                It&apos;s time to meet your advisor and learn about the mortgage journey
              </p>
            </div>
          </div>
          
          <button
            onClick={() => openModal(firstStep)}
            className="w-fit px-7 py-3 rounded-full font-semibold text-base flex items-center gap-2 btn-interactive"
            style={{ backgroundColor: '#3126E3', color: '#ffffff' }}
          >
            Start Here
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right side - team photo */}
        <div className="flex-1 relative overflow-hidden" style={{ maxWidth: '45%' }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bristol1-LccOjH08cdx6tLEzIFNynaSCoWK6y7.jpg"
            alt="Mortgage advisor team"
            className="w-full h-full object-cover"
          />
          {/* Time badge */}
          <div
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}
          >
            <Clock className="w-4 h-4" style={{ color: '#3126E3' }} />
            <span className="text-sm font-semibold" style={{ color: '#3126E3' }}>2 min</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card shadow-card overflow-hidden"
      style={{ borderRadius: '12px', borderWidth: '0px' }}
    >
      <div
        className="p-5"
        style={{ paddingTop: '20px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px' }}
      >
        <p
          className="text-muted-foreground mb-3"
          style={{ fontSize: '0.825rem', fontWeight: '600', letterSpacing: '0', textTransform: 'none' }}
        >
          {nextSection.status === 'in_progress' ? 'Continue where you left off' : 'Your next step'}
        </p>

        <h2
          className="font-display font-medium text-balance mb-2 leading-snug"
          style={{ fontSize: '1.25rem', color: '#182026' }}
        >
          {SECTION_LABELS[sectionId]}
        </h2>

        <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-5">
          {SECTION_DESCRIPTIONS[sectionId]}
        </p>

        {/* Why this matters */}
        <div
          className="px-4 py-3 mb-6"
          style={{ backgroundColor: '#F7F8FC', borderRadius: '8px' /* small info box */ }}
        >
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            <span className="font-semibold" style={{ color: '#182026' }}>
              Why this matters —&nbsp;
            </span>
            {SECTION_WHY[sectionId]}
          </p>
        </div>

        <button
          onClick={() => openModal(firstStep)}
          className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full btn-interactive group"
          style={{ backgroundColor: '#3126E3', color: '#ffffff' }}
        >
          {isWelcome ? 'Start application' : nextSection.status === 'in_progress' ? 'Continue' : 'Begin'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
