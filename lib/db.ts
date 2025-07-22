import { MongoClient, WithId } from 'mongodb';
import type { Asset } from '@/types/asset';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

const isDemoMode = process.env.DEMO_MODE === 'true';

const demoDummyAssets: Asset[] = [
  {
    _id: 'D-00001',
    Status: 1,
    Purchase_Date: 1661196600,
    Brand: 'Dell',
    Model: 'OptiPlex 5060 MFF',
    Image: 'Dell/OptiPlex-5060M',
    Description: 'Test Asset 1',
    Location: 'Missouri Office',
    Serial_Number: 'DB2R0T2',
    CPU: 'Intel Core i5-8500T',
    RAM: '16GB DDR4-2666 (2/2)',
    Storage_1: '512GB M.2 NVMe',
    Display_1: '$M-00001'
  }, {
    _id: 'M-00001',
    Status: 1,
    Purchase_Date: 1661196600,
    Brand: 'Dell',
    Model: 'P2419H',
    Image: 'Dell/P2419h',
    Description: 'Test Asset 2',
    Location: "Missouri Office",
    Serial_Number: "8D42P33",
    Resolution: '1920x1080',
    Panel_Technology: 'IPS',
  },
  {
    _id: 'AP-00002',
    Status: 1,
    Purchase_Date: 1672556460,
    Brand: 'Ubiquiti',
    Model: 'U6-Enterprise',
    Image: 'Ubiquiti/U6Enterprise',
    Description: 'Test Asset 4',
    Location: "Missouri Office West Hallway",
    MAC_ID: "AA:BB:CC:DD:EE",
    Serial_Number: "000000000"
  },{
    _id: 'AP-00001',
    Status: 3,
    Purchase_Date: 1472556460,
    Brand: 'Ubiquiti',
    Model: 'UAP-AC-Pro',
    Image: 'Ubiquiti/U6Pro',
    Description: 'Test Asset 3',
    Location: "Missouri Office West Hallway",
    MAC_ID: "AA:BB:CC:DD:EE",
    Serial_Number: "000000000",
    Sale_Date: "January 1, 2023"
  }
];

const fallbackDummyAssets: Asset[] = [
  {
    _id: 'ERROR',
    Status: 0,
    Purchase_Date: 1,
    Brand: 'Database',
    Model: 'Connection Failed',
    Description: 'Make sure the MONGODB_URI environment variable is set properly.'
  },
];

function getDummyAssets(): Asset[] {
  return isDemoMode ? demoDummyAssets : fallbackDummyAssets;
}

function fallbackToMemory(message: string) {
  console.warn(`[DB Warning] ${message} Falling back to in-memory data (DEMO_MODE=${isDemoMode}).`);
}

let dbPromise: Promise<ReturnType<typeof client.db>> | null = null;

async function connectToDb() {
  if (dbPromise) return dbPromise;

  try {
    dbPromise = client.connect().then(client => client.db('asset-db'));
    const db = await dbPromise;

    const count = await db.collection<Asset>('assets').countDocuments();
    if (count === 0) {
      await db.collection<Asset>('assets').insertMany(demoDummyAssets);
      console.log('[DB Init] Seeded initial dummy asset data.');
    }

    return db;
  } catch (err) {
    console.log(err);
    fallbackToMemory('Unable to connect to MongoDB.');
    dbPromise = null;
    return null;
  }
}

// --- API Methods ---

export async function getAllAssets(): Promise<Asset[]> {
  const db = await connectToDb();
  if (!db) return getDummyAssets();

  try {
    const docs: WithId<Asset>[] = await db.collection<Asset>('assets').find({}).toArray();
    return docs.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
    })) as Asset[];
  } catch (err) {
    fallbackToMemory('Error fetching assets.');
    return getDummyAssets();
  }
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const db = await connectToDb();
  if (!db) return getDummyAssets().find(a => a._id === id) || null;

  try {
    const doc = await db.collection<Asset>('assets').findOne({ _id: id });
    if (!doc) return null;
    return {
      ...doc,
      _id: doc._id.toString(),
    } as Asset;
  } catch (err) {
    fallbackToMemory('Error fetching asset by ID.');
    return getDummyAssets().find(a => a._id === id) || null;
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
    fallbackToMemory('Error deleting asset.');
    return false;
  }
}

export async function insertAsset(data: Asset): Promise<Asset> {
  if (!data._id) throw new Error('Asset _id is required');

  const db = await connectToDb();
  if (!db) {
    fallbackToMemory('Insert unsupported in fallback mode.');
    getDummyAssets().push(data);
    return data;
  }

  try {
    const result = await db.collection<Asset>('assets').insertOne(data);
    if (!result.acknowledged) {
      throw new Error('Failed to insert asset');
    }
    return data;
  } catch (err) {
    fallbackToMemory('Error inserting asset.');
    return data;
  }
}
