'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateAssetForm from '@/components/CreateAssetForm';
import Navbar from '@/components/Navbar';

export default function CreateAssetPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [nextId, setNextId] = useState<string>('1'); // default to 1

    // Check auth on mount
    useEffect(() => {
        fetch('/api/check-auth', { credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                    router.push('/login?returnTo=/createAsset');
                }
            })
            .catch(() => {
                setAuthorized(false);
                router.push('/login?returnTo=/createAsset');
            });
    }, [router]);

    // Fetch asset count to determine next ID (once authorized)
    useEffect(() => {
        if (authorized) {
            fetch('/api/asset-count')
                .then(res => res.json())
                .then(data => {
                    // Assume API returns { count: number }
                    setNextId((data.count + 1).toString());
                })
                .catch(() => setNextId('1'));
        }
    }, [authorized]);

    if (authorized === null) {
        return <div>Loading...</div>; // or a spinner
    }

    return (
        <>
            <Navbar variant='backBtn' />
            <CreateAssetForm defaultId={nextId} />
        </>
    )
}
