'use client';

import { AIActivity } from '@/types/tasks';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIActivityFeedProps {
  activities?: AIActivity[];
}

function formatTime(timestamp: Date): string {
  return new Date(timestamp).toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ActivityItem({ activity }: { activity: AIActivity }) {
  const isProcessing = activity.status === 'processing';
  const isComplete = activity.status === 'complete';
  // Render empty on server, populate after mount to avoid hydration mismatch
  const [timeLabel, setTimeLabel] = useState('');

  useEffect(() => {
    setTimeLabel(formatTime(activity.timestamp));
  }, [activity.timestamp]);

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 flex-shrink-0">
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
        ) : isComplete ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isProcessing ? 'text-foreground' : 'text-muted-foreground'}`}>
          {activity.description}
        </p>
        {timeLabel && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {timeLabel}
          </p>
        )}
      </div>
    </div>
  );
}

export function AIActivityFeed({ activities: activitiesProp }: AIActivityFeedProps) {
  const activities = activitiesProp ?? [];
  const processing = activities.filter((a) => a.status === 'processing');
  const recent = activities.filter((a) => a.status !== 'processing').slice(0, 3);
  const hasActivity = activities.length > 0;

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <p className="text-xs font-semibold text-muted-foreground">
          Working in the background
        </p>
      </div>

      {!hasActivity ? (
        <p className="text-sm text-muted-foreground py-2">
          We&apos;ll update you here as we process your information.
        </p>
      ) : (
        <div className="divide-y divide-border/60">
          {processing.length > 0 && (
            <div className="pb-2">
              {processing.map((a) => (
                <ActivityItem key={a.id} activity={a} />
              ))}
            </div>
          )}
          {recent.length > 0 && (
            <div className={processing.length > 0 ? 'pt-2' : ''}>
              {recent.map((a) => (
                <ActivityItem key={a.id} activity={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
