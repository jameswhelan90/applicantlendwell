'use client';

import { CheckCircle2 } from 'lucide-react';

interface CompletionMilestoneProps {
  message: string;
}

export function CompletionMilestone({ message }: CompletionMilestoneProps) {
  return (
    <div 
      className="flex items-center gap-3 border rounded-lg px-4 py-3"
      style={{
        backgroundColor: '#F8FEEB',
        borderColor: 'rgba(108, 173, 10, 0.30)',
        borderRadius: '12px'
      }}
    >
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />
      <p className="text-sm font-medium" style={{ color: '#3C6006', fontWeight: '600' }}>{message}</p>
    </div>
  );
}
