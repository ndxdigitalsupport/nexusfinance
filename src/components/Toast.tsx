import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

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

export default function Toast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((t: ToastData) => {
    setToasts(prev => [...prev, t]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== t.id));
    }, 3500);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const remove = (id: number) => setToasts(prev => prev.filter(x => x.id !== id));

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border backdrop-blur-md animate-in slide-in-from-right-8 fade-in duration-200 ${
            t.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {t.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            : <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          }
          <span className="text-[14px] font-semibold">{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-2 p-0.5 rounded hover:bg-black/5 cursor-pointer">
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>
      ))}
    </div>
  );
}
