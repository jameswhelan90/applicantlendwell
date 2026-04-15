'use client';

import { Sparkles } from 'lucide-react';

interface ExtractedFieldsGridProps {
  fields: Record<string, string>;
}

export function ExtractedFieldsGrid({ fields }: ExtractedFieldsGridProps) {
  if (!fields || Object.keys(fields).length === 0) return null;

  return (
    <div style={{ borderTop: '1px solid rgba(60,96,6,0.10)' }}>
      <div className="px-4 pt-2.5 pb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3" style={{ color: '#3C6006' }} />
          <span className="text-xs font-semibold" style={{ color: '#3C6006' }}>
            Extracted by LendWell
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(fields).map(([key, val]) => (
            <div key={key}>
              <p className="text-xs font-medium capitalize" style={{ color: '#5A7D23' }}>
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-xs font-semibold" style={{ color: '#3C6006' }}>
                {val}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
