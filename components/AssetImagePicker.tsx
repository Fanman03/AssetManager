'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ASSET_IMAGE_REPO_URL, type AssetImageOption } from '@/lib/assetImages';

type AssetImagePickerProps = {
  value: string;
  onChange: (value: string) => void;
  initialSearch?: string;
};

export default function AssetImagePicker({ value, onChange, initialSearch = '' }: AssetImagePickerProps) {
  const [images, setImages] = useState<AssetImageOption[]>([]);
  const [query, setQuery] = useState('');
  const [hasEditedQuery, setHasEditedQuery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  async function loadImages(signal?: AbortSignal) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/asset-images', { cache: 'no-store', signal });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load asset images');
      }

      setImages(data.images || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load asset images');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!showPicker || images.length > 0) return;

    const controller = new AbortController();
    loadImages(controller.signal);

    return () => {
      controller.abort();
    };
  }, [images.length, showPicker]);

  useEffect(() => {
    if (hasEditedQuery) return;

    const candidate = initialSearch.trim();
    if (!candidate || images.length === 0) {
      setQuery('');
      return;
    }

    const hasMatchingImages = images.some((image) =>
      image.path.toLowerCase().includes(candidate.toLowerCase())
    );

    setQuery(hasMatchingImages ? initialSearch : '');
  }, [hasEditedQuery, images, initialSearch]);

  async function refreshImages() {
    if (!showPicker) {
      setShowPicker(true);
    }

    await loadImages();
  }

  const normalizedValue = value.replace(/\\/g, '/').replace(/\.png$/i, '');
  const filteredImages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return images;

    return images.filter((image) => image.path.toLowerCase().includes(needle));
  }, [images, query]);

  const visibleImages = filteredImages.slice(0, 80);

  return (
    <div className="asset-image-picker">
      <div className="row g-3">
        <div className="col-12">
          <label htmlFor="Image" className="form-label">
            Image Path
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-github"></i>
            </span>
            <input
              id="Image"
              name="Image"
              type="text"
              className="form-control"
              value={normalizedValue}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Brand/Model"
            />
            {normalizedValue && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => onChange('')}
                title="Clear image"
                aria-label="Clear image"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
            <button
              type="button"
              className={`btn ${showPicker ? 'btn-primary' : 'btn-outline-secondary'}`}
              aria-controls="assetImagePickerGrid"
              aria-expanded={showPicker}
              onClick={() => setShowPicker((current) => !current)}
            >
              <i className="bi bi-images me-1"></i>
              Browse
            </button>
          </div>
        </div>
      </div>

      <div
        id="assetImagePickerGrid"
        className="overflow-hidden"
        aria-hidden={!showPicker}
        style={{
          maxHeight: showPicker ? '60rem' : '0',
          opacity: showPicker ? 1 : 0,
          transition: 'max-height 220ms ease, opacity 180ms ease',
        }}
      >
        <div
          className="border rounded p-3 mt-3"
          style={{ backgroundColor: 'var(--bs-table-striped-bg, rgba(var(--bs-emphasis-color-rgb), 0.05))' }}
        >
          <div className="row g-3 mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="search"
                className="form-control"
                value={query}
                onChange={(event) => {
                  setHasEditedQuery(true);
                  setQuery(event.target.value);
                }}
                placeholder="Search repo images"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={refreshImages}
                title="Refresh image list"
                aria-label="Refresh image list"
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>

          {error && <div className="alert alert-warning mb-3">{error}</div>}

          <div className="asset-image-picker-grid">
            {loading && (
              <div className="asset-image-picker-empty">
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Loading images
              </div>
            )}

            {!loading &&
              visibleImages.map((image) => {
                const selected = image.path === normalizedValue;

                return (
                  <button
                    key={image.path}
                    type="button"
                    className={`asset-image-picker-option${selected ? ' is-selected' : ''}`}
                    onClick={() => onChange(image.path)}
                    title={image.path}
                  >
                    <img src={image.url} alt="" loading="lazy" />
                    <span>{image.name}</span>
                    {image.brand && <small>{image.brand}</small>}
                  </button>
                );
              })}

            {!loading && !visibleImages.length && (
              <div className="asset-image-picker-empty">No matching images</div>
            )}

            {!loading && (
              <a
                className="asset-image-picker-option asset-image-picker-repo-link"
                href={ASSET_IMAGE_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Open asset image repo"
              >
                <i className="bi bi-github"></i>
                <span>Add new images</span>
                <small>Create a PR</small>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
