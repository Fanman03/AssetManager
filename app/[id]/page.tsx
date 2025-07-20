// app/asset/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAssetById } from '@/lib/db'; // custom function to fetch MongoDB data

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const asset = await getAssetById(resolvedParams.id);

  if (!asset) {
    return { title: 'Asset Not Found' };
  }

  return { title: `${asset._id} - Asset Manager` };
}

export default async function AssetPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const asset = await getAssetById(id);

  if (!asset) return notFound();

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container">
          <a className="navbar-brand text-white" href="/">
            <i className="bi bi-arrow-left me-2"></i>Asset Manager
          </a>
        </div>
      </nav>

      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="d-flex align-items-center">
            <span className="display-4 mx-3">
              <i id="icon"></i>
            </span>
            <span id="title" className="display-4 fw-normal">
              {asset.name}
            </span>
            <span className="display-4 mx-3">-</span>
            <a
              style={{ textDecoration: 'none', color: 'var(--bs-heading-color)' }}
              id="subtitle"
              className="display-4"
              target="_blank"
              href={`/${asset.barcode}`}
              data-bs-toggle="tooltip"
              title="Click to view barcode"
            >
              {asset.subtitle}
            </a>
          </h1>
          <h1 id="barcode">
            <img id="image" style={{ width: '4em' }} src={`/api/barcode/${asset.barcode}`} />
          </h1>
        </div>

        <table className="table">
          <tbody>
            {Object.entries(asset).map(([key, value]) => (
              <tr key={key}>
                <th scope="row">{key}</th>
                <td id={`v_${key}`}>{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
