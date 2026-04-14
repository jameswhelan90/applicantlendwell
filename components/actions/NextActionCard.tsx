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

  const nextSection = state.sections.find((s) => s.status !== 'complete');

  // All complete
  if (!nextSection) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#EEFDD9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <CheckCircle2 className="w-5 h-5" style={{ color: '#6CAD0A' }} />
        </div>
        <h2 className="font-display font-medium text-foreground mb-1" style={{ fontSize: '18px' }}>
          Application complete
        </h2>
        <p className="text-sm font-medium text-pretty" style={{ color: '#5A7387' }}>
          You have completed all sections. Your application is ready to submit.
        </p>
      </div>
    );
  }

  const sectionId = nextSection.id as SectionId;
  const firstStep = SECTION_FIRST_STEP[sectionId];
  const isWelcome = sectionId === 'welcome';

  // Special welcome card — horizontal hero with team photo
  if (isWelcome) {
    return (
      <div
        className="overflow-hidden flex items-stretch"
        style={{
          minHeight: '260px',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Left content */}
        <div
          className="flex flex-col justify-between"
          style={{ maxWidth: '55%', backgroundColor: '#ffffff', padding: '28px 24px' }}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: '#5A7387', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Welcome
            </p>
            <h2
              className="font-display font-medium text-balance leading-tight"
              style={{ fontSize: '22px', color: '#182026' }}
            >
              Let&apos;s get your mortgage journey started
            </h2>
            <p className="text-sm font-medium leading-relaxed" style={{ color: '#5A7387' }}>
              Meet your adviser and learn about the process
            </p>
          </div>

          <button
            onClick={() => openModal(firstStep)}
            className="w-fit flex items-center gap-2 font-semibold text-sm btn-interactive"
            style={{
              backgroundColor: '#3126E3',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '10px 20px',
            }}
          >
            Start here
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right side — team photo */}
        <div className="flex-1 relative overflow-hidden" style={{ maxWidth: '45%' }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bristol1-LccOjH08cdx6tLEzIFNynaSCoWK6y7.jpg"
            alt="Mortgage advisor team"
            className="w-full h-full object-cover"
          />
          {/* Time badge */}
          <div
            className="absolute flex items-center gap-1.5 rounded-full"
            style={{
              top: '16px',
              right: '16px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.6)',
            }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: '#3126E3' }} />
            <span className="text-xs font-semibold" style={{ color: '#3126E3' }}>2 min</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px' }}>
        {/* Status label */}
        <p
          className="font-semibold mb-3"
          style={{ fontSize: '11px', color: '#5A7387', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          {nextSection.status === 'in_progress' ? 'Continue where you left off' : 'Your next step'}
        </p>

        {/* Section heading */}
        <h2
          className="font-display font-medium text-balance leading-snug mb-2"
          style={{ fontSize: '20px', color: '#182026' }}
        >
          {SECTION_LABELS[sectionId]}
        </h2>

        {/* Description */}
        <p className="text-sm font-medium leading-relaxed mb-5" style={{ color: '#5A7387' }}>
          {SECTION_DESCRIPTIONS[sectionId]}
        </p>

        {/* Why this matters */}
        <div
          className="mb-6"
          style={{
            backgroundColor: '#F7F8FC',
            borderRadius: '8px',
            border: '1px solid #E1E8EE',
            padding: '12px 16px',
          }}
        >
          <p className="text-xs font-medium leading-relaxed" style={{ color: '#5A7387' }}>
            <span className="font-semibold" style={{ color: '#182026' }}>
              Why this matters —&nbsp;
            </span>
            {SECTION_WHY[sectionId]}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => openModal(firstStep)}
          className="inline-flex items-center gap-2 font-semibold text-sm btn-interactive group"
          style={{
            backgroundColor: '#3126E3',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '10px 20px',
          }}
        >
          {nextSection.status === 'in_progress' ? 'Continue' : 'Begin'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
