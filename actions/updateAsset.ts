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

    const updateOps: any = {
        $set: data,
    };

    if (removedKeys.length > 0) {
        updateOps.$unset = Object.fromEntries(removedKeys.map((key) => [key, ""]));
    }

    const assets = db.collection<Asset>('assets');

    const result = await assets.updateOne({ _id: id }, updateOps);

    if (result.modifiedCount === 0) {
        throw new Error('No asset updated');
    }
}
