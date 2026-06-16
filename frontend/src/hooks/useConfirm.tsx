import { useState, useCallback } from 'react';
import { ConfirmModal } from '../components/shared/ConfirmModal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
}

export function useConfirm() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
  }>({
    isOpen: false,
    options: null,
  });

  const confirm = useCallback((options: ConfirmOptions) => {
    setModalState({
      isOpen: true,
      options,
    });
  }, []);

  const close = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmComponent = () => {
    if (!modalState.options) return null;
    return (
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={close}
        onConfirm={modalState.options.onConfirm}
        title={modalState.options.title}
        message={modalState.options.message}
        confirmText={modalState.options.confirmText}
        cancelText={modalState.options.cancelText}
        type={modalState.options.type}
      />
    );
  };

  return { confirm, ConfirmComponent };
}
