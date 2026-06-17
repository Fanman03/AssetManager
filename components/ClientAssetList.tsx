'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Asset } from '@/types/asset';
import Navbar from './Navbar';
import FloatingAddButton from './FloatingAddButton';
import markdownit from 'markdown-it'
import Cookies from 'js-cookie';
import Fuse from 'fuse.js';
import { useDebounce } from 'use-debounce';

type Props = {
  initialAssets: Asset[];
};

type ItemsPerPage = number | 'all';
type AdvancedFilterMenu = 'status' | 'brand' | 'model' | 'site';

const statusFilterOptions = [
  { value: '0', label: 'Spare' },
  { value: '1', label: 'Active' },
  { value: '2', label: 'Retired' },
  { value: '3', label: 'Sold' },
  { value: '4', label: 'Lost' },
  { value: '5', label: 'Stolen' },
  { value: '6', label: 'Broken' },
];

const getInitialItemsPerPage = (): ItemsPerPage => {
  const savedItemsPerPage = Cookies.get('itemsPerPage');

  if (savedItemsPerPage === 'all') {
    return 'all';
  }

  const parsedItemsPerPage = parseInt(savedItemsPerPage || '25', 10);
  return [25, 50, 100].includes(parsedItemsPerPage) ? parsedItemsPerPage : 25;
};

const getAssetTextValue = (asset: Asset, field: keyof Asset) => String(asset[field] ?? '').trim();

const getUniqueAssetOptions = (assets: Asset[], field: keyof Asset): string[] => {
  const options = new Set<string>();

  for (const asset of assets) {
    const value = getAssetTextValue(asset, field);
    if (value) options.add(value);
  }

  return [...options].sort((a, b) => a.localeCompare(b));
};

export default function ClientAssetList({ initialAssets }: Props) {
  const router = useRouter();
  const advancedFiltersRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState(() => Cookies.get('sortOption') || 'Default');
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(getInitialItemsPerPage);
  const [sortField, setSortField] = useState<keyof Asset | null>(() => {
    const sf = Cookies.get('sortField');
    return sf ? (sf as keyof Asset) : null;
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    const dir = Cookies.get('sortDirection');
    return dir === 'desc' ? 'desc' : 'asc';
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    return Cookies.get('statusFilter') || (Cookies.get('showInServiceOnly') === 'true' ? '1' : '');
  });
  const [brandFilter, setBrandFilter] = useState(() => Cookies.get('brandFilter') || '');
  const [modelFilter, setModelFilter] = useState(() => Cookies.get('modelFilter') || '');
  const [siteFilter, setSiteFilter] = useState(() => Cookies.get('siteFilter') || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [openFilterMenu, setOpenFilterMenu] = useState<AdvancedFilterMenu | null>(null);
  const [filteredAssets, setFilteredAssets] = useState(initialAssets);
  const [currentPage, setCurrentPage] = useState(1);
  const md = markdownit()
  const [debouncedSearchTerm] = useDebounce(searchTerm, 100);

  const fuse = useMemo(() => new Fuse(initialAssets, {
    keys: ['_id', 'Brand', 'Model', 'Description', 'Type', 'Site'],
    threshold: 0.3,
    includeMatches: true,
  }), [initialAssets]);

  const brandOptions = useMemo(() => getUniqueAssetOptions(initialAssets, 'Brand'), [initialAssets]);
  const modelOptions = useMemo(() => getUniqueAssetOptions(initialAssets, 'Model'), [initialAssets]);
  const siteOptions = useMemo(() => getUniqueAssetOptions(initialAssets, 'Site'), [initialAssets]);
  const advancedFilterCount = [statusFilter, brandFilter, modelFilter, siteFilter].filter(Boolean).length;
  const statusFilterLabel = statusFilterOptions.find(option => option.value === statusFilter)?.label || 'All';

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption, statusFilter, brandFilter, modelFilter, siteFilter]);

  useEffect(() => {
    if (!openFilterMenu) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && advancedFiltersRef.current?.contains(target)) return;

      setOpenFilterMenu(null);
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openFilterMenu]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get('search');
    if (urlSearch) setSearchTerm(urlSearch);
  }, []);

  useEffect(() => {
    let result: Asset[];

    if (!debouncedSearchTerm.trim()) {
      result = initialAssets;
    } else {
      // Split query into words
      const terms = debouncedSearchTerm.trim().split(/\s+/);

      // Search for each term and merge results
      const searchResults = terms.map(term =>
        fuse.search(term).map(r => r.item)
      );

      // Keep only assets that match ALL terms
      result = searchResults.reduce((acc, arr) =>
        acc.filter(asset => arr.includes(asset))
      );
    }

    if (statusFilter) {
      result = result.filter(a => a.Status === Number(statusFilter));
    }

    if (brandFilter) {
      result = result.filter(a => getAssetTextValue(a, 'Brand') === brandFilter);
    }

    if (modelFilter) {
      result = result.filter(a => getAssetTextValue(a, 'Model') === modelFilter);
    }

    if (siteFilter) {
      result = result.filter(a => getAssetTextValue(a, 'Site') === siteFilter);
    }

    setFilteredAssets(result);
  }, [debouncedSearchTerm, initialAssets, statusFilter, brandFilter, modelFilter, siteFilter, fuse]);

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
    if (statusFilter) {
      Cookies.set('statusFilter', statusFilter, { expires: 365 });
    } else {
      Cookies.remove('statusFilter');
    }
    Cookies.remove('showInServiceOnly');
  }, [statusFilter]);

  useEffect(() => {
    if (brandFilter) {
      Cookies.set('brandFilter', brandFilter, { expires: 365 });
    } else {
      Cookies.remove('brandFilter');
    }
  }, [brandFilter]);

  useEffect(() => {
    if (modelFilter) {
      Cookies.set('modelFilter', modelFilter, { expires: 365 });
    } else {
      Cookies.remove('modelFilter');
    }
  }, [modelFilter]);

  useEffect(() => {
    if (siteFilter) {
      Cookies.set('siteFilter', siteFilter, { expires: 365 });
    } else {
      Cookies.remove('siteFilter');
    }
    Cookies.remove('locationFilter');
  }, [siteFilter]);

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

  const handleAssetRowClick = (
    event: React.MouseEvent<HTMLTableRowElement>,
    assetId: string
  ) => {
    const href = `/${assetId}`;

    if (event.button === 1 || event.ctrlKey || event.metaKey) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    router.push(href);
  };

  const effectiveItemsPerPage = itemsPerPage === 'all' ? Math.max(filteredAssets.length, 1) : itemsPerPage;
  const totalPages = Math.ceil(filteredAssets.length / effectiveItemsPerPage);
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const endIndex = Math.min(startIndex + effectiveItemsPerPage, filteredAssets.length);

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
      6: { icon: 'tools', className: 'text-danger', label: 'Broken' },
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

  const toggleFilterMenu = (menu: AdvancedFilterMenu) => {
    setOpenFilterMenu((current) => (current === menu ? null : menu));
  };


  return (
    <>
      <FloatingAddButton />
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="container px-quarter">
        <div className="row my-2 g-2 px-2">
          <div className="col-12 col-md d-flex align-items-center justify-content-md-start justify-content-between">
            <h1 className="display-6 fw-normal mb-0">Asset List</h1>
          </div>
          <div className="col-12 col-md-auto">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 dropdown-control-row">
              {/* Sort Dropdown */}
              <div className="d-flex align-items-center list-control-item">
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
              <div className="d-flex align-items-center list-control-item">
                <label htmlFor="perPageSelect" className="form-label me-2 mb-0">Items per page:</label>
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle"
                    id="perPageSelect"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {itemsPerPage === 'all' ? 'All' : itemsPerPage}
                  </button>
                  <ul className="dropdown-menu">
                    {([25, 50, 100, 'all'] as ItemsPerPage[]).map(n => (
                      <li key={n}>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setItemsPerPage(n);
                            setCurrentPage(1);
                          }}
                        >
                          {n === 'all' ? 'All' : n}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
          <div className="col-12 d-flex align-items-center justify-content-md-end gap-2 my-2 filter-control-row">
            <button
              className={`btn ${showAdvancedFilters ? 'btn-primary' : 'btn-secondary'}`}
              type="button"
              aria-expanded={showAdvancedFilters}
              aria-controls="advancedFilters"
              onClick={() => {
                setShowAdvancedFilters(prev => !prev);
                setOpenFilterMenu(null);
              }}
            >
              Filters{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ''}
            </button>
            <button className="btn btn-secondary" onClick={() => {
              Cookies.remove('searchTerm');
              Cookies.remove('sortOption');
              Cookies.remove('sortField');
              Cookies.remove('sortDirection');
              Cookies.remove('itemsPerPage');
              Cookies.remove('showInServiceOnly');
              Cookies.remove('statusFilter');
              Cookies.remove('brandFilter');
              Cookies.remove('modelFilter');
              Cookies.remove('locationFilter');
              Cookies.remove('siteFilter');
              location.reload();
            }}>Reset Filters</button>
          </div>
          <div
            id="advancedFilters"
            className={`col-12 ${showAdvancedFilters ? 'overflow-visible' : 'overflow-hidden'}`}
            aria-hidden={!showAdvancedFilters}
            style={{
              maxHeight: showAdvancedFilters ? '32rem' : '0',
              opacity: showAdvancedFilters ? 1 : 0,
              transition: 'max-height 220ms ease, opacity 180ms ease',
            }}
          >
              <div
                ref={advancedFiltersRef}
                className="border rounded p-3"
                style={{ backgroundColor: 'var(--bs-table-striped-bg, rgba(var(--bs-emphasis-color-rgb), 0.05))' }}
              >
                <div className="row g-3">
                  <div className="col-12 col-md-3">
                    <label htmlFor="statusFilter" className="form-label">Status</label>
                    <div className="dropdown">
                      <button
                        className={`btn ${statusFilter ? 'btn-primary' : 'btn-secondary'} dropdown-toggle w-100 d-flex align-items-center justify-content-between text-start`}
                        id="statusFilter"
                        type="button"
                        aria-expanded={openFilterMenu === 'status'}
                        onClick={() => toggleFilterMenu('status')}
                      >
                        {statusFilterLabel}
                      </button>
                      <ul className={`dropdown-menu w-100${openFilterMenu === 'status' ? ' show' : ''}`}>
                        <li>
                          <button className="dropdown-item" type="button" onClick={() => {
                            setStatusFilter('');
                            setOpenFilterMenu(null);
                          }}>
                            All
                          </button>
                        </li>
                        {statusFilterOptions.map(option => (
                          <li key={option.value}>
                            <button className="dropdown-item" type="button" onClick={() => {
                              setStatusFilter(option.value);
                              setOpenFilterMenu(null);
                            }}>
                              {option.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <label htmlFor="brandFilter" className="form-label">Brand</label>
                    <div className="dropdown">
                      <button
                        className={`btn ${brandFilter ? 'btn-primary' : 'btn-secondary'} dropdown-toggle w-100 d-flex align-items-center justify-content-between text-start`}
                        id="brandFilter"
                        type="button"
                        aria-expanded={openFilterMenu === 'brand'}
                        onClick={() => toggleFilterMenu('brand')}
                      >
                        {brandFilter || 'All'}
                      </button>
                      <ul className={`dropdown-menu w-100${openFilterMenu === 'brand' ? ' show' : ''}`}>
                        <li>
                          <button className="dropdown-item" type="button" onClick={() => {
                            setBrandFilter('');
                            setOpenFilterMenu(null);
                          }}>
                            All
                          </button>
                        </li>
                        {brandOptions.map(brand => (
                          <li key={brand}>
                            <button className="dropdown-item" type="button" onClick={() => {
                              setBrandFilter(brand);
                              setOpenFilterMenu(null);
                            }}>
                              {brand}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <label htmlFor="modelFilter" className="form-label">Model</label>
                    <div className="dropdown">
                      <button
                        className={`btn ${modelFilter ? 'btn-primary' : 'btn-secondary'} dropdown-toggle w-100 d-flex align-items-center justify-content-between text-start`}
                        id="modelFilter"
                        type="button"
                        aria-expanded={openFilterMenu === 'model'}
                        onClick={() => toggleFilterMenu('model')}
                      >
                        {modelFilter || 'All'}
                      </button>
                      <ul className={`dropdown-menu w-100${openFilterMenu === 'model' ? ' show' : ''}`}>
                        <li>
                          <button className="dropdown-item" type="button" onClick={() => {
                            setModelFilter('');
                            setOpenFilterMenu(null);
                          }}>
                            All
                          </button>
                        </li>
                        {modelOptions.map(model => (
                          <li key={model}>
                            <button className="dropdown-item" type="button" onClick={() => {
                              setModelFilter(model);
                              setOpenFilterMenu(null);
                            }}>
                              {model}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <label htmlFor="siteFilter" className="form-label">Site</label>
                    <div className="dropdown">
                      <button
                        className={`btn ${siteFilter ? 'btn-primary' : 'btn-secondary'} dropdown-toggle w-100 d-flex align-items-center justify-content-between text-start`}
                        id="siteFilter"
                        type="button"
                        aria-expanded={openFilterMenu === 'site'}
                        onClick={() => toggleFilterMenu('site')}
                      >
                        {siteFilter || 'All'}
                      </button>
                      <ul className={`dropdown-menu w-100${openFilterMenu === 'site' ? ' show' : ''}`}>
                        <li>
                          <button className="dropdown-item" type="button" onClick={() => {
                            setSiteFilter('');
                            setOpenFilterMenu(null);
                          }}>
                            All
                          </button>
                        </li>
                        {siteOptions.map(site => (
                          <li key={site}>
                            <button className="dropdown-item" type="button" onClick={() => {
                              setSiteFilter(site);
                              setOpenFilterMenu(null);
                            }}>
                              {site}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        <div className="d-flex justify-content-between align-items-center my-2 px-2">
          {sortedAssets.length > 0 && (
            <p className="text-muted my-auto">
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
                  <th role="button" onClick={() => handleColumnSort('Site')}>
                    Site {sortField === 'Site' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th role="button" onClick={() => handleColumnSort('Description')}>
                    Description {sortField === 'Description' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedAssets.map(asset => (
                  <tr
                    key={asset._id}
                    className="assetRow"
                    onClick={(event) => handleAssetRowClick(event, asset._id)}
                    onAuxClick={(event) => handleAssetRowClick(event, asset._id)}
                  >
                    <td className="statusContainer">{statusIcon(asset.Status)}</td>
                    <td>
                      <Link href={`/${asset._id}`}>{asset._id}</Link>
                    </td>
                    <td>{asset.Brand}</td>
                    <td>{asset.Model}</td>
                    <td>{asset.Site}</td>
                    <td dangerouslySetInnerHTML={{ __html: md.renderInline(asset.Description) }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h3 className="text-center text-muted">No results found.</h3>
        )}

        {(endIndex - startIndex) > 24 && (
          <div className="d-flex justify-content-between align-items-center my-2 px-2">
            {sortedAssets.length > 0 && (
              <p className="text-muted my-auto">
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
          </div>)}

      </main>
    </>
  );
}
