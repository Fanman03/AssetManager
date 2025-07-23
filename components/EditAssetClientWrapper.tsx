'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import EditAssetForm from './EditAssetForm';
import type { Asset } from '@/types/asset';
import Navbar from './Navbar';

export default function EditAssetClientWrapper({ asset }: { asset: Asset }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/check-auth', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          // Redirect to login with redirectTo param
          router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setAuthorized(false);
        router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (authorized === null) {
    return (
      <>
        <Navbar variant="backBtn" />
        <main className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
        </main>
      </>
    );
  }

  if (!authorized) return null;

  return (
    <>
      <Navbar variant="backBtn" />
      <main className="container pb-4">
        <EditAssetForm asset={asset} />
      </main>
    </>
  );
}
