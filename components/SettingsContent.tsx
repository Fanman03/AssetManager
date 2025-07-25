'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DbStatusResponse = {
    status: 'connected' | 'demo' | 'error';
    demoMode: boolean;
    lastError?: string;
};

export default function SettingsContent() {
    const router = useRouter();
    const [status, setStatus] = useState<DbStatusResponse | null>(null);
    const [importing, setImporting] = useState(false);
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    // Fetch database status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/db/status');
                const json: DbStatusResponse = await res.json();
                setStatus(json);
            } catch (e) {
                setStatus({ status: 'error', demoMode: false, lastError: (e as Error).message });
            }
        };
        fetchStatus();
    }, []);

    // Check authentication status
    useEffect(() => {
        fetch('/api/check-auth', { credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            })
            .catch(() => setAuthorized(false));
    }, []);

    const getStatusColor = (s?: string) => {
        switch (s) {
            case 'connected':
                return 'text-success';
            case 'demo':
                return 'text-warning';
            default:
                return 'text-danger';
        }
    };

    const handleExport = async () => {
        try {
            const res = await fetch('/api/db/export');
            if (!res.ok) throw new Error('Failed to export database.');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `assets-export-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert(`Export failed: ${(e as Error).message}`);
        }
    };

    // Import database from JSON file (requires auth)
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.[0]) return;
        if (!authorized) {
            router.push('/login?returnTo=/settings');
            return;
        }

        const file = event.target.files[0];
        setImporting(true);

        try {
            const text = await file.text();
            const json = JSON.parse(text);
            const res = await fetch('/api/db/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ overwrite: false, assets: json }),
            });
            const result = await res.json();
            if (res.ok) {
                alert(`Import completed: Inserted ${result.inserted}, Replaced ${result.replaced}`);
            } else {
                if (res.status === 401) {
                    alert('You must be logged in to import.');
                    router.push('/login?returnTo=/settings');
                } else {
                    alert(`Import failed: ${result.error}`);
                }
            }
        } catch (e) {
            alert(`Import failed: ${(e as Error).message}`);
        } finally {
            setImporting(false);
            event.target.value = ''; // reset file input
        }
    };

    return (
        <div className="container mt-5">
            <h1>Settings</h1>
            <section>
                <h3>Database</h3>
                <p className="mb-0">
                    Connection Status:{' '}
                    {status ? (
                        <strong className={getStatusColor(status.status)}>
                            <span className="text-capitalize">{status.status}</span>
                        </strong>
                    ) : (
                        <span className="text-white">Checking...</span>
                    )}
                </p>

                <button
                    className="btn btn-primary m-2"
                    onClick={handleExport}>
                    <i className="bi bi-download me-2"></i>Export Database
                </button>

                <label
                    className={`btn btn-secondary m-2 ${authorized === false ? 'disabled' : ''}`}
                >
                    <i className="bi bi-upload me-2"></i>
                    {importing ? 'Importing...' : 'Import Database'}
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="d-none"
                        disabled={importing || !authorized}
                    />
                </label>
            </section>
        </div>
    );
}