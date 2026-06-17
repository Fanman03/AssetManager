'use client';

import React, { useEffect, useRef, useState } from 'react';

type DialogVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info';
type DialogMode = 'alert' | 'confirm' | 'prompt';

type DialogOptions = {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
};

type PromptOptions = DialogOptions & {
  inputLabel?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
};

type DialogState =
  | (DialogOptions & {
    mode: 'alert';
    resolve: (value: void) => void;
  })
  | (DialogOptions & {
    mode: 'confirm';
    resolve: (value: boolean) => void;
  })
  | (PromptOptions & {
    mode: 'prompt';
    resolve: (value: string | null) => void;
  });

const variantIcons: Record<DialogVariant, string> = {
  primary: 'bi-info-circle',
  success: 'bi-check-circle',
  danger: 'bi-exclamation-triangle',
  warning: 'bi-exclamation-triangle',
  info: 'bi-info-circle',
};

export function useAppDialog() {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.setTimeout(() => {
      if (dialog.mode === 'prompt') {
        inputRef.current?.focus();
        inputRef.current?.select();
      } else {
        primaryButtonRef.current?.focus();
      }
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialog]);

  const closeDialog = () => setDialog(null);

  const handleCancel = () => {
    if (!dialog) return;

    if (dialog.mode === 'alert') {
      dialog.resolve();
    } else if (dialog.mode === 'confirm') {
      dialog.resolve(false);
    } else {
      dialog.resolve(null);
    }

    closeDialog();
  };

  const handleConfirm = () => {
    if (!dialog) return;

    if (dialog.mode === 'alert') {
      dialog.resolve();
    } else if (dialog.mode === 'confirm') {
      dialog.resolve(true);
    } else {
      dialog.resolve(promptValue);
    }

    closeDialog();
  };

  const showAlert = (options: DialogOptions) =>
    new Promise<void>((resolve) => {
      setDialog({
        mode: 'alert',
        variant: 'primary',
        confirmLabel: 'OK',
        ...options,
        resolve,
      });
    });

  const showConfirm = (options: DialogOptions) =>
    new Promise<boolean>((resolve) => {
      setDialog({
        mode: 'confirm',
        variant: 'primary',
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
        ...options,
        resolve,
      });
    });

  const showPrompt = (options: PromptOptions) =>
    new Promise<string | null>((resolve) => {
      setPromptValue(options.defaultValue ?? '');
      setDialog({
        mode: 'prompt',
        variant: 'primary',
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
        ...options,
        resolve,
      });
    });

  const dialogElement = dialog ? (
    <>
      <div className="modal fade show app-dialog" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title fs-5 d-flex align-items-center gap-2">
                <i className={`bi ${variantIcons[dialog.variant ?? 'primary']} text-${dialog.variant ?? 'primary'}`} aria-hidden="true" />
                {dialog.title}
              </h2>
              <button type="button" className="btn-close" aria-label="Close" onClick={handleCancel} />
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
            >
              <div className="modal-body">
                <p className="mb-0">{dialog.message}</p>
                {dialog.mode === 'prompt' ? (
                  <div className="mt-3">
                    {dialog.inputLabel ? (
                      <label className="form-label" htmlFor="app-dialog-prompt">
                        {dialog.inputLabel}
                      </label>
                    ) : null}
                    <input
                      ref={inputRef}
                      id="app-dialog-prompt"
                      className="form-control"
                      value={promptValue}
                      placeholder={dialog.placeholder}
                      required={dialog.required}
                      onChange={(event) => setPromptValue(event.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              <div className="modal-footer">
                {dialog.mode !== 'alert' ? (
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    {dialog.cancelLabel}
                  </button>
                ) : null}
                <button ref={primaryButtonRef} type="submit" className={`btn btn-${dialog.variant ?? 'primary'}`}>
                  {dialog.confirmLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  ) : null;

  return {
    dialogElement,
    showAlert,
    showConfirm,
    showPrompt,
  };
}
