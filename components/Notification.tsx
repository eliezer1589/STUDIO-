
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Toast } from '../types';

interface Props {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const Notification: React.FC<Props> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-[400px]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const styles = {
    success: 'bg-emerald-50/90 border-emerald-200 text-emerald-800 backdrop-blur-xl',
    error: 'bg-rose-50/90 border-rose-200 text-rose-800 backdrop-blur-xl',
    info: 'bg-indigo-50/90 border-indigo-200 text-indigo-800 backdrop-blur-xl',
  };

  const iconStyles = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-rose-500 text-white',
    info: 'bg-indigo-600 text-white',
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-[24px] shadow-2xl border-2 min-w-[320px] animate-in slide-in-from-right-10 fade-in duration-300 ${styles[toast.type]}`}>
      <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${iconStyles[toast.type]}`}>
        {icons[toast.type]}
      </div>
      <div className="flex-1 font-bold text-sm leading-tight">{toast.message}</div>
      <button onClick={() => onClose(toast.id)} className="hover:bg-black/5 p-2 rounded-xl transition-colors text-slate-400">
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;
