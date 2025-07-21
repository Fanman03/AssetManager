'use client';

import React, { useState, useEffect } from 'react';
import PasswordPrompt from './PasswordPrompt';
import EditAssetForm from './EditAssetForm';
import type { Asset } from '@/types/asset';
import Navbar from './Navbar';

const COOKIE_NAME = 'admin_auth';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

export default function EditAssetClientWrapper({ asset }: { asset: Asset }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (getCookie(COOKIE_NAME) === 'true') {
      setAuthorized(true);
    }
  }, []);

  const onAuthSuccess = () => {
    setCookie(COOKIE_NAME, 'true', 1);
    setAuthorized(true);
  };

  if (!authorized) {
    return (
      <>
        <Navbar variant="backBtn" />
        <PasswordPrompt
          onSuccess={onAuthSuccess}
          onCancel={() => {
            window.location.href = '/';
          }}
        />
      </>
    );
  }

  return (
    <>
      <Navbar variant="backBtn" />
      <main className="container pb-4">
        <EditAssetForm asset={asset} />
      </main>
    </>
  );
}
