'use client';

import React, { useState } from 'react';

interface PasswordPromptProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function PasswordPrompt({ onSuccess, onCancel }: PasswordPromptProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/check-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                setError('Incorrect password');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-3 border rounded" style={{ maxWidth: 320, margin: 'auto', marginTop: '3rem' }}>
            <div className="mb-3">
                <label htmlFor="passwordInput" className="form-label">
                    Admin Password
                </label>
                <input
                    id="passwordInput"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoFocus
                />
            </div>
            {error && <div className="text-danger mb-3">{error}</div>}
            <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Checking...' : 'Submit'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
