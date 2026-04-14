'use client';

import { useMemo } from 'react';
import { Key, Send, Phone, FileCheck, Clock, CheckCircle2 } from 'lucide-react';

interface CompletionSectionProps {
  isFullyComplete: boolean;
}

interface ConfettiParticleProps {
  color: string;
  size: number;
  startX: number;
  delay: number;
  duration: number;
  shape: 'circle' | 'line' | 'square';
  rotation: number;
  swayAmount: number;
}

// Falling confetti particle component with CSS animation
function ConfettiParticle({ 
  color, 
  size, 
  startX,
  delay, 
  duration,
  shape,
  rotation,
  swayAmount,
}: ConfettiParticleProps) {
  const animationStyle = {
    '--start-x': `${startX}%`,
    '--sway': `${swayAmount}px`,
    '--rotation': `${rotation}deg`,
    '--end-rotation': `${rotation + 360}deg`,
  } as React.CSSProperties;

  return (
    <div
      className="absolute opacity-0"
      style={{
        left: `${startX}%`,
        top: '-20px',
        animation: `confettiFall ${duration}s ease-in-out ${delay}s infinite`,
        ...animationStyle,
      }}
    >
      {shape === 'circle' && (
        <div
          className="rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
        />
      )}
      {shape === 'line' && (
        <div
          style={{
            width: size * 3,
            height: size / 2,
            backgroundColor: color,
            borderRadius: 2,
            transform: `rotate(${rotation}deg)`,
          }}
        />
      )}
      {shape === 'square' && (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: 2,
            transform: `rotate(${rotation}deg)`,
          }}
        />
      )}
    </div>
  );
}

// Generate random confetti particles for falling effect
function generateFallingConfetti(): ConfettiParticleProps[] {
  const colors = ['#3126E3', '#756FEC', '#6CAD0A', '#E07900', '#7400CB', '#C4B996'];
  const shapes: Array<'circle' | 'line' | 'square'> = ['circle', 'line', 'square'];
  const particles: ConfettiParticleProps[] = [];
  
  for (let i = 0; i < 25; i++) {
    particles.push({
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      startX: Math.random() * 100,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 4,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * 360,
      swayAmount: (Math.random() - 0.5) * 60,
    });
  }
  
  return particles;
}

// CSS keyframes for falling confetti animation
const confettiKeyframes = `
  @keyframes confettiFall {
    0% {
      transform: translateY(0) translateX(0) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(280px) translateX(var(--sway)) rotate(var(--end-rotation));
      opacity: 0;
    }
  }
`;

export function CompletionSection({ isFullyComplete }: CompletionSectionProps) {
  // Generate confetti particles only once using useMemo to avoid hydration issues
  const confetti = useMemo(() => generateFallingConfetti(), []);

  if (isFullyComplete) {
    // FULL COMPLETION STATE - Application ready for submission
    return (
      <div className="space-y-8">
        {/* Success header with green styling */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #F8FEEB 0%, #EEFDD9 100%)',
            padding: '40px 32px',
          }}
        >
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#6CAD0A' }}
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header text */}
          <div className="text-center">
            <h2
              className="font-display font-medium mb-4"
              style={{ fontSize: '30px', color: '#3C6006', letterSpacing: '-0.01em' }}
            >
              Your Application is Ready
            </h2>
            <p
              className="text-base font-medium leading-relaxed max-w-lg mx-auto"
              style={{ color: '#3C6006' }}
            >
              Congratulations! All sections are complete. Your application will now be submitted to the lender for review.
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div
          style={{
            padding: '20px',
            border: '1px solid #E1E8EE',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <p className="text-sm font-bold text-foreground mb-5">What Happens Next</p>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#EDECFD' }}
              >
                <Send className="w-5 h-5" style={{ color: '#3126E3' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Application Submitted</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your complete application package is being sent to the lender.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#EDECFD' }}
              >
                <Phone className="w-5 h-5" style={{ color: '#3126E3' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Adviser Follow-up</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your dedicated adviser will contact you within 24-48 hours with an update.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#EDECFD' }}
              >
                <FileCheck className="w-5 h-5" style={{ color: '#3126E3' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Lender Assessment</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  The lender will review your application, typically within 3-5 working days.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#EDECFD' }}
              >
                <Clock className="w-5 h-5" style={{ color: '#3126E3' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Decision in Principle</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Once approved, you will receive your mortgage offer to proceed with your purchase.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Helpful tips */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FEF3C7',
            borderRadius: '12px',
            border: '1px solid #FCD34D',
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: '#653701' }}>
            While You Wait
          </p>
          <ul className="space-y-1.5">
            <li className="text-sm" style={{ color: '#A16207' }}>
              Keep your phone nearby for any adviser calls
            </li>
            <li className="text-sm" style={{ color: '#A16207' }}>
              Avoid making large purchases or taking on new credit
            </li>
            <li className="text-sm" style={{ color: '#A16207' }}>
              Continue saving for your deposit and moving costs
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // PRE-COMPLETION STATE - Preview of what's to come
  return (
    <div className="space-y-8">
      {/* Inject keyframes for confetti animation */}
      <style dangerouslySetInnerHTML={{ __html: confettiKeyframes }} />
      
      {/* Collect Your Keys banner with confetti */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DDD6FE 100%)',
          padding: '48px 32px',
          minHeight: '220px',
        }}
      >
        {/* Falling confetti particles */}
        {confetti.map((particle, index) => (
          <ConfettiParticle key={index} {...particle} />
        ))}

        {/* Key icon */}
        <div className="relative z-10 flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(71, 63, 230, 0.1)' }}
          >
            <Key className="w-7 h-7" style={{ color: '#3126E3' }} />
          </div>
        </div>

        {/* Header text */}
        <div className="relative z-10 text-center">
          <h2
            className="font-display font-medium mb-4"
            style={{ fontSize: '30px', color: '#182026', letterSpacing: '-0.01em' }}
          >
            Collect Your Keys
          </h2>
          <p
            className="text-base font-medium leading-relaxed max-w-md mx-auto"
            style={{ color: '#4B5563' }}
          >
            Complete all the steps above and you&apos;ll be moving into your new home before you know it. Your dream home is closer than you think.
          </p>
        </div>
      </div>

      {/* Progress reminder */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#F7F8FC',
          borderRadius: '12px',
          border: '1px solid #E1E8EE',
        }}
      >
        <p className="text-sm font-semibold text-foreground mb-2">Almost There</p>
        <p className="text-base leading-relaxed font-medium" style={{ color: '#182026' }}>
          Once you complete all sections of your application, this page will show you exactly what happens next and how to prepare for your mortgage journey.
        </p>
      </div>

      {/* What to expect */}
      <div
        style={{
          padding: '16px',
          border: '1px solid #E1E8EE',
          borderRadius: '12px',
        }}
      >
        <p className="text-sm font-bold text-foreground mb-4">What to Expect</p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 bg-foreground opacity-40" />
            <span className="text-sm font-medium text-foreground">Your application submitted to lenders</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 bg-foreground opacity-40" />
            <span className="text-sm font-medium text-foreground">Personal guidance from your adviser</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 bg-foreground opacity-40" />
            <span className="text-sm font-medium text-foreground">Clear next steps for your mortgage</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
