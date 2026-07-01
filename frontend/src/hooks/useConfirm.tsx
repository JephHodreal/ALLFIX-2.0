import { useState, useCallback, useEffect } from 'react';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { MobileConfirmModal } from '../components/shared/MobileConfirmModal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  hideCancel?: boolean;
  onConfirm?: () => void;
}

export function useConfirm() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
  }>({
    isOpen: false,
    options: null,
  });

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (isMobile) {
      return (
        <MobileConfirmModal
          isOpen={modalState.isOpen}
          onClose={close}
          onConfirm={modalState.options.onConfirm || (() => {})}
          title={modalState.options.title}
          message={modalState.options.message}
          confirmText={modalState.options.confirmText}
          cancelText={modalState.options.cancelText}
          type={modalState.options.type}
          hideCancel={modalState.options.hideCancel}
        />
      );
    }
    return (
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={close}
        onConfirm={modalState.options.onConfirm || (() => {})}
        title={modalState.options.title}
        message={modalState.options.message}
        confirmText={modalState.options.confirmText}
        cancelText={modalState.options.cancelText}
        type={modalState.options.type}
        hideCancel={modalState.options.hideCancel}
      />
    );
  };

  return { confirm, ConfirmComponent };
}
