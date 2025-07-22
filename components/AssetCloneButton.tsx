'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AssetCloneButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

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

    const newId = prompt('Enter a new Asset Tag (ID) for the clone:');
    if (!newId) return;

    try {
      const res = await fetch(`/api/clone-asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sourceId: assetId, newId }),
      });

      if (!res.ok) throw new Error('Clone failed');
      alert('Asset cloned successfully!');
      router.push(`/${newId}`);
    } catch (err: any) {
      alert(err.message || 'Clone failed');
    }
  };

  return (
    <button className="btn btn-info m-2 assetControlBtn" onClick={handleCloneClick}>
      <i className="bi bi-files me-2" />
      Clone Asset
    </button>
  );
}
