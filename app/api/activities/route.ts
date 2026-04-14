import { NextRequest, NextResponse } from 'next/server';
import { ActivityType, AIActivity, ActivityTriggerPayload } from '@/types/tasks';

// ─── Activity descriptions per type ────────────────────────────────────────

const ACTIVITY_CONFIG: Record<ActivityType, { description: string; completionDescription: string; durationMs: [number, number] }> = {
  document_scan: {
    description: 'Scanning document',
    completionDescription: 'Document scanned — ready for lender review',
    durationMs: [2000, 5000],
  },
  credit_check: {
    description: 'Checking credit information',
    completionDescription: 'Credit check complete — no issues found',
    durationMs: [3000, 8000],
  },
  income_verify: {
    description: 'Verifying income details',
    completionDescription: 'Income verified — figures are within expected range',
    durationMs: [2000, 4000],
  },
  address_verify: {
    description: 'Validating address',
    completionDescription: 'Address confirmed and validated',
    durationMs: [1000, 3000],
  },
  application_readiness: {
    description: 'Calculating application readiness',
    completionDescription: 'Application readiness updated',
    durationMs: [1000, 2000],
  },
  identity_check: {
    description: 'Verifying identity',
    completionDescription: 'Identity confirmed — all checks passed',
    durationMs: [2000, 4000],
  },
  employment_verify: {
    description: 'Confirming employment details',
    completionDescription: 'Employment details confirmed',
    durationMs: [2000, 4000],
  },
};

// ─── In-memory activity store (would be Redis/DB in production) ────────────

const activityStore: Map<string, AIActivity[]> = new Map();
const activityListeners: Map<string, Set<(activity: AIActivity) => void>> = new Map();

function getSessionId(req: NextRequest): string {
  // In production, extract from auth token or session cookie
  return req.headers.get('x-session-id') || 'default-session';
}

function generateId(): string {
  return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomDuration(range: [number, number]): number {
  return Math.floor(Math.random() * (range[1] - range[0])) + range[0];
}

// ─── GET: SSE stream for real-time activity updates ────────────────────────

export async function GET(req: NextRequest) {
  const sessionId = getSessionId(req);

  // Initialize session store if needed with a welcome activity
  if (!activityStore.has(sessionId)) {
    const welcomeActivity: AIActivity = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      description: 'System ready - monitoring your application',
      status: 'complete',
      type: 'application_readiness',
    };
    activityStore.set(sessionId, [welcomeActivity]);
  }
  if (!activityListeners.has(sessionId)) {
    activityListeners.set(sessionId, new Set());
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial activities
      const activities = activityStore.get(sessionId) || [];
      const initEvent = `event: init\ndata: ${JSON.stringify({ activities })}\n\n`;
      controller.enqueue(encoder.encode(initEvent));

      // Listener for new activity updates
      const listener = (activity: AIActivity) => {
        if (closed) return;
        const event = `event: activity\ndata: ${JSON.stringify(activity)}\n\n`;
        try {
          controller.enqueue(encoder.encode(event));
        } catch {
          // Stream closed
          closed = true;
        }
      };

      activityListeners.get(sessionId)?.add(listener);

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        if (closed) {
          clearInterval(heartbeat);
          return;
        }
        try {
          const ping = `event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(encoder.encode(ping));
        } catch {
          closed = true;
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(heartbeat);
        activityListeners.get(sessionId)?.delete(listener);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// ─── POST: Trigger a new background activity ───────────────────────────────

export async function POST(req: NextRequest) {
  const sessionId = getSessionId(req);

  // Rate limiting check (simplified - would use Redis in production)
  const activities = activityStore.get(sessionId) || [];
  const recentCount = activities.filter(
    (a) => Date.now() - new Date(a.timestamp).getTime() < 60000
  ).length;

  if (recentCount >= 10) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMIT' },
      { status: 429 }
    );
  }

  let payload: ActivityTriggerPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_BODY' },
      { status: 400 }
    );
  }

  // Validate activity type
  if (!payload.type || !ACTIVITY_CONFIG[payload.type]) {
    return NextResponse.json(
      { error: 'Invalid activity type', code: 'INVALID_TYPE' },
      { status: 400 }
    );
  }

  const config = ACTIVITY_CONFIG[payload.type];
  const activityId = generateId();
  const duration = getRandomDuration(config.durationMs);

  // Create initial activity
  const activity: AIActivity = {
    id: activityId,
    timestamp: new Date().toISOString(),
    description: payload.metadata?.documentName
      ? `${config.description}: ${payload.metadata.documentName}`
      : config.description,
    status: 'processing',
    type: payload.type,
    progress: 0,
  };

  // Store and broadcast
  if (!activityStore.has(sessionId)) {
    activityStore.set(sessionId, []);
  }
  activityStore.get(sessionId)?.push(activity);
  broadcastActivity(sessionId, activity);

  // Simulate processing with progress updates
  simulateProcessing(sessionId, activityId, duration);

  return NextResponse.json({ success: true, activityId });
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function broadcastActivity(sessionId: string, activity: AIActivity) {
  const listeners = activityListeners.get(sessionId);
  if (listeners) {
    listeners.forEach((listener) => listener(activity));
  }
}

async function simulateProcessing(sessionId: string, activityId: string, duration: number) {
  const activities = activityStore.get(sessionId);
  if (!activities) return;

  const steps = 4;
  const stepDuration = duration / steps;

  for (let i = 1; i <= steps; i++) {
    await sleep(stepDuration);

    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    if (i < steps) {
      // Progress update
      activity.progress = Math.round((i / steps) * 100);
      broadcastActivity(sessionId, { ...activity });
    } else {
      // Complete — update description to completion message
      const needsReview = Math.random() < 0.1;
      activity.status = needsReview ? 'needs_review' : 'complete';
      activity.progress = 100;
      if (activity.type && ACTIVITY_CONFIG[activity.type]) {
        const completionDesc = ACTIVITY_CONFIG[activity.type].completionDescription;
        // Append document name suffix if original description had one
        const suffix = activity.description.includes(': ')
          ? ` (${activity.description.split(': ').slice(1).join(': ')})`
          : '';
        activity.description = completionDesc + suffix;
      }
      broadcastActivity(sessionId, { ...activity });
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── DELETE: Clear activities (for testing/reset) ─────────────────────────

export async function DELETE(req: NextRequest) {
  const sessionId = getSessionId(req);
  activityStore.set(sessionId, []);
  return NextResponse.json({ success: true });
}
