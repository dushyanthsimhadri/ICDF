import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const ToastItem = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/20 text-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        };
      case 'error':
        return {
          bg: 'bg-rose-950/80 border-rose-500/20 text-rose-300',
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/80 border-amber-500/20 text-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-950/80 border-indigo-500/20 text-indigo-300',
          icon: <Info className="w-4 h-4 text-indigo-400" />
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md flex items-center justify-between space-x-3 shadow-lg shadow-black/30 pointer-events-auto transition-all animate-slide-in ${style.bg}`}>
      <div className="flex items-center space-x-2.5">
        {style.icon}
        <span className="text-xs font-semibold">{message}</span>
      </div>
      <button 
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
};
