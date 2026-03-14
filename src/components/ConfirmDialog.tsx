"use client";

import { useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  body,
  confirmLabel = "Delete",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Return focus to cancel on open (cancel is the "safe" default)
  useEffect(() => {
    if (isOpen) {
      // Give headlessui a tick to mount the panel before shifting focus
      const raf = requestAnimationFrame(() => {
        cancelRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-150"
        aria-hidden="true"
      />

      {/* Panel centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-body"
          className="relative w-full max-w-[400px] bg-surface rounded-[12px] shadow-xl p-6 flex flex-col gap-4"
        >
          {/* Icon + Title */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center">
              <ExclamationTriangleIcon
                className="w-5 h-5 text-[#EF4444]"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <Dialog.Title
                as="h3"
                id="confirm-dialog-title"
                className="text-[16px] font-semibold text-text-primary leading-[1.4]"
              >
                {title}
              </Dialog.Title>
            </div>
          </div>

          {/* Body */}
          <p
            id="confirm-dialog-body"
            className="text-[14px] text-text-secondary leading-[1.5]"
          >
            {body}
          </p>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-[14px] font-medium text-text-secondary border border-border-default rounded-lg bg-surface hover:bg-[#F3F4F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-1 disabled:opacity-60"
            >
              {isLoading && (
                <span
                  className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
              {confirmLabel}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
