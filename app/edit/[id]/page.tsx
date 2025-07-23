import { getAssetById } from '@/lib/db';
import EditAssetClientWrapper from '@/components/EditAssetClientWrapper';

export default async function EditAssetPage(props: any) {
  const params = await props.params; // treat params as Promise<any>
  const asset = await getAssetById(params.id);
  if (!asset) return <p className="m-4">Asset not found.</p>;

  return <EditAssetClientWrapper asset={asset} />;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Editing ${id} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
  };
}