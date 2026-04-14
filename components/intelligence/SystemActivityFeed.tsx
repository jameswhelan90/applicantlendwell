'use client';

import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { Activity, ActivityStatus } from './SystemIntelligencePanel';

interface ActivityRowProps {
  activity: Activity;
}

function ActivityRow({ activity }: ActivityRowProps) {
  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#6CAD0A' }} />;
      case 'processing':
        return <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: '#3126E3' }} />;
      case 'needs_attention':
        return <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#E07900' }} />;
    }
  };

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'complete':
        return '#3C6006';
      case 'processing':
        return '#3126E3';
      case 'needs_attention':
        return '#653701';
    }
  };

  if (activity.isMessage) {
    return (
      <div
        className="p-3 rounded-lg mb-2"
        style={{
          backgroundColor: '#EEFDD9',
          border: '1px solid #CEF88C',
        }}
      >
        <p className="text-xs leading-relaxed" style={{ color: '#3C6006' }}>
          {activity.description}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-3">
      {getStatusIcon(activity.status)}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: '#182026' }}>
          {activity.description}
        </p>
        <p className="text-xs mt-1 font-medium" style={{ color: '#9CA3AF' }}>
          {activity.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

interface SystemActivityFeedProps {
  activities: Activity[];
}

export function SystemActivityFeed({ activities }: SystemActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-xs" style={{ color: '#9CA3AF' }}>
          No activity yet. We'll show updates as your application processes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
