import { getAssetById } from '@/lib/db';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';

const statusIcon = (status?: number) => {
  if (status === undefined) {
    return <i className="bi bi-question-circle-fill text-secondary" title="Unknown" />;
  }

  const map: Record<number, { icon: string; className: string; label: string }> = {
    0: { icon: 'check-circle-fill', className: 'text-info', label: 'Spare' },
    1: { icon: 'check-circle-fill', className: 'text-success', label: 'In Service' },
    2: { icon: 'clock-fill', className: 'text-warning', label: 'Retired' },
    3: { icon: 'currency-exchange', className: 'text-warning', label: 'Sold' },
    4: { icon: 'question-circle-fill', className: 'text-danger', label: 'Lost' },
    5: { icon: 'exclamation-circle-fill', className: 'text-danger', label: 'Stolen' },
  };

  const data = map[status] || {
    icon: 'bug-fill',
    className: 'text-danger',
    label: 'Error',
  };

  return <i className={`bi bi-${data.icon} ${data.className}`} title={data.label} />;
};

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) return <p>Asset not found.</p>;

  const { _id, Brand, Model, Status, Purchase_Date, Image, Description, ...rest } = asset;

  // Fix for backslashes in Image (replace \ with /)
  const safeImage = typeof Image === 'string' ? Image.replace(/\\/g, '/') : null;

  const imageUrl = safeImage
    ? `https://raw.githubusercontent.com/Fanman03/asset-images/master/${safeImage}.png`
    : null;

  return (
    <div>
      <Navbar variant='backBtn' />
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1>
              {statusIcon(Status)} {Brand} {Model} - <span>{_id}</span>
            </h1>

            {Description && (
              <p>
                <strong>Description:</strong>{' '}<br />
                {Description}
              </p>
            )}
            {Purchase_Date && (
              <p>
                <strong>Purchase Date:</strong>{' '}
                {format(new Date(Purchase_Date * 1000), 'MMMM d, yyyy')}
              </p>
            )}
            <p>
              <a className="btn btn-primary" href={`/i/${asset._id}`}>
                View Barcode
              </a>
            </p>
          </div>

          {imageUrl && (
            <div style={{ maxWidth: '200px' }}>
              <img
                src={imageUrl}
                alt={`${Brand} ${Model}`}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}
        </div>

        <hr />
        <h4>Other Properties</h4>
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
      </div>
    </div>
  );
}
