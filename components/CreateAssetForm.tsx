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
        Type: '',
    });

    // For extra (arbitrary) properties
    const [extraProps, setExtraProps] = useState<Record<string, string>>({});
    const [newPropKey, setNewPropKey] = useState('');
    const [newPropValue, setNewPropValue] = useState('');

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
            const purchaseDateTimestamp = formData.Purchase_Date
                ? Math.floor(new Date(formData.Purchase_Date).getTime() / 1000)
                : null;

            await createAsset({
                ...formData,
                Purchase_Date: purchaseDateTimestamp,
                ...extraProps, // Include extra properties
            });

            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to create asset');
            setLoading(false);
        }
    }

    return (
        <div className="container mt-3">
            <h1 className="display-6 fw-normal">Create New Asset</h1>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label htmlFor="_id" className="form-label">Asset ID</label>
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
                    <label htmlFor="Brand" className="form-label">Brand</label>
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
                    <label htmlFor="Model" className="form-label">Model</label>
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
                    <label htmlFor="Status" className="form-label">Status</label>
                    <select
                        id="Status"
                        name="Status"
                        className="form-select"
                        value={formData.Status}
                        onChange={onChange}
                    >
                        <option value={0}>Spare</option>
                        <option value={1}>Active</option>
                        <option value={2}>Retired</option>
                        <option value={3}>Sold</option>
                        <option value={4}>Lost</option>
                        <option value={5}>Stolen</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="Description" className="form-label">Description</label>
                    <textarea
                        id="Description"
                        name="Description"
                        className="form-control"
                        value={formData.Description}
                        onChange={onChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Purchase_Date" className="form-label">Purchase Date</label>
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
                    <label htmlFor="Type" className="form-label">Type</label>
                    <input
                        id="Type"
                        name="Type"
                        type="text"
                        className="form-control"
                        value={formData.Type}
                        onChange={onChange}
                    />
                </div>

                {/* ----- Extra Properties UI ----- */}
                <h5>Custom Properties</h5>

                {Object.entries(extraProps).map(([key, value]) => (
                    <div className="mb-3 d-flex align-items-center gap-2" key={key}>
                        <div className="flex-grow-1">
                            <label htmlFor={`extra-${key}`} className="form-label">
                                {key.replace(/_/g, ' ')}
                            </label>
                            <input
                                id={`extra-${key}`}
                                name={key}
                                type="text"
                                className="form-control"
                                value={value}
                                onChange={(e) =>
                                    setExtraProps((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                            />
                        </div>
                        <button
                            type="button"
                            className="btn btn-danger align-self-end"
                            onClick={() => {
                                setExtraProps((prev) => {
                                    const updated = { ...prev };
                                    delete updated[key];
                                    return updated;
                                });
                            }}
                            title="Remove property"
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    </div>
                ))}

                {/* Add new property */}
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="New property name"
                        value={newPropKey}
                        onChange={(e) => setNewPropKey(e.target.value)}
                    />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="New property value"
                        value={newPropValue}
                        onChange={(e) => setNewPropValue(e.target.value)}
                    />
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            if (newPropKey.trim()) {
                                setExtraProps((prev) => ({ ...prev, [newPropKey]: newPropValue }));
                                setNewPropKey('');
                                setNewPropValue('');
                            }
                        }}
                        disabled={!newPropKey.trim()}
                    >
                        Add Property
                    </button>
                </div>
                {/* ----- End Extra Properties ----- */}

                {error && <div className="alert alert-danger">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Asset'}
                </button>
            </form>
        </div>
    );
}
