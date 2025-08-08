import { getAssetById } from '@/lib/db';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import AssetDeleteButton from '@/components/AssetDeleteButton';
import AssetCloneButton from '@/components/AssetCloneButton';
import SafeAssetImage from '@/components/SafeAssetImage';
import markdownit from 'markdown-it';
import { TYPE_FALLBACKS, TYPE_ALIASES, GENERIC_FALLBACK } from '@/lib/imageConstants';

const StatusMap: Record<number, { icon: string; className: string; label: string }> = {
  0: { icon: 'check-circle-fill', className: 'text-info', label: 'Spare' },
  1: { icon: 'check-circle-fill', className: 'text-success', label: 'Active' },
  2: { icon: 'clock-fill', className: 'text-warning', label: 'Retired' },
  3: { icon: 'currency-exchange', className: 'text-warning', label: 'Sold' },
  4: { icon: 'question-circle-fill', className: 'text-danger', label: 'Lost' },
  5: { icon: 'exclamation-circle-fill', className: 'text-danger', label: 'Stolen' },
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


  const { _id, Brand, Model, Status, Purchase_Date, Image, Description, ...rest } = asset;


  // Fix for backslashes in Image (replace \ with /)
  const safeImage = typeof Image === 'string' ? Image.replace(/\\/g, '/') : null;

  const imageUrl = safeImage
    ? `https://raw.githubusercontent.com/Fanman03/asset-images/master/${safeImage}.png`
    : null;

  return (
    <>
      <Navbar variant='backBtn' />
      <main className="container mt-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1><span className="me-2">{statusIcon(Status)}</span><span className="me-2 statusText">{statusText(Status)}</span></h1>
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
          </div>

          <div style={{ maxWidth: '200px' }}>
            <SafeAssetImage
              src={imageUrl}
              type={asset.Type} // <— the key that decides the type-specific fallback
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

                    // Special Dell support link for Serial/Serial_Number
                    const keyLower = key.toLowerCase();
                    const isSerialKey = keyLower === 'serial' || keyLower === 'serial_number';

                    if (Brand?.toLowerCase() === 'dell' && isSerialKey && strVal) {
                      const dellUrl = `https://www.dell.com/support/home/en-us/product-support/servicetag/${strVal}/overview`;
                      return <a href={dellUrl} target="_blank" rel="noopener noreferrer">{strVal}</a>;
                    }

                    // Default rendering
                    return strVal;
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

function resolveFallbackImageUrl(src: string | null | undefined, type: string | null | undefined): string {
  const candidates: string[] = [];

  if (src) {
    candidates.push(src);
  }

  if (type) {
    const t = type.toLowerCase().trim();
    const canonical = TYPE_ALIASES[t] || t;
    if (TYPE_FALLBACKS[canonical]) {
      candidates.push(TYPE_FALLBACKS[canonical]);
    }
  }

  candidates.push(GENERIC_FALLBACK);
  return `https://your-domain.com${candidates[0]}`; // Use first viable candidate
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    return {
      title: 'Asset Not Found',
      description: 'This asset does not exist or has been removed.',
      openGraph: {
        title: 'Asset Not Found',
        description: 'This asset does not exist or has been removed.',
        images: ['https://your-domain.com/img/opengraph.png'],
      },
    };
  }

  const { Brand, Model, Image, Description, Type } = asset;

  const safeImage = typeof Image === 'string' ? Image.replace(/\\/g, '/') : null;
  const hostedImageUrl = safeImage
    ? `https://raw.githubusercontent.com/Fanman03/asset-images/master/${safeImage}.png`
    : null;

  const imageUrl = resolveFallbackImageUrl(hostedImageUrl, Type);

  return {
    title: `${id} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
    description: Description || `${Brand} ${Model} asset detail page`,
    openGraph: {
      title: `${id} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
      description: `${Brand} ${Model} - Description ${Description}`,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_BASE_DOMAIN}/${id}`,
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: `${Brand} ${Model}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${id} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
      description: `${Brand} ${Model} - Description ${Description}`,
      images: [imageUrl],
    },
  };
}