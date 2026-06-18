import Navbar from '@/components/Navbar';
import EditSiteForm from '@/components/EditSiteForm';
import { getAssetsBySiteId, getSiteById } from '@/lib/db';
import { makeSiteId } from '@/lib/siteUtils';
import type { Site } from '@/types/site';

type EditSitePageProps = {
  params: Promise<{ sitename: string }>;
};

export default async function EditSitePage({ params }: EditSitePageProps) {
  const { sitename } = await params;
  const siteId = makeSiteId(decodeURIComponent(sitename));
  const existingSite = await getSiteById(siteId);
  const assets = await getAssetsBySiteId(siteId);
  const fallbackName = assets.find(asset => asset.Site)?.Site || decodeURIComponent(sitename);
  const site: Site = existingSite ?? {
    _id: makeSiteId(fallbackName),
    name: fallbackName,
    aliases: [fallbackName],
  };

  return (
    <>
      <Navbar variant="backBtn" />
      <EditSiteForm site={site} />
    </>
  );
}

export async function generateMetadata({ params }: EditSitePageProps) {
  const { sitename } = await params;

  return {
    title: `Editing ${decodeURIComponent(sitename)} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
  };
}
