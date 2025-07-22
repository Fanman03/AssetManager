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
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: '50%',
        backgroundColor: '#0d6efd', // Bootstrap danger red
        border: 'none',
        color: 'white',
        fontSize: 32,
        lineHeight: 0,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        userSelect: 'none',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0b5ed7')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0d6efd')}
    >
      <i className="bi bi-plus"></i>
    </button>
  );
}
