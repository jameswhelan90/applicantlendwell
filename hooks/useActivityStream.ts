'use client';

import { useActivity } from '@/context/ActivityContext';
import { useMemo } from 'react';

/**
 * Convenience hook for accessing activity stream state.
 * Returns the current processing activity, activity history, and connection status.
 */
export function useActivityStream() {
  const {
    activities,
    isConnected,
    connectionError,
    triggerActivity,
    clearActivities,
    retryConnection,
  } = useActivity();

  // Current processing activity (most recent one that's still processing)
  const processingActivity = useMemo(
    () => [...activities].reverse().find((a) => a.status === 'processing') ?? null,
    [activities]
  );

  // Count of activities in different states
  const counts = useMemo(
    () => ({
      processing: activities.filter((a) => a.status === 'processing').length,
      complete: activities.filter((a) => a.status === 'complete').length,
      needsReview: activities.filter((a) => a.status === 'needs_review').length,
      error: activities.filter((a) => a.status === 'error').length,
    }),
    [activities]
  );

  // Activities sorted by timestamp (most recent first)
  const sortedActivities = useMemo(
    () => [...activities].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    [activities]
  );

  // Check if any activity is currently processing
  const isProcessing = counts.processing > 0;

  return {
    activities: sortedActivities,
    processingActivity,
    isProcessing,
    counts,
    isConnected,
    connectionError,
    triggerActivity,
    clearActivities,
    retryConnection,
  };
}
