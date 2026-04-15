'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  warning: (message: string, options?: { onAction?: () => void; actionLabel?: string }) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  warning: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const add = useCallback((toast: Omit<ToastItem, 'id'>, autoDismissMs?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { ...toast, id }]); // max 4 toasts

    if (autoDismissMs) {
      const timer = setTimeout(() => dismiss(id), autoDismissMs);
      timersRef.current.set(id, timer);
    }
  }, [dismiss]);

  const success = useCallback((message: string) => {
    add({ type: 'success', message }, 4000);
  }, [add]);

  const warning = useCallback((message: string, options?: { onAction?: () => void; actionLabel?: string }) => {
    add({ type: 'warning', message, ...options });
  }, [add]);

  return (
    <ToastContext.Provider value={{ success, warning }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Toaster UI ──────────────────────────────────────────────────────────────

function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: '88px',
        right: '24px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: toast.type === 'warning'
              ? '0 4px 20px rgba(224,121,0,0.16), 0 1px 4px rgba(0,0,0,0.08)'
              : '0 4px 20px rgba(49,38,227,0.12), 0 1px 4px rgba(0,0,0,0.08)',
            minWidth: '240px',
            maxWidth: '320px',
            animation: 'toast-in 220ms cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#E07900' }} />
          )}

          <span
            className="text-xs font-semibold flex-1"
            style={{ color: '#182026', lineHeight: '1.4' }}
          >
            {toast.message}
          </span>

          {toast.onAction && toast.actionLabel && (
            <button
              onClick={toast.onAction}
              className="text-xs font-semibold flex-shrink-0"
              style={{ color: '#3126E3', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {toast.actionLabel}
            </button>
          )}

          <button
            onClick={() => onDismiss(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', flexShrink: 0 }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 639px) {
          .toast-container {
            right: 16px !important;
            left: 16px !important;
            bottom: 96px !important;
          }
        }
      `}</style>
    </div>
  );
}
