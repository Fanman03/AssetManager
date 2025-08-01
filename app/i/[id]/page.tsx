import { getAssetById } from '@/lib/db';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Roboto_Mono, Roboto } from 'next/font/google';
import BarcodeCanvas from '@/components/BarcodeCanvas';
import Navbar from '@/components/Navbar';

const robotoMono = Roboto_Mono({ weight: '400', subsets: ['latin'] });
const roboto = Roboto({ weight: '400', subsets: ['latin'] });

export default async function BarcodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);
  if (!asset) notFound();

  return (
    <>
      <Navbar variant='backBtn' />
      <Script src="/js/datamatrix.js" strategy="beforeInteractive" />
      <Script src="/js/dymo.connect.framework.js" strategy="beforeInteractive" />
      <BarcodeCanvas asset={asset} />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Barcode for ${id} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
  };
}