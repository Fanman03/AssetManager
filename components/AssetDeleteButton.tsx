'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AssetDeleteButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  // Check auth on mount
  useEffect(() => {
    fetch('/api/check-auth', { credentials: 'include' })
      .then(res => setAuthorized(res.ok))
      .catch(() => setAuthorized(false));
  }, []);

  const handleDeleteClick = () => {
    if (!authorized) {
      // Redirect to login with returnTo query parameter
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!window.confirm('Are you sure you want to DELETE this asset? This action cannot be undone.')) {
      return;
    }

    fetch(`/api/delete-asset/${assetId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        alert('Asset deleted successfully');
        router.push('/');
      })
      .catch((err) => alert(err.message || err));
  };

  return (
    <button className="btn btn-danger m-2 assetControlBtn" onClick={handleDeleteClick}>
      <i className="bi bi-trash me-2" />
      Delete Asset
    </button>
  );
}
