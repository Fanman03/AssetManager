import SettingsClientWrapper from '@/components/SettingsClientWrapper';

export default async function EditAssetPage(props: any) {
  return <SettingsClientWrapper/>;
}

export function generateMetadata() {
  return {
    title: `Settings - ${process.env.NEXT_PUBLIC_APP_NAME}`,
  };
}