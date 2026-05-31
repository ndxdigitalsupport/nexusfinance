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

const styles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

const iconColors = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-amber-600',
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
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 ${
              t.exiting ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-8 fade-in duration-200'
            } ${styles[t.type]}`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${iconColors[t.type]}`} />
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
