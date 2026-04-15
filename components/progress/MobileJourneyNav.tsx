'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useApplication, SECTION_LABELS } from '@/context/ApplicationContext';
import { SectionId } from '@/types/tasks';

export function MobileJourneyNav() {
  const { state, selectedJourneyStep, selectJourneyStep } = useApplication();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = state.sections;
  const current = sections.find((s) => s.id === selectedJourneyStep);
  const currentIndex = sections.findIndex((s) => s.id === selectedJourneyStep);
  const completedCount = sections.filter((s) => s.status === 'complete').length;

  // Close on outside tap
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  if (!current) return null;

  const isCurrentComplete = current.status === 'complete';

  return (
    <div
      ref={containerRef}
      className="lg:hidden flex-shrink-0 relative z-10"
      style={{ padding: '16px 16px 10px' }}
    >
      {/* Select trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label="Navigate to section"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: isOpen
            ? '0 2px 12px rgba(0,0,0,0.09)'
            : '0 1px 4px rgba(0,0,0,0.07)',
          transition: 'box-shadow 150ms ease',
        }}
      >
        {/* Step circle */}
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isCurrentComplete ? '#3126E3' : 'rgba(49,38,227,0.10)',
          }}
        >
          {isCurrentComplete ? (
            <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          ) : (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#3126E3', lineHeight: 1 }}>
              {currentIndex + 1}
            </span>
          )}
        </div>

        {/* Label */}
        <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: '#182026', textAlign: 'left' }}>
          {SECTION_LABELS[current.id as SectionId]}
        </span>

        {/* Right side */}
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginRight: '4px' }}>
          {completedCount} of {sections.filter(s => s.id !== 'collect_keys').length}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0"
          style={{
            color: '#9CA3AF',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% - 4px)',
            left: '16px',
            right: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(24,32,38,0.12), 0 2px 8px rgba(24,32,38,0.06)',
            overflow: 'hidden',
            zIndex: 20,
            animation: 'mj-dropdown 180ms cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          {sections.map((section, index) => {
            const isComplete = section.status === 'complete';
            const isActive = section.id === selectedJourneyStep;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  selectJourneyStep(section.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  border: 'none',
                  borderBottom: index < sections.length - 1 ? '1px solid #F1F3F7' : 'none',
                  backgroundColor: isActive ? 'rgba(49,38,227,0.04)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#F7F8FC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? 'rgba(49,38,227,0.04)' : 'transparent';
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isComplete
                      ? '#3126E3'
                      : isActive
                      ? 'rgba(49,38,227,0.10)'
                      : '#F7F8FC',
                    border: !isComplete && !isActive ? '1px solid #E5E7EB' : 'none',
                  }}
                >
                  {isComplete ? (
                    <Check className="w-3 h-3 text-white stroke-[2.5]" />
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isActive ? '#3126E3' : '#9CA3AF', lineHeight: 1 }}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isComplete || isActive ? '#182026' : '#6B7280',
                    flex: 1,
                  }}
                >
                  {SECTION_LABELS[section.id as SectionId]}
                </span>

                {/* Active dot */}
                {isActive && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#3126E3',
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes mj-dropdown {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
