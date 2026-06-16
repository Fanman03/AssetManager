import CreateAssetClientWrapper from '@/components/CreateAssetClientWrapper';
import { getAllAssets } from '@/lib/db';
import { getAssetPropertyOptions } from '@/lib/assetOptions';

export default async function CreateAssetPage() {
  const assets = await getAllAssets();
  return <CreateAssetClientWrapper propertyOptions={getAssetPropertyOptions(assets)} />;
}

export function generateMetadata() {
  return {
    title: `Create Asset - ${process.env.NEXT_PUBLIC_APP_NAME}`,
  };
}
