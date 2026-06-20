'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDialog } from './AppDialog';

type DbStatusResponse = {
    status: 'connected' | 'demo' | 'error';
    demoMode: boolean;
    lastError?: string;
};

export default function SettingsContent() {
    const router = useRouter();
    const [status, setStatus] = useState<DbStatusResponse | null>(null);
    const [importing, setImporting] = useState(false);
    const [importingSites, setImportingSites] = useState(false);
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const { dialogElement, showAlert } = useAppDialog();

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
            await showAlert({
                title: 'Export Failed',
                message: `Export failed: ${(e as Error).message}`,
                variant: 'danger',
            });
        }
    };

    const handleExportCSV = async () => {
        try {
            const res = await fetch('/api/db/export/csv');
            if (!res.ok) throw new Error('Failed to export database.');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `assets-export-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            await showAlert({
                title: 'Export Failed',
                message: `Export failed: ${(e as Error).message}`,
                variant: 'danger',
            });
        }
    };

    const handleExportSites = async () => {
        try {
            const res = await fetch('/api/db/sites/export');
            if (!res.ok) throw new Error('Failed to export site data.');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sites-export-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            await showAlert({
                title: 'Site Export Failed',
                message: `Site export failed: ${(e as Error).message}`,
                variant: 'danger',
            });
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
                await showAlert({
                    title: 'Import Complete',
                    message: `Inserted ${result.inserted}, replaced ${result.replaced}.`,
                    variant: 'success',
                });
            } else {
                if (res.status === 401) {
                    await showAlert({
                        title: 'Login Required',
                        message: 'You must be logged in to import.',
                        variant: 'warning',
                    });
                    router.push('/login?returnTo=/settings');
                } else {
                    await showAlert({
                        title: 'Import Failed',
                        message: `Import failed: ${result.error}`,
                        variant: 'danger',
                    });
                }
            }
        } catch (e) {
            await showAlert({
                title: 'Import Failed',
                message: `Import failed: ${(e as Error).message}`,
                variant: 'danger',
            });
        } finally {
            setImporting(false);
            event.target.value = ''; // reset file input
        }
    };

    const handleImportSites = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.[0]) return;
        if (!authorized) {
            router.push('/login?returnTo=/settings');
            return;
        }

        const file = event.target.files[0];
        setImportingSites(true);

        try {
            const text = await file.text();
            const json = JSON.parse(text);
            const res = await fetch('/api/db/sites/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ overwrite: false, sites: json }),
            });
            const result = await res.json();
            if (res.ok) {
                await showAlert({
                    title: 'Site Import Complete',
                    message: `Inserted ${result.inserted}, replaced ${result.replaced}.`,
                    variant: 'success',
                });
            } else {
                if (res.status === 401) {
                    await showAlert({
                        title: 'Login Required',
                        message: 'You must be logged in to import site data.',
                        variant: 'warning',
                    });
                    router.push('/login?returnTo=/settings');
                } else {
                    await showAlert({
                        title: 'Site Import Failed',
                        message: `Site import failed: ${result.error}`,
                        variant: 'danger',
                    });
                }
            }
        } catch (e) {
            await showAlert({
                title: 'Site Import Failed',
                message: `Site import failed: ${(e as Error).message}`,
                variant: 'danger',
            });
        } finally {
            setImportingSites(false);
            event.target.value = '';
        }
    };

    return (
        <>
            <div className="container mt-5">
                <h1>Settings</h1>
                <section>
                    <h3>Database</h3>
                    <p>
                        Connection Status:{' '}
                        {status ? (
                            <strong className={getStatusColor(status.status)}>
                                <span className="text-capitalize">{status.status}</span>
                            </strong>
                        ) : (
                            <span className="text-white">Checking...</span>
                        )}
                    </p>
                    <div className="my-2">
                        <h4>Asset Data</h4>
                        <button
                            className="btn btn-primary me-2 my-2"
                            onClick={handleExport}>
                            <i className="bi bi-download me-2"></i>Export Assets
                        </button>

                        <label
                            className={`btn btn-secondary me-2 my-2 ${authorized === false ? 'disabled' : ''}`}
                        >
                            <i className="bi bi-upload me-2"></i>
                            {importing ? 'Importing...' : 'Import Assets'}
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="d-none"
                                disabled={importing || !authorized}
                            />
                        </label>
                        <button className="btn btn-success me-2 my-2" onClick={handleExportCSV}>
                            <i className="bi bi-filetype-csv me-2"></i>Export Assets to CSV
                        </button>
                    </div>
                    <div className="my-2">
                        <h4>Site Data</h4>
                        <button
                            className="btn btn-primary me-2 my-2"
                            onClick={handleExportSites}>
                            <i className="bi bi-building-down me-2"></i>Export Site Data
                        </button>

                        <label
                            className={`btn btn-secondary me-2 my-2 ${authorized === false ? 'disabled' : ''}`}
                        >
                            <i className="bi bi-building-up me-2"></i>
                            {importingSites ? 'Importing...' : 'Import Site Data'}
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportSites}
                                className="d-none"
                                disabled={importingSites || !authorized}
                            />
                        </label>
                    </div>
                </section>
            </div>
            {dialogElement}
        </>
    );
}
