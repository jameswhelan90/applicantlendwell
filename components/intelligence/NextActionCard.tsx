'use client';

import { ArrowRight } from 'lucide-react';

interface NextActionCardProps {
  action: {
    title: string;
    description: string;
    actionLabel: string;
    onAction?: () => void;
  };
}

export function NextActionCard({ action }: NextActionCardProps) {
  return (
    <div className="p-4">
      <p className="text-xs font-semibold mb-3" style={{ color: '#182026' }}>
        Next step
      </p>

      <div
        className="p-3 mb-3"
        style={{
          backgroundColor: '#EDECFD',
          borderRadius: '8px',
        }}
      >
        <h3 className="text-sm font-semibold mb-1" style={{ color: '#182026' }}>
          {action.title}
        </h3>
        <p className="text-xs mb-3 font-medium" style={{ color: '#182026', lineHeight: '1.5' }}>
          {action.description}
        </p>

        <button
          onClick={action.onAction}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 font-medium text-sm btn-interactive"
          style={{
            backgroundColor: '#3126E3',
            color: '#ffffff',
            borderRadius: '999px',
          }}
        >
          {action.actionLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
