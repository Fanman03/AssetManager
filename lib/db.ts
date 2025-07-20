import { MongoClient, WithId, Document } from 'mongodb';
import type { Asset } from '@/types/asset';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

let dbPromise = client.connect().then(client => client.db('asset-db'));

export async function getAllAssets(): Promise<Asset[]> {
  const db = await dbPromise;
  // Tell TypeScript the collection's documents have _id as string (Asset)
  const docs: WithId<Asset>[] = await db.collection<Asset>('assets').find({}).toArray();

  return docs.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
  })) as Asset[];
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const db = await dbPromise;

  // Query _id as a string directly
  const doc = await db.collection<Asset>('assets').findOne({ _id: id });

  if (!doc) return null;

  return {
    ...doc,
    _id: doc._id.toString(),
  } as Asset;
}
