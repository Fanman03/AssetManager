'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Asset } from '@/types/asset';

import { updateAsset } from '@/actions/updateAsset'; // Your server action

interface EditAssetFormProps {
    asset: Asset;
}

export default function EditAssetForm({ asset }: EditAssetFormProps) {
    const router = useRouter();

    // Known fields state
    const [formData, setFormData] = useState({
        Brand: asset.Brand || '',
        Model: asset.Model || '',
        Status: asset.Status ?? 1,
        Description: asset.Description || '',
        Purchase_Date: asset.Purchase_Date
            ? new Date(asset.Purchase_Date * 1000).toISOString().slice(0, 10)
            : '',
        Image: asset.Image || '',
    });

    // Arbitrary extra props state
    const [extraProps, setExtraProps] = useState<Record<string, any>>(
        Object.fromEntries(
            Object.entries(asset).filter(
                ([key]) =>
                    ![
                        '_id',
                        'Brand',
                        'Model',
                        'Status',
                        'Description',
                        'Purchase_Date',
                        'Image',
                    ].includes(key)
            )
        )
    );

    // New property inputs state
    const [newPropKey, setNewPropKey] = useState('');
    const [newPropValue, setNewPropValue] = useState('');

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

    // Handlers for new property inputs
    const onNewPropKeyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setNewPropKey(e.target.value);
    const onNewPropValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setNewPropValue(e.target.value);

    // Add new property to extraProps
    const addNewProperty = () => {
        const key = newPropKey.trim();
        if (!key) return;

        setExtraProps((prev) => ({
            ...prev,
            [key]: newPropValue,
        }));

        setNewPropKey('');
        setNewPropValue('');
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Merge known and extra props for update
            const fullUpdate = {
                ...formData,
                ...extraProps,
                Purchase_Date: formData.Purchase_Date
                    ? Math.floor(new Date(formData.Purchase_Date).getTime() / 1000)
                    : null,
            };

            const removedKeys = Object.keys(asset).filter(
                (key) =>
                    ![
                        '_id',
                        'Brand',
                        'Model',
                        'Status',
                        'Description',
                        'Purchase_Date',
                        'Image',
                    ].includes(key) &&
                    !(key in extraProps) // key was in original asset but not in updated extraProps
            );

            await updateAsset(asset._id, fullUpdate, removedKeys);
            router.push(`/${asset._id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to update asset');
            setLoading(false);
        }
    }

    return (
        <div className="container mt-5">
            <h1>Edit Asset: {asset._id}</h1>
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Brand */}
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

                {/* Model */}
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

                {/* Status */}
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

                {/* Description */}
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

                {/* Purchase Date */}
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

                {/* Image */}
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

                {/* Existing arbitrary extra properties */}
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
                        onChange={onNewPropKeyChange}
                    />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="New property value"
                        value={newPropValue}
                        onChange={onNewPropValueChange}
                    />
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addNewProperty}
                        disabled={!newPropKey.trim()}
                    >
                        Add Property
                    </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}