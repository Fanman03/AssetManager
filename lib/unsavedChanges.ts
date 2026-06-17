const DEFAULT_UNSAVED_MESSAGE = 'You have unsaved changes. Leave this page?';

declare global {
  interface Window {
    __assetManagerHasUnsavedChanges?: boolean;
    __assetManagerUnsavedMessage?: string;
  }
}

export function setUnsavedChanges(hasUnsavedChanges: boolean, message = DEFAULT_UNSAVED_MESSAGE) {
  if (typeof window === 'undefined') return;

  window.__assetManagerHasUnsavedChanges = hasUnsavedChanges;
  window.__assetManagerUnsavedMessage = message;
}

export function clearUnsavedChanges() {
  setUnsavedChanges(false);
}

export function confirmUnsavedNavigation() {
  if (typeof window === 'undefined' || !window.__assetManagerHasUnsavedChanges) {
    return true;
  }

  const confirmed = window.confirm(window.__assetManagerUnsavedMessage || DEFAULT_UNSAVED_MESSAGE);
  if (confirmed) {
    clearUnsavedChanges();
  }

  return confirmed;
}

export async function confirmUnsavedNavigationWithDialog(
  showConfirm: (options: {
    title: string;
    message: string;
    variant?: 'warning';
    confirmLabel?: string;
    cancelLabel?: string;
  }) => Promise<boolean>
) {
  if (typeof window === 'undefined' || !window.__assetManagerHasUnsavedChanges) {
    return true;
  }

  const confirmed = await showConfirm({
    title: 'Unsaved Changes',
    message: window.__assetManagerUnsavedMessage || DEFAULT_UNSAVED_MESSAGE,
    variant: 'warning',
    confirmLabel: 'Leave Page',
    cancelLabel: 'Stay',
  });

  if (confirmed) {
    clearUnsavedChanges();
  }

  return confirmed;
}
