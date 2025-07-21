'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { Asset } from '@/types/asset';

type Props = {
  initialAssets: Asset[];
};

export default function ClientAssetList({ initialAssets }: Props) {
  let appName = process.env.NEXT_PUBLIC_APP_NAME;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('Default');
  const [filteredAssets, setFilteredAssets] = useState(initialAssets);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const result = initialAssets.filter(a =>
      a._id.toLowerCase().includes(term) ||
      a.Brand.toLowerCase().includes(term) ||
      a.Model.toLowerCase().includes(term) ||
      a.Description.toLowerCase().includes(term)
    );
    setFilteredAssets(result);
  }, [searchTerm, initialAssets]);

  const sortedAssets = useMemo(() => {
    const copy = [...filteredAssets];
    if (sortOption === 'Oldest') {
      copy.sort((a, b) => a.Purchase_Date - b.Purchase_Date);
    } else if (sortOption === 'Newest') {
      copy.sort((a, b) => b.Purchase_Date - a.Purchase_Date);
    } else {
      copy.sort((a, b) => {
        if (a.Status === b.Status) {
          return a.Brand === b.Brand
            ? a.Model.localeCompare(b.Model)
            : a.Brand.localeCompare(b.Brand);
        }
        return (a.Status ?? 99) - (b.Status ?? 99);
      });
    }
    return copy;
  }, [sortOption, filteredAssets]);

  const statusIcon = (status?: number) => {
    const iconMap: { [key: number]: string } = {
      0: 'bi-check-circle-fill icon-blue" title="Spare',
      1: 'bi-check-circle-fill text-success" title="In Service',
      2: 'bi-clock-fill text-warning" title="Retired',
      3: 'bi-currency-exchange text-warning" title="Sold',
      4: 'bi-question-circle-fill text-danger" title="Lost',
      5: 'bi-exclamation-circle-fill text-danger" title="Stolen',
    };
    const icon = iconMap[status ?? -1] || 'bi-bug-fill text-danger" title="Error';
    return <i className={`bi ${icon}`} data-bs-toggle="tooltip" data-bs-placement="right" />;
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container">
          <a className="navbar-brand text-white" href="/">
            <i className="bi bi-pc-display me-2"></i><span>{appName}</span>
          </a>
          <div className="collapse navbar-collapse flex-row-reverse">
            <form className="form-inline my-2 my-lg-0">
              <input
                className="form-control me-sm-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
          <h1 className="display-4 fw-normal">Asset List</h1>
          <div>
            <label htmlFor="sortDropdown" className="form-label me-2">Sort:</label>
            <div className="dropdown d-inline">
              <button
                className="btn btn-primary dropdown-toggle"
                id="sortDropdown"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {sortOption}
              </button>
              <ul className="dropdown-menu">
                {['Default', 'Oldest', 'Newest'].map(opt => (
                  <li key={opt}>
                    <button className="dropdown-item" onClick={() => setSortOption(opt)}>
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {sortedAssets.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Asset Tag</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssets.map(asset => (
                  <tr key={asset._id}>
                    <td>{statusIcon(asset.Status)}</td>
                    <td>
                      <Link href={`/${asset._id}`}>{asset._id}</Link>
                    </td>
                    <td>{asset.Brand}</td>
                    <td>{asset.Model}</td>
                    <td>{asset.Description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h3 className="text-center text-muted">No results found.</h3>
        )}
      </div>
    </>
  );
}
