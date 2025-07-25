'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from './LoadingSpinner';
import SettingsContent from './SettingsContent';

export default function SettingsClientWrapper() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    // Check auth on mount
    useEffect(() => {
        fetch('/api/check-auth', { credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                    router.push('/login?returnTo=/settings');
                }
            })
            .catch(() => {
                setAuthorized(false);
                router.push('/login?returnTo=/settings');
            });
    }, [router]);

    if (authorized === null) {
        return (
            <>
                <Navbar variant='backBtn' />
                <LoadingSpinner />
            </>
        )
    }

    return (
        <>
            <Navbar variant='backBtn' />
            <SettingsContent />
        </>
    )
}
