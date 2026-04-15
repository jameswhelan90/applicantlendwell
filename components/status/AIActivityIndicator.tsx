'use client';

import { useEffect, useRef, useState } from 'react';
import { AIActivity } from '@/types/tasks';
import { CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
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

  // Track last seen completed activity count to detect new completions
  const prevCompletedCountRef = useRef(0);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Whether there are unread completed activities (since panel was last opened)
  const [unreadComplete, setUnreadComplete] = useState(false);

  const isProcessing = !!processingActivity;
  const completedActivities = activities.filter((a) => a.status === 'complete' || a.status === 'needs_review');

  // Detect newly completed activities → auto-open panel briefly
  useEffect(() => {
    const currentCount = completedActivities.length;
    if (currentCount > prevCompletedCountRef.current && prevCompletedCountRef.current > 0) {
      // Something just completed — auto-open the panel
      setPanelOpen(true);
      setUnreadComplete(true);

      // Auto-close after 5 seconds (unless user is interacting)
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(() => {
        setPanelOpen(false);
      }, 5000);
    }
    prevCompletedCountRef.current = currentCount;
  }, [completedActivities.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear unread badge when panel is opened
  useEffect(() => {
    if (panelOpen) {
      setUnreadComplete(false);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    }
  }, [panelOpen]);

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

  const mostRecentCompleted = completedActivities[0] ?? null;

  return (
    <div ref={panelRef} className="relative flex items-center gap-2">

      {/* ── Processing pill — slides in when AI is working ── */}
      <div
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: isProcessing ? '5px 12px 5px 8px' : '0px',
          maxWidth: isProcessing ? '240px' : '0px',
          overflow: 'hidden',
          opacity: isProcessing ? 1 : 0,
          backgroundColor: isProcessing ? '#EDECFD' : 'transparent',
          borderRadius: '999px',
          border: isProcessing ? '1px solid rgba(49,38,227,0.15)' : 'none',
          transition: 'max-width 300ms ease, opacity 300ms ease, padding 300ms ease',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <Loader2
          style={{
            width: '13px',
            height: '13px',
            color: '#3126E3',
            flexShrink: 0,
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#3126E3' }}>
          {processingActivity?.description ?? ''}
        </span>
      </div>

      {/* ── Icon button — always visible ── */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        aria-label={isProcessing ? 'LendWell is working' : 'View AI activity'}
        aria-expanded={panelOpen}
        style={{
          position: 'relative',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: isProcessing
            ? 'rgba(49,38,227,0.10)'
            : panelOpen
            ? 'rgba(49,38,227,0.08)'
            : 'rgba(49,38,227,0.06)',
          transition: 'background-color 200ms ease',
        }}
      >
        {/* Pulse ring when processing */}
        {isProcessing && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(49,38,227,0.12)',
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        )}

        <AILogo size={18} />

        {/* Unread badge — green dot for new completions */}
        {unreadComplete && !isProcessing && (
          <span
            style={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#6CAD0A',
              border: '1.5px solid #ffffff',
            }}
          />
        )}

        {/* Offline indicator */}
        {!isConnected && (
          <span
            style={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#CC013D',
              border: '1.5px solid #ffffff',
            }}
            title="Connection lost"
          />
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {panelOpen && (
        <div
          className="ai-activity-panel absolute right-0 z-50 overflow-hidden"
          style={{
            top: 'calc(100% + 10px)',
            width: '320px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <style>{`
            @media (max-width: 639px) {
              .ai-activity-panel {
                position: fixed !important;
                top: 64px !important;
                left: 16px !important;
                right: 16px !important;
                width: auto !important;
              }
            }
          `}</style>
          {/* Panel header */}
          <div
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderBottom: '1px solid #F1F3F7',
            }}
          >
            <AILogo size={20} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#182026', margin: 0 }}>
                LendWell
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: isProcessing ? '#E07900' : isConnected ? '#6CAD0A' : '#CC013D',
                }} />
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#5A7387', margin: 0 }}>
                  {isProcessing ? 'Working on your application…' : isConnected ? 'Everything looks good' : 'Disconnected'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              aria-label="Close activity panel"
              className="btn-interactive"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X style={{ width: '14px', height: '14px', color: '#5A7387' }} />
            </button>
          </div>

          {/* Document processing reassurance banner — desktop only */}
          {isProcessing && processingActivity?.type === 'document_scan' && (
            <div
              className="hidden sm:flex items-start gap-2"
              style={{
                padding: '10px 16px',
                backgroundColor: '#F8F9FC',
                borderBottom: '1px solid #F1F3F7',
              }}
            >
              <span style={{ fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#5A7387', margin: 0, lineHeight: '1.5' }}>
                You can leave this page — your documents will keep processing in the background.
              </p>
            </div>
          )}

          {/* Connection error banner */}
          {connectionError && (
            <div
              style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFEAF1',
                fontSize: '12px',
                color: '#7B0024',
              }}
            >
              <AlertCircle style={{ width: '13px', height: '13px', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{connectionError}</span>
              <button
                onClick={retryConnection}
                style={{ fontSize: '11px', fontWeight: '600', color: '#7B0024', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Activity list */}
          <div style={{ padding: '6px 0 8px', maxHeight: '260px', overflowY: 'auto' }}>
            {activities.length === 0 ? (
              <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#5A7387', margin: 0 }}>
                  No activity yet
                </p>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#9CA3AF', margin: '4px 0 0' }}>
                  Updates will appear here as you complete your application.
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityRow({ activity }: { activity: AIActivity }) {
  const isPro = activity.status === 'processing';
  const isCom = activity.status === 'complete';
  const isErr = activity.status === 'error';
  const isReview = activity.status === 'needs_review';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 16px',
        backgroundColor: isPro ? 'rgba(49,38,227,0.03)' : 'transparent',
      }}
    >
      {/* Status icon */}
      <div style={{ marginTop: '1px', flexShrink: 0 }}>
        {isPro ? (
          <Loader2 style={{ width: '14px', height: '14px', color: '#3126E3', animation: 'spin 1s linear infinite' }} />
        ) : isCom ? (
          <CheckCircle2 style={{ width: '14px', height: '14px', color: '#6CAD0A' }} />
        ) : isErr ? (
          <AlertCircle style={{ width: '14px', height: '14px', color: '#CC013D' }} />
        ) : isReview ? (
          <AlertCircle style={{ width: '14px', height: '14px', color: '#E07900' }} />
        ) : (
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13px',
          fontWeight: isPro ? '600' : '500',
          color: isPro ? '#182026' : isErr ? '#7B0024' : isReview ? '#653701' : '#5A7387',
          margin: 0,
          lineHeight: '1.4',
        }}>
          {activity.description}
        </p>
        {activity.errorMessage && (
          <p style={{ fontSize: '11px', color: '#7B0024', margin: '2px 0 0' }}>{activity.errorMessage}</p>
        )}
        {/* Progress bar for in-progress activities */}
        {isPro && activity.progress !== undefined && activity.progress > 0 && (
          <div style={{ marginTop: '6px', height: '3px', backgroundColor: '#E1E8EE', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${activity.progress}%`, backgroundColor: '#3126E3', borderRadius: '999px', transition: 'width 300ms ease' }} />
          </div>
        )}
        <TimeLabel timestamp={activity.timestamp} />
      </div>
    </div>
  );
}

// Avoids hydration mismatch for time display
function TimeLabel({ timestamp }: { timestamp: Date | string }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    setLabel(formatTime(timestamp));
  }, [timestamp]);
  if (!label) return null;
  return <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0', fontWeight: '500' }}>{label}</p>;
}
