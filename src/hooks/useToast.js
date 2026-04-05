import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useToast = () => {
  const { showToast, hideToast } = useContext(NotificationContext);
  return { showToast, hideToast };
};
