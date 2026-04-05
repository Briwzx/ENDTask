import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export function SuccessModal() {
  const { modal, hideModal } = useContext(NotificationContext);

  if (!modal || !modal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-[24px] shadow-premium p-10 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center border border-border">
        {/* Ícono dinámico */}
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8 border-8 ${
          modal.type === 'success' 
            ? 'bg-green-50 border-green-100 text-status-success' 
            : modal.type === 'error'
              ? 'bg-red-50 border-red-100 text-status-error'
              : 'bg-amber-50 border-amber-100 text-amber-500' // Warning
        }`}>
          {modal.type === 'success' && (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {modal.type === 'error' && (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {modal.type === 'warning' && (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        {/* Textos */}
        <h2 className="text-2xl font-black text-dark tracking-tight mb-3">
          {modal.title}
        </h2>
        <p className="text-muted text-base leading-relaxed mb-10 font-semibold px-2">
          {modal.subtitle}
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          {modal.showCancelButton ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  modal.onCancel?.();
                  hideModal();
                }}
                className="flex-1 py-4 px-6 border-2 border-border rounded-2xl text-sm font-bold text-muted hover:bg-bg transition-colors tracking-widest"
              >
                {modal.cancelText || 'CANCELAR'}
              </button>
              <button
                onClick={() => {
                  modal.onConfirm?.();
                  hideModal();
                }}
                className={`flex-1 py-4 px-6 rounded-2xl text-sm font-bold text-white tracking-widest shadow-md hover:shadow-lg transition-all ${
                  modal.type === 'warning' || modal.type === 'error' ? 'bg-status-error' : 'bg-primary'
                }`}
              >
                {modal.confirmText || 'CONFIRMAR'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                modal.onConfirm?.() || modal.onClose?.();
                hideModal();
              }}
              className="w-full py-4 px-6 bg-primary text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all tracking-widest"
            >
              {modal.confirmText || 'ENTENDIDO'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
