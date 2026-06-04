import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
}

export function Modal({ open, onClose, children, className, closeOnBackdrop = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const focusable = document.querySelector<HTMLElement>('[data-modal-root] [data-autofocus]');
    focusable?.focus();
    return () => {
      previousActive?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      data-modal-root
      onClick={closeOnBackdrop ? onClose : undefined}
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[#2B211C]/45 px-4 py-6 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={
          className ??
          'relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.24)]'
        }
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
