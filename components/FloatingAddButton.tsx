'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function FloatingAddButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/createAsset');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Create New Asset"
      title="Create New Asset"
      id="floatingCreateBtn"
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0b5ed7')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0d6efd')}
    >
      <i className="bi bi-plus"></i>
    </button>
  );
}
