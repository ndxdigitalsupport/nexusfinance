import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  message: string;
  type: ToastType;
  id: number;
}

let toastId = 0;
let addToastFn: ((t: ToastData) => void) | null = null;

export function showToast(message: string, type: ToastType = 'success') {
  addToastFn?.({ message, type, id: ++toastId });
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styleMap: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: 'var(--success-bg)', border: 'var(--success-bg)', text: 'var(--success-text)', icon: 'var(--success-text)' },
  error: { bg: 'var(--error-bg)', border: 'var(--error-bg)', text: 'var(--error-text)', icon: 'var(--error-text)' },
  info: { bg: 'var(--info-bg)', border: 'var(--info-bg)', text: 'var(--info-text)', icon: 'var(--info-text)' },
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning-bg)', text: 'var(--warning-text)', icon: 'var(--warning-text)' },
};

export default function Toast() {
  const [toasts, setToasts] = useState<(ToastData & { exiting?: boolean })[]>([]);

  const addToast = useCallback((t: ToastData) => {
    setToasts(prev => [...prev, { ...t, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(x => x.id === t.id ? { ...x, exiting: true } : x));
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, 300);
    }, 3500);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const remove = (id: number) => {
    setToasts(prev => prev.map(x => x.id === id ? { ...x, exiting: true } : x));
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, 300);
  };

  return (
    <div role="status" aria-live="polite" className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type];
        const s = styleMap[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300"
            style={{
              backgroundColor: s.bg,
              borderColor: s.border,
              color: s.text,
              opacity: t.exiting ? 0 : 1,
              transform: t.exiting ? 'translateX(2rem) scale(0.95)' : 'translateX(0) scale(1)',
            }}
          >
            <Icon className="w-5 h-5 shrink-0" style={{ color: s.icon }} />
            <span className="text-[14px] font-semibold flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-1 p-0.5 rounded hover:bg-black/5 cursor-pointer shrink-0">
              <X className="w-4 h-4 opacity-60" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
