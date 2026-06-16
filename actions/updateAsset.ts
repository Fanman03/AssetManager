'use server';

import { MongoClient } from 'mongodb';

type Asset = {
    _id: string;
    [key: string]: any;
};


const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function updateAsset(
    id: string,
    data: Partial<any>,
    removedKeys: string[] = []
) {
    await client.connect();
    const db = client.db('asset-db');

    const assets = db.collection<Asset>('assets');
    const existingAsset = await assets.findOne({ _id: id });

    if (!existingAsset) {
        throw new Error('No asset updated');
    }

    const replacement: Asset = {
        ...existingAsset,
        ...data,
        _id: id,
    };

    for (const key of removedKeys) {
        delete replacement[key];
    }

    const result = await assets.replaceOne({ _id: id }, replacement);

    if (result.matchedCount === 0) {
        throw new Error('No asset updated');
    }
}
