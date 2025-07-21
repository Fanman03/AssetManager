'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAsset } from '@/actions/createAsset'; // server action

interface Props {
    defaultId: string;
}

export default function CreateAssetForm({ defaultId }: Props) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        _id: defaultId,
        Brand: '',
        Model: '',
        Status: 1,
        Description: '',
        Purchase_Date: '',
        Image: '',
    });

    // Sync _id state to defaultId prop changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            _id: defaultId,
        }));
    }, [defaultId]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function onChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'Status' ? Number(value) : value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Convert Purchase_Date to timestamp (seconds)
            const purchaseDateTimestamp = formData.Purchase_Date
                ? Math.floor(new Date(formData.Purchase_Date).getTime() / 1000)
                : null;

            await createAsset({
                ...formData,
                Purchase_Date: purchaseDateTimestamp,
            });

            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to create asset');
            setLoading(false);
        }
    }

    return (
        <div className="container mt-5">
            <h1>Create New Asset</h1>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label htmlFor="_id" className="form-label">
                        Asset ID
                    </label>
                    <input
                        id="_id"
                        name="_id"
                        type="text"
                        className="form-control"
                        value={formData._id}
                        onChange={onChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Brand" className="form-label">
                        Brand
                    </label>
                    <input
                        id="Brand"
                        name="Brand"
                        type="text"
                        className="form-control"
                        value={formData.Brand}
                        onChange={onChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Model" className="form-label">
                        Model
                    </label>
                    <input
                        id="Model"
                        name="Model"
                        type="text"
                        className="form-control"
                        value={formData.Model}
                        onChange={onChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Status" className="form-label">
                        Status
                    </label>
                    <select
                        id="Status"
                        name="Status"
                        className="form-select"
                        value={formData.Status}
                        onChange={onChange}
                    >
                        <option value={0}>Spare</option>
                        <option value={1}>In Service</option>
                        <option value={2}>Retired</option>
                        <option value={3}>Sold</option>
                        <option value={4}>Lost</option>
                        <option value={5}>Stolen</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="Description" className="form-label">
                        Description
                    </label>
                    <textarea
                        id="Description"
                        name="Description"
                        className="form-control"
                        value={formData.Description}
                        onChange={onChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Purchase_Date" className="form-label">
                        Purchase Date
                    </label>
                    <input
                        id="Purchase_Date"
                        name="Purchase_Date"
                        type="date"
                        className="form-control"
                        value={formData.Purchase_Date}
                        onChange={onChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Image" className="form-label">
                        Image Path
                    </label>
                    <input
                        id="Image"
                        name="Image"
                        type="text"
                        className="form-control"
                        value={formData.Image}
                        onChange={onChange}
                    />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Asset'}
                </button>
            </form>
        </div>
    );
}
