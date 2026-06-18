import { MongoClient, WithId, Db } from 'mongodb';
import type { Asset } from '@/types/asset';
import type { Site } from '@/types/site';
import { makeSiteId } from '@/lib/siteUtils';
import fs from 'node:fs/promises';
import path from 'node:path';

export type DbStatus = 'connected' | 'demo' | 'error';

const uri = process.env.MONGODB_URI!;
const isDemoMode = process.env.DEMO_MODE === 'true';

const fallbackDummyAssets: Asset[] = [
  {
    _id: 'ERROR',
    Status: 0,
    Purchase_Date: 1,
    Brand: 'Database',
    Model: 'Connection Failed',
    Description: 'Make sure the MONGODB_URI environment variable is set properly.'
  }
];

// module-level singletons (cached across route calls in production)
let client: MongoClient | null = null;
let dbPromise: Promise<Db | null> | null = null;
let cachedDemoAssets: Asset[] | null = null;
let lastError: unknown = null;
let currentStatus: DbStatus = 'error';

// helpers

async function loadDemoAssetsFromFile(): Promise<Asset[]> {
  if (cachedDemoAssets) return cachedDemoAssets;

  const file = path.join(process.cwd(), 'data', 'demo-assets.json');
  const json = await fs.readFile(file, 'utf8');
  cachedDemoAssets = JSON.parse(json) as Asset[];
  return cachedDemoAssets;
}

function fallbackToMemory(message: string) {
  console.warn(`[DB Warning] ${message} Falling back to in-memory data (DEMO_MODE=${isDemoMode}).`);
  currentStatus = isDemoMode ? 'demo' : 'error';
}

export function getDatabaseStatus(): { status: DbStatus; demoMode: boolean; lastError?: string } {
  return {
    status: currentStatus,
    demoMode: isDemoMode,
    lastError: lastError instanceof Error ? lastError.message : undefined
  };
}

function normalizeSiteForStorage(site: Partial<Site>): Site | null {
  const name = String(site.name ?? site._id ?? '').trim();
  if (!name) return null;

  const now = Math.floor(Date.now() / 1000);
  const aliases = Array.from(
    new Set([...(site.aliases ?? []), name].map(alias => String(alias).trim()).filter(Boolean))
  );

  return {
    ...site,
    _id: makeSiteId(name),
    name,
    aliases,
    createdAt: site.createdAt ?? now,
    updatedAt: now,
  } as Site;
}

// connection

export async function connectToDb(): Promise<Db | null> {
  if (!uri) {
    fallbackToMemory('MONGODB_URI missing.');
    return null;
  }

  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      client = new MongoClient(uri);
      const conn = await client.connect();
      const db = conn.db('asset-db');
      currentStatus = 'connected';

      // seed if empty
      const count = await db.collection<Asset>('assets').countDocuments();
      if (count === 0) {
        const seed = await loadDemoAssetsFromFile();
        await db.collection<Asset>('assets').insertMany(seed);
        console.log('[DB Init] Seeded initial dummy asset data from /data/demo-assets.json');
      }

      return db;
    } catch (err) {
      lastError = err;
      console.error(err);
      fallbackToMemory('Unable to connect to MongoDB.');
      return null;
    }
  })();

  return dbPromise;
}

// in-memory fallbacks

async function getDummyAssets(): Promise<Asset[]> {
  if (isDemoMode) {
    return loadDemoAssetsFromFile();
  }
  return fallbackDummyAssets;
}

// API methods

export async function getAllAssets(): Promise<Asset[]> {
  const db = await connectToDb();
  if (!db) return await getDummyAssets();

  try {
    const docs: WithId<Asset>[] = await db.collection<Asset>('assets').find({}).toArray();
    return docs.map(doc => ({ ...doc, _id: doc._id.toString() })) as Asset[];
  } catch (err) {
    lastError = err;
    fallbackToMemory('Error fetching assets.');
    return await getDummyAssets();
  }
}

export async function getAssetsBySiteId(siteId: string): Promise<Asset[]> {
  const normalizedSiteId = makeSiteId(siteId);
  const site = await getSiteById(normalizedSiteId);
  const matchingSiteIds = new Set([
    normalizedSiteId,
    ...(site ? [site.name, ...(site.aliases ?? [])].map(makeSiteId) : []),
  ]);
  const assets = await getAllAssets();

  return assets.filter(asset => {
    const siteName = String(asset.Site ?? '').trim();
    return siteName && matchingSiteIds.has(makeSiteId(siteName));
  });
}

export async function getAllSites(): Promise<Site[]> {
  const db = await connectToDb();
  if (!db) return [];

  try {
    const docs: WithId<Site>[] = await db.collection<Site>('sites').find({}).sort({ name: 1 }).toArray();
    return docs.map(doc => ({ ...doc, _id: doc._id.toString() })) as Site[];
  } catch (err) {
    lastError = err;
    fallbackToMemory('Error fetching sites.');
    return [];
  }
}

export async function getSiteById(siteId: string): Promise<Site | null> {
  const db = await connectToDb();
  if (!db) return null;

  try {
    const id = makeSiteId(siteId);
    const doc = await db.collection<Site>('sites').findOne({ _id: id });
    if (!doc) return null;
    return { ...doc, _id: doc._id.toString() } as Site;
  } catch (err) {
    lastError = err;
    fallbackToMemory('Error fetching site by ID.');
    return null;
  }
}

export async function saveSite(originalId: string, data: Partial<Site>): Promise<Site> {
  const site = normalizeSiteForStorage(data);
  if (!site) throw new Error('Site name is required');

  const db = await connectToDb();
  if (!db) {
    fallbackToMemory('Site update unsupported in fallback mode.');
    return site;
  }

  try {
    const col = db.collection<Site>('sites');
    const normalizedOriginalId = makeSiteId(originalId);
    const existingOriginal = normalizedOriginalId ? await col.findOne({ _id: normalizedOriginalId }) : null;
    const aliases = Array.from(
      new Set([
        ...(site.aliases ?? []),
        ...(existingOriginal?.aliases ?? []),
        existingOriginal?.name,
        site.name,
      ].map(alias => String(alias ?? '').trim()).filter(Boolean))
    );
    site.aliases = aliases;

    if (normalizedOriginalId && normalizedOriginalId !== site._id) {
      await col.deleteOne({ _id: normalizedOriginalId });
    }

    const existing = await col.findOne({ _id: site._id });
    const result = await col.replaceOne(
      { _id: site._id },
      {
        ...existing,
        ...site,
        createdAt: existing?.createdAt ?? existingOriginal?.createdAt ?? site.createdAt,
        updatedAt: Math.floor(Date.now() / 1000),
      },
      { upsert: true }
    );

    if (!result.acknowledged) throw new Error('Failed to save site');
    return {
      ...site,
      createdAt: existing?.createdAt ?? existingOriginal?.createdAt ?? site.createdAt,
      updatedAt: Math.floor(Date.now() / 1000),
    };
  } catch (err) {
    lastError = err;
    fallbackToMemory('Error saving site.');
    throw err;
  }
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const db = await connectToDb();
  if (!db) {
    const assets = await getDummyAssets();
    return assets.find(a => a._id === id) || null;
  }

  try {
    const doc = await db.collection<Asset>('assets').findOne({ _id: id });
    if (!doc) return null;
    return { ...doc, _id: doc._id.toString() } as Asset;
  } catch (err) {
    lastError = err;
    fallbackToMemory('Error fetching asset by ID.');
    const assets = await getDummyAssets();
    return assets.find(a => a._id === id) || null;
  }
}

export async function deleteAssetById(id: string): Promise<boolean> {
  const db = await connectToDb();
  if (!db) {
    fallbackToMemory('Deletion unsupported in fallback mode.');
    return false;
  }

  try {
    const result = await db.collection<Asset>('assets').deleteOne({ _id: id });
    return result.deletedCount === 1;
  } catch (err) {
    lastError = err;
    fallbackToMemory('Error deleting asset.');
    return false;
  }
}

export async function insertAsset(data: Asset): Promise<Asset> {
  if (!data._id) throw new Error('Asset _id is required');

  const db = await connectToDb();
  if (!db) {
    fallbackToMemory('Insert unsupported in fallback mode.');
    const assets = await getDummyAssets();
    assets.push(data);
    return data;
  }

  try {
    const result = await db.collection<Asset>('assets').insertOne(data);
    if (!result.acknowledged) throw new Error('Failed to insert asset');
    return data;
  } catch (err) {
    lastError = err;
    fallbackToMemory('Error inserting asset.');
    return data;
  }
}

// export the entire DB as JSON
export async function exportAllAssets(): Promise<Asset[]> {
  return getAllAssets();
}

// import many assets from JSON
export async function importAssetsFromJson(assets: Asset[], overwrite = false): Promise<{
  inserted: number;
  replaced: number;
}> {
  const db = await connectToDb();
  if (!db) {
    fallbackToMemory('Bulk import unsupported in fallback mode.');
    return { inserted: 0, replaced: 0 };
  }

  const col = db.collection<Asset>('assets');

  if (overwrite) {
    const { deletedCount } = await col.deleteMany({});
    console.log(`[DB Import] Cleared ${deletedCount} assets.`);
  }

  // Upsert by _id
  let inserted = 0;
  let replaced = 0;

  for (const asset of assets) {
    if (!asset._id) {
      console.warn('[DB Import] Skipped asset without _id');
      continue;
    }

    const res = await col.replaceOne({ _id: asset._id }, asset, { upsert: true });
    if (res.upsertedId) inserted += 1;
    else replaced += res.modifiedCount;
  }

  return { inserted, replaced };
}

export async function importSitesFromJson(sites: Partial<Site>[], overwrite = false): Promise<{
  inserted: number;
  replaced: number;
}> {
  const db = await connectToDb();
  if (!db) {
    fallbackToMemory('Site import unsupported in fallback mode.');
    return { inserted: 0, replaced: 0 };
  }

  const col = db.collection<Site>('sites');

  if (overwrite) {
    const { deletedCount } = await col.deleteMany({});
    console.log(`[Site Import] Cleared ${deletedCount} sites.`);
  }

  let inserted = 0;
  let replaced = 0;

  for (const siteData of sites) {
    const site = normalizeSiteForStorage(siteData);
    if (!site) {
      console.warn('[Site Import] Skipped site without name');
      continue;
    }

    const res = await col.replaceOne({ _id: site._id }, site, { upsert: true });
    if (res.upsertedId) inserted += 1;
    else replaced += res.modifiedCount;
  }

  return { inserted, replaced };
}
