import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: AlertTriangle,
};

const colors = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  info: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  error: 'bg-red-500/15 border-red-500/30 text-red-300',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-24 left-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl animate-toast-slide ${colors[toast.type]}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1 text-sm font-medium">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op function if not wrapped in provider (web mode)
    return () => {};
  }
  return context;
};
