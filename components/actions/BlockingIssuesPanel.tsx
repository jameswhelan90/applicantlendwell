'use client';

import { BlockingIssue, SectionId } from '@/types/tasks';
import { useApplication, SECTION_FIRST_STEP } from '@/context/ApplicationContext';
import { ArrowRight, AlertCircle } from 'lucide-react';

export function BlockingIssuesPanel() {
  const { state, openModal } = useApplication();
  const issues = state.blockingIssues;

  if (issues.length === 0) return null;

  const handleAction = (issue: BlockingIssue) => {
    if (issue.stepId) {
      openModal(issue.stepId as any);
    } else if (issue.sectionId) {
      openModal(SECTION_FIRST_STEP[issue.sectionId]);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1.5px solid #FFDAAF' }}>
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4" style={{ backgroundColor: '#FFF6EA' }}>
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E07900' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#653701' }}>
            {issues.length === 1 ? 'One thing needs your attention' : `${issues.length} things need your attention`}
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: '#653701', opacity: 0.8 }}>
            Resolving {issues.length === 1 ? 'this' : 'these'} will keep your application on track.
          </p>
        </div>
      </div>

      {/* Issues */}
      <ul>
        {issues.map((issue, i) => (
          <li
            key={issue.id}
            className="flex items-start justify-between gap-4 px-5 py-4"
            style={{
              backgroundColor: '#ffffff',
              borderTop: i > 0 ? '1px solid #FFDAAF' : undefined,
            }}
          >
            <p className="text-sm font-medium leading-snug flex-1" style={{ color: '#182026' }}>
              {issue.message}
            </p>
            {issue.action && (
              <button
                onClick={() => handleAction(issue)}
                className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap flex-shrink-0 hover:opacity-80 transition-opacity"
                style={{ color: '#3126E3' }}
              >
                {issue.action}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
