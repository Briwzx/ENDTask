import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useModal = () => {
  const { showModal, hideModal } = useContext(NotificationContext);
  return { showModal, hideModal };
};
