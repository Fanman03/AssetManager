import { getAssetById } from '@/lib/db';
import { format } from 'date-fns';

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

export default async function AssetPage({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) return <p>Asset not found.</p>;

  const { _id, Brand, Model, Status, Purchase_Date, Image, ...rest } = asset;

  // Fix for backslashes in Image (replace \ with /)
  const safeImage = typeof Image === 'string' ? Image.replace(/\\/g, '/') : null;

  const imageUrl = safeImage
    ? `https://raw.githubusercontent.com/Fanman03/asset-images/master/${safeImage}.png`
    : null;

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container">
          <a className="navbar-brand text-white" href="/">
            <i className="bi bi-arrow-left me-2"></i>
            <span>Back</span>
          </a>
        </div>
      </nav>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1>
              {Brand} {Model} {statusIcon(Status)}
            </h1>
            <p>
              <strong>ID:</strong> {_id}
            </p>

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
                  {typeof value === 'string' || typeof value === 'number'
                    ? value.toString()
                    : JSON.stringify(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
