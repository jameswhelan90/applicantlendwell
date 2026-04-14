'use client';

import { TimelineEvent } from '@/types/tasks';
import { Calendar } from 'lucide-react';

interface ApplicationTimelineProps {
  events: TimelineEvent[];
}

export function ApplicationTimeline({ events }: ApplicationTimelineProps) {
  const sortedEvents = [...events].reverse();

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground mb-3">
        Application Timeline
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              {index < sortedEvents.length - 1 && (
                <div className="w-0.5 h-8 bg-border my-1" />
              )}
            </div>

            <div className="flex-1 pb-2">
              <p className="text-sm font-medium text-foreground">{event.event}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
