'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Asset } from '@/types/asset';
import Navbar from './Navbar';
import FloatingAddButton from './FloatingAddButton';
import markdownit from 'markdown-it'
import Cookies from 'js-cookie';

type Props = {
  initialAssets: Asset[];
};

export default function ClientAssetList({ initialAssets }: Props) {
  let appName = process.env.NEXT_PUBLIC_APP_NAME;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState(() => Cookies.get('sortOption') || 'Default');
  const [itemsPerPage, setItemsPerPage] = useState(() => parseInt(Cookies.get('itemsPerPage') || '25'));
  const [sortField, setSortField] = useState<keyof Asset | null>(() => {
    const sf = Cookies.get('sortField');
    return sf ? (sf as keyof Asset) : null;
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    const dir = Cookies.get('sortDirection');
    return dir === 'desc' ? 'desc' : 'asc';
  });
  const [showInServiceOnly, setShowInServiceOnly] = useState<boolean>(() => {
    return Cookies.get('showInServiceOnly') === 'true';
  });
  const [filteredAssets, setFilteredAssets] = useState(initialAssets);
  const [currentPage, setCurrentPage] = useState(1);
  const md = markdownit()

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let result = initialAssets.filter(a =>
      a._id.toLowerCase().includes(term) ||
      a.Brand.toLowerCase().includes(term) ||
      a.Model.toLowerCase().includes(term) ||
      a.Description.toLowerCase().includes(term)
    );

    if (showInServiceOnly) {
      result = result.filter(a => a.Status === 1);
    }

    setFilteredAssets(result);
  }, [searchTerm, initialAssets, showInServiceOnly]);

  useEffect(() => {
    Cookies.set('sortOption', sortOption, { expires: 365 });
  }, [sortOption]);

  useEffect(() => {
    Cookies.set('itemsPerPage', String(itemsPerPage), { expires: 365 });
  }, [itemsPerPage]);

  useEffect(() => {
    if (sortField !== null) {
      Cookies.set('sortField', String(sortField), { expires: 365 });
    } else {
      Cookies.remove('sortField');
    }
  }, [sortField]);

  useEffect(() => {
    Cookies.set('sortDirection', sortDirection, { expires: 365 });
  }, [sortDirection]);

  useEffect(() => {
    Cookies.set('showInServiceOnly', String(showInServiceOnly), { expires: 365 });
  }, [showInServiceOnly]);



  const sortedAssets = useMemo(() => {
    const copy = [...filteredAssets];

    if (sortField) {
      copy.sort((a, b) => {
        const aValue = a[sortField] ?? '';
        const bValue = b[sortField] ?? '';

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    } else if (sortOption === 'Oldest') {
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
  }, [sortOption, filteredAssets, sortField, sortDirection]);

  const handleColumnSort = (field: keyof Asset) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredAssets.length);

  const paginatedAssets = sortedAssets.slice(startIndex, endIndex);

  // Ellipsis page logic
  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    const delta = 2;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) range.unshift('...');
    if (current + delta < total - 1) range.push('...');

    range.unshift(1);
    if (total > 1) range.push(total);
    return range;
  };

  const statusIcon = (status?: number) => {
    const map: Record<number, { icon: string; className: string; label: string }> = {
      0: { icon: 'check-circle-fill', className: 'text-info', label: 'Spare' },
      1: { icon: 'check-circle-fill', className: 'text-success', label: 'Active' },
      2: { icon: 'clock-fill', className: 'text-warning', label: 'Retired' },
      3: { icon: 'currency-exchange', className: 'text-warning', label: 'Sold' },
      4: { icon: 'question-circle-fill', className: 'text-danger', label: 'Lost' },
      5: { icon: 'exclamation-circle-fill', className: 'text-danger', label: 'Stolen' },
    };

    const data = map[status ?? -1] || {
      icon: 'bug-fill',
      className: 'text-danger',
      label: 'Error',
    };

    return (
      <i
        className={`bi bi-${data.icon} ${data.className}`}
        title={data.label}
        data-bs-toggle="tooltip"
        data-bs-placement="right"
      />
    );
  };


  return (
    <>
      <FloatingAddButton />
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="container">
        <div className="row my-2 g-2">
          <div className="col-12 col-md d-flex align-items-center justify-content-md-start justify-content-between">
            <h1 className="display-6 fw-normal mb-0">Asset List</h1>
          </div>
          <div className="col-12 col-md-auto">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 dropdown-control-row">
              {/* Sort Dropdown */}
              <div className="d-flex align-items-center">
                <label htmlFor="sortDropdown" className="form-label me-2 mb-0">Sort:</label>
                <div className="dropdown">
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
                        <button className="dropdown-item" onClick={() => {
                          setSortOption(opt);
                          setSortField(null);
                          setSortDirection('asc');
                        }}>
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Items per Page Dropdown */}
              <div className="d-flex align-items-center">
                <label htmlFor="perPageSelect" className="form-label me-2 mb-0">Items per page:</label>
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle"
                    id="perPageSelect"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {itemsPerPage}
                  </button>
                  <ul className="dropdown-menu">
                    {[25, 50, 100].map(n => (
                      <li key={n}>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setItemsPerPage(n);
                            setCurrentPage(1);
                          }}
                        >
                          {n}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex flex-row-reverse align-items-center justify-content-md-start justify-content-around my-2">
            <div className="ms-2">
              <button className="btn btn-secondary" onClick={() => {
                Cookies.remove('searchTerm');
                Cookies.remove('sortOption');
                Cookies.remove('sortField');
                Cookies.remove('sortDirection');
                Cookies.remove('itemsPerPage');
                Cookies.remove('showInServiceOnly');
                location.reload();
              }}>Reset Filters</button>

            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="flexCheckInService"
                checked={showInServiceOnly}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setShowInServiceOnly(checked);
                }}
              />
              <label className="form-check-label" htmlFor="flexCheckInService">
                Show active items only
              </label>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          {sortedAssets.length > 0 && (
            <p className="text-muted mt-2">
              Showing {startIndex + 1}–{endIndex} of {sortedAssets.length} item{sortedAssets.length !== 1 && 's'}
            </p>
          )}
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link text-primary"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  aria-label="Previous"
                >
                  <i className="bi bi-chevron-left" />
                </button>
              </li>

              {getPageNumbers(currentPage, totalPages).map((page, index) =>
                page === '...' ? (
                  <li key={`ellipsis-${index}`} className="page-item disabled">
                    <span className="page-link">…</span>
                  </li>
                ) : (
                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      style={{ backgroundColor: page === currentPage ? '#0d6efd' : undefined, color: page === currentPage ? 'white' : undefined }}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link text-primary"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  aria-label="Next"
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
        {sortedAssets.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th className="statusContainer" onClick={() => handleColumnSort('Status')}>{sortField === 'Status' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                  <th role="button" onClick={() => handleColumnSort('_id')}>
                    Asset Tag {sortField === '_id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th role="button" onClick={() => handleColumnSort('Brand')}>
                    Brand {sortField === 'Brand' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th role="button" onClick={() => handleColumnSort('Model')}>
                    Model {sortField === 'Model' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th role="button" onClick={() => handleColumnSort('Description')}>
                    Description {sortField === 'Description' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedAssets.map(asset => (
                  <tr key={asset._id} className="assetRow" onClick={() => router.push(`/${asset._id}`)}>
                    <td className="statusContainer">{statusIcon(asset.Status)}</td>
                    <td>
                      <Link href={`/${asset._id}`}>{asset._id}</Link>
                    </td>
                    <td>{asset.Brand}</td>
                    <td>{asset.Model}</td>
                    <td dangerouslySetInnerHTML={{ __html: md.renderInline(asset.Description) }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h3 className="text-center text-muted">No results found.</h3>
        )}
      </main>
    </>
  );
}
