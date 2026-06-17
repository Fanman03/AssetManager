'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDialog } from './AppDialog';

export default function AssetDeleteButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const { dialogElement, showAlert, showConfirm } = useAppDialog();

  // Check auth on mount
  useEffect(() => {
    fetch('/api/check-auth', { credentials: 'include' })
      .then(res => setAuthorized(res.ok))
      .catch(() => setAuthorized(false));
  }, []);

  const handleDeleteClick = async () => {
    if (!authorized) {
      // Redirect to login with returnTo query parameter
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    const confirmed = await showConfirm({
      title: 'Delete Asset',
      message: 'Are you sure you want to delete this asset? This action cannot be undone.',
      confirmLabel: 'Delete Asset',
      variant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/delete-asset/${assetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Delete failed');
      await showAlert({
        title: 'Asset Deleted',
        message: 'Asset deleted successfully.',
        variant: 'success',
      });
      router.push('/');
    } catch (err: any) {
      await showAlert({
        title: 'Delete Failed',
        message: err.message || err,
        variant: 'danger',
      });
    }
  };

  return (
    <>
      <button className="btn btn-danger m-2 assetControlBtn" onClick={handleDeleteClick}>
        <i className="bi bi-trash me-2" />
        Delete Asset
      </button>
      {dialogElement}
    </>
  );
}
