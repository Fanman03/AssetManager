'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAsset } from '@/actions/createAsset'; // server action
import { clearUnsavedChanges, confirmUnsavedNavigationWithDialog, setUnsavedChanges } from '@/lib/unsavedChanges';
import type { AssetPropertyOptions } from '@/types/asset';
import { useAppDialog } from './AppDialog';
import AssetImagePicker from './AssetImagePicker';
import PropertyAutocompleteInput from './PropertyAutocompleteInput';

const BUILT_IN_PROPERTY_KEYS = new Set([
    '_id',
    'Brand',
    'Model',
    'Type',
    'Site',
    'Location',
    'Status',
    'Description',
    'Purchase_Date',
    'Image',
]);

const formatPropertyName = (key: string) => key.replace(/_/g, ' ');
const normalizePropertyKey = (key: string) => key.trim().replace(/\s+/g, '_');

interface Props {
    defaultId: string;
    propertyOptions: AssetPropertyOptions;
}

export default function CreateAssetForm({ defaultId, propertyOptions }: Props) {
    const router = useRouter();
    const isNavigatingAfterSave = useRef(false);
    const purchaseDateInputRef = useRef<HTMLInputElement | null>(null);
    const { dialogElement, showConfirm } = useAppDialog();

    const initialFormData = useMemo(() => ({
        _id: defaultId,
        Brand: '',
        Model: '',
        Status: 1,
        Description: '',
        Purchase_Date: '',
        Type: '',
        Site: '',
        Location: '',
        Image: '',
    }), [defaultId]);

    const [formData, setFormData] = useState(initialFormData);

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

    const customPropertyNameOptions = useMemo(
        () =>
            Object.keys(propertyOptions)
                .filter((key) => !BUILT_IN_PROPERTY_KEYS.has(key))
                .map(formatPropertyName)
                .sort((a, b) => a.localeCompare(b)),
        [propertyOptions]
    );

    const isDirty = useMemo(
        () =>
            JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
            Object.keys(extraProps).length > 0 ||
            newPropKey.trim() !== '' ||
            newPropValue !== '',
        [extraProps, formData, initialFormData, newPropKey, newPropValue]
    );

    useEffect(() => {
        setUnsavedChanges(isDirty && !isNavigatingAfterSave.current);

        return () => {
            clearUnsavedChanges();
        };
    }, [isDirty]);

    useEffect(() => {
        if (!isDirty || isNavigatingAfterSave.current) return;

        const message = 'You have unsaved changes. Leave this page?';
        const currentUrl = window.location.href;

        function handleBeforeUnload(event: BeforeUnloadEvent) {
            if (isNavigatingAfterSave.current) return;

            event.preventDefault();
            event.returnValue = message;
        }

        async function handleDocumentClick(event: MouseEvent) {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const target = event.target as Element | null;
            const link = target?.closest('a[href]') as HTMLAnchorElement | null;
            if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            const destination = new URL(link.href, window.location.href);
            if (destination.href === window.location.href) return;

            event.preventDefault();
            event.stopPropagation();

            if (await confirmUnsavedNavigationWithDialog(showConfirm)) {
                isNavigatingAfterSave.current = true;
                window.location.href = destination.href;
            }
        }

        async function handlePopState() {
            if (!(await confirmUnsavedNavigationWithDialog(showConfirm))) {
                window.history.pushState(null, '', currentUrl);
            } else {
                isNavigatingAfterSave.current = true;
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        document.addEventListener('click', handleDocumentClick, true);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('click', handleDocumentClick, true);
        };
    }, [isDirty, showConfirm]);

    function onChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'Status' ? Number(value) : value,
        }));
    }

    function setFormValue(name: keyof typeof formData, value: string) {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function openPurchaseDatePicker() {
        const input = purchaseDateInputRef.current;
        if (!input) return;

        input.focus();
        if ('showPicker' in input) {
            try {
                input.showPicker();
            } catch {
                // Some browsers can reject showPicker despite a click; focus still helps.
            }
        }
    }

    function setExtraPropValue(name: string, value: string) {
        setExtraProps((prev) => ({
            ...prev,
            [name]: value,
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

            isNavigatingAfterSave.current = true;
            clearUnsavedChanges();
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to create asset');
            setLoading(false);
        }
    }

    return (
        <div className="container mt-3">
            {dialogElement}
            <h1 className="display-6 fw-normal">Create New Asset</h1>
            <form onSubmit={handleSubmit} className="asset-form mt-4">
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
                    <PropertyAutocompleteInput
                        id="Brand"
                        name="Brand"
                        value={formData.Brand}
                        options={propertyOptions.Brand}
                        onValueChange={(value) => setFormValue('Brand', value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Model" className="form-label">Model</label>
                    <PropertyAutocompleteInput
                        id="Model"
                        name="Model"
                        value={formData.Model}
                        options={propertyOptions.Model}
                        onValueChange={(value) => setFormValue('Model', value)}
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
                        <option value={6}>Broken</option>
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

                <div className="mb-3" onClick={openPurchaseDatePicker}>
                    <label htmlFor="Purchase_Date" className="form-label">Purchase Date</label>
                    <input
                        ref={purchaseDateInputRef}
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
                    <PropertyAutocompleteInput
                        id="Type"
                        name="Type"
                        value={formData.Type}
                        options={propertyOptions.Type}
                        onValueChange={(value) => setFormValue('Type', value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Site" className="form-label">Site</label>
                    <PropertyAutocompleteInput
                        id="Site"
                        name="Site"
                        value={formData.Site}
                        options={propertyOptions.Site}
                        onValueChange={(value) => setFormValue('Site', value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Location" className="form-label">Location</label>
                    <PropertyAutocompleteInput
                        id="Location"
                        name="Location"
                        value={formData.Location}
                        options={propertyOptions.Location}
                        onValueChange={(value) => setFormValue('Location', value)}
                    />
                </div>

                <div className="mb-3">
                    <AssetImagePicker
                        value={formData.Image}
                        initialSearch={formData.Model}
                        onChange={(value) => setFormValue('Image', value)}
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
                            <PropertyAutocompleteInput
                                id={`extra-${key}`}
                                name={key}
                                value={value}
                                options={propertyOptions[key] ?? []}
                                onValueChange={(nextValue) => setExtraPropValue(key, nextValue)}
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
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                ))}

                {/* Add new property */}
                <div className="input-group mb-3">
                    <PropertyAutocompleteInput
                        id="new-property-name"
                        name="new-property-name"
                        wrapperClassName="flex-grow-1"
                        placeholder="New property name"
                        value={newPropKey}
                        options={customPropertyNameOptions}
                        onValueChange={setNewPropKey}
                    />
                    <PropertyAutocompleteInput
                        id="new-property-value"
                        name="new-property-value"
                        wrapperClassName="flex-grow-1"
                        placeholder="New property value"
                        value={newPropValue}
                        options={propertyOptions[normalizePropertyKey(newPropKey)] ?? []}
                        onValueChange={setNewPropValue}
                    />
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            const key = normalizePropertyKey(newPropKey);
                            if (key) {
                                setExtraProps((prev) => ({ ...prev, [key]: newPropValue }));
                                setNewPropKey('');
                                setNewPropValue('');
                            }
                        }}
                        disabled={!normalizePropertyKey(newPropKey)}
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
