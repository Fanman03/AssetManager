'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDialog } from './AppDialog';

export default function AssetCloneButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const { dialogElement, showAlert, showPrompt } = useAppDialog();

  useEffect(() => {
    fetch('/api/check-auth', { credentials: 'include' })
      .then(res => setAuthorized(res.ok))
      .catch(() => setAuthorized(false));
  }, []);

  const handleCloneClick = async () => {
    if (!authorized) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    const newId = await showPrompt({
      title: 'Clone Asset',
      message: 'Enter a new Asset Tag (ID) for the clone.',
      inputLabel: 'New Asset Tag',
      placeholder: 'Asset tag',
      confirmLabel: 'Clone Asset',
      required: true,
      variant: 'info',
    });
    if (!newId) return;

    try {
      const res = await fetch(`/api/clone-asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sourceId: assetId, newId }),
      });

      if (!res.ok) throw new Error('Clone failed');
      await showAlert({
        title: 'Asset Cloned',
        message: 'Asset cloned successfully.',
        variant: 'success',
      });
      router.push(`/${newId}`);
    } catch (err: any) {
      await showAlert({
        title: 'Clone Failed',
        message: err.message || 'Clone failed',
        variant: 'danger',
      });
    }
  };

  return (
    <>
      <button className="btn btn-info m-2 assetControlBtn" onClick={handleCloneClick}>
        <i className="bi bi-files me-2" />
        Clone Asset
      </button>
      {dialogElement}
    </>
  );
}
