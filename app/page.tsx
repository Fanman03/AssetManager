import React from 'react';
import { getAllAssets } from '@/lib/db';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ClientAssetList from '@/components/ClientAssetList';

export const dynamic = 'force-dynamic'; // Ensures fresh SSR

export default async function AssetListPage() {
  const assets = await getAllAssets(); // Server-side fetch
  return <ClientAssetList initialAssets={assets} />;
}
