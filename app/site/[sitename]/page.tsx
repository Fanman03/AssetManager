import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getAssetsBySiteId, getSiteById } from '@/lib/db';
import { makeSiteId } from '@/lib/siteUtils';
import type { SiteAddress } from '@/types/site';

export const dynamic = 'force-dynamic';

type SitePageProps = {
  params: Promise<{ sitename: string }>;
  searchParams?: Promise<{ groupBy?: string }>;
};

const formatAddress = (address: SiteAddress) => {
  return [
    address.line1,
    address.line2,
    [address.city, address.region, address.postalCode].filter(Boolean).join(', ').replace(', ', ' '),
    address.country,
  ].filter(Boolean);
};

const StatusMap: Record<number, { icon: string; className: string; label: string }> = {
  0: { icon: 'check-circle-fill', className: 'text-info', label: 'Spare' },
  1: { icon: 'check-circle-fill', className: 'text-success', label: 'Active' },
  2: { icon: 'clock-fill', className: 'text-warning', label: 'Retired' },
  3: { icon: 'currency-exchange', className: 'text-warning', label: 'Sold' },
  4: { icon: 'question-circle-fill', className: 'text-danger', label: 'Lost' },
  5: { icon: 'exclamation-circle-fill', className: 'text-danger', label: 'Stolen' },
  6: { icon: 'tools', className: 'text-danger', label: 'Broken' },
};

const statusIcon = (status?: number) => {
  const data = status === undefined ? null : StatusMap[status];

  if (!data) {
    return <i className="bi bi-question-circle-fill text-secondary" title="Unknown" />;
  }

  return <i className={`bi bi-${data.icon} ${data.className}`} title={data.label} />;
};

const getLocationName = (location: unknown) => String(location ?? '').trim();

export default async function SitePage({ params, searchParams }: SitePageProps) {
  const { sitename } = await params;
  const query = await searchParams;
  const isGroupedByLocation = query?.groupBy === 'location';
  const siteId = makeSiteId(decodeURIComponent(sitename));
  const site = await getSiteById(siteId);
  const assets = await getAssetsBySiteId(siteId);
  const sortedAssets = [...assets].sort((a, b) => {
    if (a.Status === b.Status) {
      return a.Brand === b.Brand
        ? a.Model.localeCompare(b.Model)
        : a.Brand.localeCompare(b.Brand);
    }
    return (a.Status ?? 99) - (b.Status ?? 99);
  });
  const fallbackName = assets.find(asset => asset.Site)?.Site || decodeURIComponent(sitename);
  const siteName = site?.name || fallbackName;
  const addressLines = site?.address ? formatAddress(site.address) : [];
  const addressUrl = addressLines.length
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(' '))}`
    : null;
  const hasSiteDetails = addressLines.length > 0 || Boolean(site?.contacts?.length) || Boolean(site?.notes);
  const groupedAssets = Array.from(
    sortedAssets.reduce((groups, asset) => {
      const location = getLocationName(asset.Location);
      const key = location || '';
      groups.set(key, [...(groups.get(key) ?? []), asset]);
      return groups;
    }, new Map<string, typeof sortedAssets>())
  ).sort(([a], [b]) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      <Navbar variant="backBtn" />
      <main className="container mt-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h1 className="display-6 fw-normal mb-1">{siteName}</h1>
            <p className="text-muted mb-0">{assets.length} asset{assets.length === 1 ? '' : 's'} at this site</p>
          </div>
        </div>

        {hasSiteDetails ? (
          <section className="row g-3 mb-4">
            {addressLines.length > 0 && (
              <div className="col-12 col-md-4">
                <h2 className="h5">
                  <i className="bi bi-map me-2"></i>
                  Address
                </h2>
                <a href={addressUrl ?? '#'} target="_blank" rel="noopener noreferrer">
                  <address className="mb-0">
                    {addressLines.map(line => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </address>
                </a>
              </div>
            )}

            {site?.contacts?.length ? (
              <div className="col-12 col-md-4">
                <h2 className="h5">Contacts</h2>
                {site.contacts.map((contact, index) => (
                  <p className="mb-2" key={`${contact.name}-${index}`}>
                    {contact.name && <strong>{contact.name}</strong>}
                    {contact.role && <span className="text-muted"> {contact.role}</span>}
                    {contact.email && (
                      <>
                        <br />
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </>
                    )}
                    {contact.phone && (
                      <>
                        <br />
                        <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                      </>
                    )}
                  </p>
                ))}
              </div>
            ) : null}

            {site?.notes && (
              <div className="col-12 col-md-4">
                <h2 className="h5">Notes</h2>
                <p>{site.notes}</p>
              </div>
            )}
          </section>
        ) : (
          <div className="alert alert-secondary" role="status">
            No site details have been added yet.
          </div>
        )}

        <p>
          <Link className="btn btn-warning m-2 assetControlBtn" href={`/site/${siteId}/edit`}>
            <i className="bi bi-pencil me-2"></i>
            Edit Site
          </Link>
          <Link
            className="btn btn-secondary m-2 assetControlBtn"
            href={isGroupedByLocation ? `/site/${siteId}` : `/site/${siteId}?groupBy=location`}
          >
            <i className={`bi ${isGroupedByLocation ? 'bi-list-ul' : 'bi-geo-alt'} me-2`}></i>
            {isGroupedByLocation ? 'Ungroup Assets' : 'Group by Location'}
          </Link>
        </p>

        {isGroupedByLocation ? (
          groupedAssets.map(([location, locationAssets]) => (
            <section className="mb-4" key={location || 'without-location'}>
              <h2 className="h5 mb-2">{location || 'No location'}</h2>
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="statusContainer"></th>
                      <th>Asset Tag</th>
                      <th>Brand</th>
                      <th>Model</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationAssets.map(asset => (
                      <tr key={asset._id}>
                        <td className="statusContainer">{statusIcon(asset.Status)}</td>
                        <td><Link href={`/${asset._id}`}>{asset._id}</Link></td>
                        <td>{asset.Brand}</td>
                        <td>{asset.Model}</td>
                        <td>{asset.Description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th className="statusContainer"></th>
                  <th>Asset Tag</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Location</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssets.map(asset => (
                  <tr key={asset._id}>
                    <td className="statusContainer">{statusIcon(asset.Status)}</td>
                    <td><Link href={`/${asset._id}`}>{asset._id}</Link></td>
                    <td>{asset.Brand}</td>
                    <td>{asset.Model}</td>
                    <td>{asset.Location}</td>
                    <td>{asset.Description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {assets.length === 0 && (
          <h2 className="h4 text-center text-muted my-5">No assets found for this site.</h2>
        )}
      </main>
    </>
  );
}

export async function generateMetadata({ params }: SitePageProps) {
  const { sitename } = await params;
  const siteId = makeSiteId(decodeURIComponent(sitename));
  const site = await getSiteById(siteId);
  const title = site?.name || decodeURIComponent(sitename);

  return {
    title: `${title} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
  };
}
