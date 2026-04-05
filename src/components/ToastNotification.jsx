import React, { useEffect, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export function ToastNotification() {
  const { toast, hideToast } = useContext(NotificationContext);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-6 duration-300">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-premium min-w-[300px] ${
        isSuccess 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${
          isSuccess ? 'bg-status-success' : 'bg-status-error'
        }`}>
          {isSuccess ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <p className="text-sm font-bold tracking-wide">{toast.message}</p>
      </div>
    </div>
  );
}
