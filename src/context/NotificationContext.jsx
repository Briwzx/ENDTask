import React, { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showModal = useCallback((options) => {
    // options: { type, title, subtitle, showCancelButton, onConfirm, onCancel, confirmText, cancelText }
    setModal({
      ...options,
      isOpen: true
    });
  }, []);

  const hideModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ toast, showToast, hideToast, modal, showModal, hideModal }}>
      {children}
    </NotificationContext.Provider>
  );
};
