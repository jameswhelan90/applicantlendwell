'use client';

import { useEffect, useRef, useState } from 'react';
import { AIActivity } from '@/types/tasks';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useActivityStream } from '@/hooks/useActivityStream';

// AI Logo rendered inline as an SVG component to avoid any public-path issues
export function AILogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 63"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <g filter="url(#ai-logo-blur-outer)">
        <circle cx="32.04" cy="31.54" r="19.17" fill="url(#ai-logo-grad-outer)" fillOpacity="0.9" />
      </g>
      <g style={{ mixBlendMode: 'color' }}>
        <ellipse cx="32" cy="31.5" rx="16.95" ry="17" transform="rotate(-43.73 32 31.5)" fill="url(#ai-logo-grad-radial)" />
      </g>
      <g filter="url(#ai-logo-blur-inner)">
        <ellipse cx="32.05" cy="31.56" rx="17.04" ry="17" fill="url(#ai-logo-grad-inner)" fillOpacity="0.99" />
      </g>
      <defs>
        <filter id="ai-logo-blur-outer" x="0.81" y="0.32" width="62.44" height="62.44" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="6.02" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ai-logo-blur-inner" x="8.13" y="7.68" width="47.85" height="47.77" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="3.44" result="effect1_foregroundBlur" />
        </filter>
        <linearGradient id="ai-logo-grad-outer" x1="12.86" y1="16.72" x2="47.32" y2="46.91" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5F2BFF" />
          <stop offset="0.57" stopColor="#22C7E6" />
          <stop offset="1" stopColor="#226EFE" />
        </linearGradient>
        <radialGradient id="ai-logo-grad-radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(29.75 28.06) rotate(90.92) scale(20.45 20.38)">
          <stop offset="0.226" stopColor="#430DFF" />
          <stop offset="0.587" stopColor="#22C7E6" />
          <stop offset="0.829" stopColor="#226EFE" />
        </radialGradient>
        <linearGradient id="ai-logo-grad-inner" x1="22.54" y1="19.84" x2="41.34" y2="42.30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8CAFFF" />
          <stop offset="0.57" stopColor="#014DFF" />
          <stop offset="0.845" stopColor="#001B59" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function formatTime(timestamp: string | Date): string {
  return new Date(timestamp).toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AIActivityIndicator() {
  const { activities, processingActivity, isConnected, connectionError, retryConnection } = useActivityStream();
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Track whether the pill should be visible — stays true briefly after processing ends for fade-out
  const [pillVisible, setPillVisible] = useState(false);
  const [pillActivity, setPillActivity] = useState<AIActivity | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (processingActivity) {
      // New or ongoing processing — show immediately
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setPillActivity(processingActivity);
      setPillVisible(true);
    } else if (pillVisible) {
      // Processing just ended — fade out after a short hold
      fadeTimerRef.current = setTimeout(() => {
        setPillVisible(false);
      }, 2000);
    }
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingActivity]);

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [panelOpen]);

  const isProcessing = !!processingActivity;
  const hasAnyActivity = activities.length > 0;

  // Always render the component - show icon button even when no activities
  // This ensures users can always access the activity panel

  return (
    <div ref={panelRef} className="relative flex items-center">

      {/* ── Inline activity pill ── */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        aria-label="View LendWell activity"
        className="flex items-center gap-2 transition-all duration-500"
        style={{
          opacity: pillVisible ? 1 : 0,
          pointerEvents: pillVisible ? 'auto' : 'none',
          maxWidth: pillVisible ? '280px' : '0px',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
        }}
      >
        {/* Logo + optional spinner ring + offline indicator */}
        <span className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 28, height: 28 }}>
          <AILogo size={22} />
          {isProcessing && (
            <span
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                border: '1.5px solid transparent',
                borderTopColor: '#3126E3',
                borderRightColor: 'rgba(71,63,230,0.25)',
              }}
            />
          )}
          {/* Offline indicator dot */}
          {!isConnected && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ backgroundColor: '#CC013D', borderColor: '#ffffff' }}
              title="Connection lost"
            />
          )}
        </span>

        {/* Task label — truncated */}
        <span
          className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-500"
          style={{
            color: isProcessing ? '#182026' : '#6B7280',
            maxWidth: '180px',
          }}
        >
          {isProcessing ? pillActivity?.description : 'Application Intelligence'}
        </span>
      </button>

      {/* ── Icon-only button when idle (always visible for access to panel) ── */}
      {!pillVisible && (
        <button
          onClick={() => setPanelOpen((o) => !o)}
          aria-label="View LendWell activity"
          className="relative flex items-center justify-center w-8 h-8 transition-colors hover:bg-muted/60"
          style={{ borderRadius: '999px' }}
        >
          <AILogo size={18} />
          {/* Offline indicator dot */}
          {!isConnected && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2"
              style={{ backgroundColor: '#CC013D', borderColor: '#ffffff' }}
              title="Connection lost"
            />
          )}
        </button>
      )}

      {/* ── Dropdown panel ── */}
      {panelOpen && (
        <div
          className="absolute right-0 z-50 rounded-xl shadow-xl overflow-hidden"
          style={{
            top: 'calc(100% + 10px)',
            width: '300px',
            backgroundColor: '#ffffff',
            border: '1px solid hsl(220 15% 92%)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center gap-2.5 px-4 py-3 border-b"
            style={{ borderColor: 'hsl(220 15% 92%)' }}
          >
            <AILogo size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: '#182026' }}>
                LendWell is working in the background
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: isConnected ? '#3C6006' : '#7B0024' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>

          {/* Connection error banner */}
          {connectionError && (
            <div
              className="px-4 py-2 flex items-center gap-2 text-xs"
              style={{ backgroundColor: '#FFEAF1', color: '#7B0024' }}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1">{connectionError}</span>
              <button
                onClick={retryConnection}
                className="text-xs font-medium underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="px-4 py-2 max-h-72 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3">
                We&apos;ll update you here as we process your information.
              </p>
            ) : (
              <div className="divide-y divide-border/50">
                {activities.map((activity) => {
                  const isPro = activity.status === 'processing';
                  const isCom = activity.status === 'complete';
                  const isErr = activity.status === 'error';
                  const isReview = activity.status === 'needs_review';
                  return (
                    <div key={activity.id} className="flex items-start gap-3 py-2.5">
                      <div className="mt-0.5 flex-shrink-0">
                        {isPro ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#3126E3' }} />
                        ) : isCom ? (
                          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#6CAD0A' }} />
                        ) : isErr ? (
                          <AlertCircle className="w-3.5 h-3.5" style={{ color: '#CC013D' }} />
                        ) : isReview ? (
                          <AlertCircle className="w-3.5 h-3.5" style={{ color: '#E07900' }} />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm leading-snug font-medium"
                          style={{ color: isPro ? '#182026' : isErr ? '#7B0024' : '#5A7387' }}
                        >
                          {activity.description}
                        </p>
                        {activity.errorMessage && (
                          <p className="text-xs mt-0.5" style={{ color: '#7B0024' }}>{activity.errorMessage}</p>
                        )}
                        <TimeLabel timestamp={activity.timestamp} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Avoids hydration mismatch for time display
function TimeLabel({ timestamp }: { timestamp: Date }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    setLabel(formatTime(timestamp));
  }, [timestamp]);
  if (!label) return null;
  return <p className="text-xs text-muted-foreground/60 mt-0.5 font-medium">{label}</p>;
}
