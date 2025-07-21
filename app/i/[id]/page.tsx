import { getAssetById } from '@/lib/db';
import { Asset } from '@/types/asset';
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
      <main
        className={`${robotoMono.className}`}
        style={{ backgroundColor: 'white', marginTop: '3rem', marginBottom: '3rem' }}
      >
        <Script src="/js/datamatrix.js" strategy="beforeInteractive" />

        <BarcodeCanvas asset={asset} />
      </main></>
  );
}
