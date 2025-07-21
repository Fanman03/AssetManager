'use server';

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function updateAsset(id: string, data: Partial<any>) {
    await client.connect();
    const db = client.db('asset-db');

    const result = await db.collection<{ _id: string }>('assets').updateOne(
        { _id: id },
        { $set: data }
    );


    if (result.modifiedCount === 0) {
        throw new Error('No asset updated');
    }
}
