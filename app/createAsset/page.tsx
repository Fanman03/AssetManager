import CreateAssetClientWrapper from '@/components/CreateAssetClientWrapper';

export default async function EditAssetPage(props: any) {
  return <CreateAssetClientWrapper/>;
}

export function generateMetadata() {
  return {
    title: `Create Asset - ${process.env.NEXT_PUBLIC_APP_NAME}`,
  };
}