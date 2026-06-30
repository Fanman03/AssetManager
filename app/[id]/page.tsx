import { getAssetById } from '@/lib/db';
import { makeSiteId } from '@/lib/siteUtils';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import AssetDeleteButton from '@/components/AssetDeleteButton';
import AssetCloneButton from '@/components/AssetCloneButton';
import markdownit from 'markdown-it';
import type { ReactNode } from 'react';

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
  if (status === undefined) {
    return <i className="bi bi-question-circle-fill text-secondary" title="Unknown" />;
  }

  const data = StatusMap[status] || {
    icon: 'bug-fill',
    className: 'text-danger',
    label: 'Error',
  };

  return <i className={`bi bi-${data.icon} ${data.className}`} title={data.label} />;
};

const statusText = (status?: number) => {
  if (status === undefined) {
    return "Unknown";
  }

  const data = StatusMap[status] || {
    icon: 'bug-fill',
    className: 'text-danger',
    label: 'Error',
  };

  return data.label;
};

const markdownLinkPattern = /\[([^\]\n]+)\]\(([^\s)]+)\)/g;

const isSafeLinkHref = (href: string) => {
  return (
    href.startsWith('/') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  );
};

const renderMarkdownLinks = (value: string): ReactNode => {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(markdownLinkPattern)) {
    const [fullMatch, label, href] = match;
    const index = match.index ?? 0;

    if (!isSafeLinkHref(href)) continue;

    if (index > lastIndex) {
      parts.push(value.slice(lastIndex, index));
    }

    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    parts.push(
      <a
        href={href}
        key={`${href}-${index}`}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {label}
      </a>
    );
    lastIndex = index + fullMatch.length;
  }

  if (lastIndex === 0) {
    return value;
  }

  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex));
  }

  return parts;
};

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);
  const md = markdownit()

  if (!asset) {
    return (
      <>
        <Navbar variant='backBtn' />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="card p-4 text-center" style={{ maxWidth: '400px' }}>
            <h1 className="display-4">404</h1>
            <h3 className="mb-3">Asset Not Found</h3>
            <p className="text-muted">The asset you're looking for doesn't exist or has been removed.</p>
            <a href="/" className="btn btn-primary mt-2">Back to Asset List</a>
          </div>
        </div>
      </>
    );
  }


  const { _id, Brand, Model, Status, Purchase_Date, Image, Description, Site, Location, ...rest } = asset;

  const imgSrc = `${process.env.NEXT_PUBLIC_BASE_DOMAIN}/thumb/${_id}`;

  return (
    <>
      <Navbar variant='backBtn' />
      <main className="container mt-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="d-flex align-items-center"><span className="me-2">{statusIcon(Status)}</span><span className="me-2 statusText">{statusText(Status)}</span></h1>
            <h1 className="assetTitle">
              <span className='assetTag'>{_id}</span><span className="assetSeperator">-</span>{Brand} {Model}
            </h1>

            {Description && (
              <p>
                <strong>Description:</strong>{' '}<br />
                <span dangerouslySetInnerHTML={{ __html: md.renderInline(Description) }} />
              </p>
            )}
            {Purchase_Date && (
              <p>
                <strong>Purchase Date:</strong>{' '}
                {format(new Date(Purchase_Date * 1000), 'MMMM d, yyyy')}
              </p>
            )}
            {Site && (
              <p>
                <strong>Site:</strong>{' '}
                <a href={`/site/${makeSiteId(Site)}`}>{Site}</a>
              </p>
            )}
            {Location && (
              <p>
                <strong>Location:</strong>{' '}
                <span>{Location}</span>
              </p>
            )}
          </div>

          <div style={{ maxWidth: '200px' }}>
            <img
              src={imgSrc}
              alt={`${Brand} ${Model}`}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
        <p>
          <a className="btn btn-primary m-2 assetControlBtn" href={`/i/${asset._id}`}>
            <i className="bi bi-upc-scan me-2"></i>
            View Barcode
          </a>
          <a className="btn btn-warning m-2 assetControlBtn" href={`/edit/${asset._id}`}>
            <i className="bi bi-pencil me-2"></i>
            Edit Asset
          </a>
          <AssetDeleteButton assetId={_id} />
          <AssetCloneButton assetId={_id} />
        </p>

        <hr />
        <h4>Asset Properties</h4>
        <table className="table table-striped">
          <tbody>
            {Object.entries(rest).map(([key, value]) => (
              <tr key={key}>
                <th>{key.replaceAll('_', ' ')}</th>
                <td>
                  {(() => {
                    const strVal = value?.toString?.() || '';

                    // Link to another asset if value starts with $
                    if (strVal.startsWith('$')) {
                      const targetId = strVal.slice(1);
                      return <a href={`/${targetId}`}>{targetId}</a>;
                    }

                    // Special formatting helpers
                    const keyLower = key.toLowerCase();
                    const isSerialKey = keyLower === 'serial' || keyLower === 'serial_number' || keyLower === 'serial number' || keyLower === 'service_tag' || keyLower === 's/n' || keyLower === 's/t' || keyLower === 'sn' || keyLower === 'st';
                    const isMacId = keyLower === 'mac' || keyLower === 'mac id' || keyLower === 'mac address' || keyLower === 'mac addr' || keyLower === 'hfc mac'

                    const brandLower = Brand?.toLowerCase();
                    const encodedSerial = encodeURIComponent(strVal);

                    // Special Dell support link for Serial/Serial_Number/Service_Tag
                    if (brandLower === 'dell' && isSerialKey && strVal) {
                      const dellUrl = `https://www.dell.com/support/home/en-us/product-support/servicetag/${encodedSerial}/overview`;
                      return <a href={dellUrl} target="_blank" rel="noopener noreferrer">{strVal}</a>;
                    }

                    // Special Apple support link for Serial/Serial_Number/Service_Tag
                    if (brandLower === 'apple' && isSerialKey && strVal) {
                      const appleUrl = `https://checkcoverage.apple.com/?sn=${encodedSerial}`;
                      return <a href={appleUrl} target="_blank" rel="noopener noreferrer">{strVal}</a>;
                    }

                    // Special HP support link for Serial/Serial_Number/Service_Tag
                    if ((brandLower === 'hp' || brandLower === 'hewlett-packard') && isSerialKey && strVal) {
                      const hpUrl = `https://partsurfer.hp.com/?searchtext=${encodedSerial}`;
                      return <a href={hpUrl} target="_blank" rel="noopener noreferrer">{strVal}</a>;
                    }

                    // Make MAC IDs uppercase
                    if (isMacId) {
                      return strVal.toUpperCase();
                    }

                    // Default rendering
                    return renderMarkdownLinks(strVal);
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    return {
      title: 'Asset Not Found',
      description: 'This asset does not exist or has been removed.',
      openGraph: {
        siteName: process.env.NEXT_PUBLIC_APP_NAME,
        title: 'Asset Not Found',
        description: 'This asset does not exist or has been removed.',
        images: [`${process.env.NEXT_PUBLIC_BASE_DOMAIN}/img/opengraph.png`],
      },
    };
  }

  const { Brand, Model, Image, Description, Type } = asset;

  return {
    title: `${id} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
    description: Description || `${Brand} ${Model} asset detail page`,
    openGraph: {
      siteName: process.env.NEXT_PUBLIC_APP_NAME,
      title: `${id}`,
      description: `${Brand} ${Model} - ${Description}`,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_BASE_DOMAIN}/${id}`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_DOMAIN}/thumb/${id}`,
          width: 512,
          height: 512,
          alt: `${Brand} ${Model}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${id} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
      description: `${Brand} ${Model} - ${Description}`,
      images: `${process.env.NEXT_PUBLIC_BASE_DOMAIN}/thumb/${id}`,
    },
  };
}
