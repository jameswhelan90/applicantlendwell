'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { AIActivity, ActivityType, ActivityTriggerPayload } from '@/types/tasks';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ActivityContextValue {
  activities: AIActivity[];
  isConnected: boolean;
  connectionError: string | null;
  triggerActivity: (type: ActivityType, metadata?: ActivityTriggerPayload['metadata']) => Promise<{ success: boolean; activityId?: string; error?: string }>;
  clearActivities: () => void;
  retryConnection: () => void;
}

interface ActivityProviderProps {
  children: ReactNode;
  sessionId?: string;
}

// ─── Context ───────────────────────────────────────────────────────────────

const ActivityContext = createContext<ActivityContextValue | null>(null);

// ─── Hook to use activity context ──────────────────────────────────────────

export function useActivity(): ActivityContextValue {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}

// ─── Provider component ────────────────────────────────────────────────────

export function ActivityProvider({ children, sessionId = 'default-session' }: ActivityProviderProps) {
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  // ─── Connect to SSE stream ───────────────────────────────────────────────

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource('/api/activities', {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.addEventListener('init', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.activities) {
            setActivities(data.activities);
          }
        } catch (e) {
          console.error('Failed to parse init event:', e);
        }
      });

      eventSource.addEventListener('activity', (event) => {
        try {
          const activity: AIActivity = JSON.parse(event.data);
          setActivities((prev) => {
            const existingIndex = prev.findIndex((a) => a.id === activity.id);
            if (existingIndex >= 0) {
              // Update existing activity
              const updated = [...prev];
              updated[existingIndex] = activity;
              return updated;
            }
            // Add new activity
            return [...prev, activity];
          });
        } catch (e) {
          console.error('[v0] Failed to parse activity event:', e);
        }
      });

      eventSource.addEventListener('heartbeat', () => {
        // Keep-alive received, connection is healthy
        setIsConnected(true);
      });

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
          reconnectAttempts.current += 1;
          
          setConnectionError(`Connection lost. Reconnecting in ${delay / 1000}s...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setConnectionError('Unable to connect. Please refresh the page.');
        }
      };

      eventSourceRef.current = eventSource;
    } catch (e) {
      setConnectionError('Failed to establish connection');
      console.error('[v0] EventSource error:', e);
    }
  }, []);

  // ─── Retry connection manually ───────────────────────────────────────────

  const retryConnection = useCallback(() => {
    reconnectAttempts.current = 0;
    setConnectionError(null);
    connect();
  }, [connect]);

  // ─── Trigger a new activity ──────────────────────────────────────────────

  const triggerActivity = useCallback(async (
    type: ActivityType,
    metadata?: ActivityTriggerPayload['metadata']
  ): Promise<{ success: boolean; activityId?: string; error?: string }> => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ type, metadata } as ActivityTriggerPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to trigger activity' };
      }

      return { success: true, activityId: data.activityId };
    } catch (e) {
      console.error('[v0] Failed to trigger activity:', e);
      return { success: false, error: 'Network error' };
    }
  }, [sessionId]);

  // ─── Clear all activities ────────────────────────────────────────────────

  const clearActivities = useCallback(async () => {
    try {
      await fetch('/api/activities', {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId },
      });
      setActivities([]);
    } catch (e) {
      console.error('[v0] Failed to clear activities:', e);
    }
  }, [sessionId]);

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // ─── Cleanup old activities (older than 1 hour) ──────────────────────────

  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      setActivities((prev) =>
        prev.filter((a) => new Date(a.timestamp).getTime() > oneHourAgo)
      );
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, []);

  // ─── Context value ───────────────────────────────────────────────────────

  const value: ActivityContextValue = {
    activities,
    isConnected,
    connectionError,
    triggerActivity,
    clearActivities,
    retryConnection,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}
