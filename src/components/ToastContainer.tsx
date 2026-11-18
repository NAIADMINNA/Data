import { CheckCircle2, Info, Trash2, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm transition-opacity duration-150"
        >
          {toast.variant === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          {toast.variant === 'info' && (
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          {toast.variant === 'danger' && (
            <Trash2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <p className="text-sm text-slate-800 leading-snug flex-1">{toast.title}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="ปิดการแจ้งเตือน"
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
