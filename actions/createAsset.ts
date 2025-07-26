'use server';

import { insertAsset } from '@/lib/db';
import type { Asset } from '@/types/asset';

interface CreateAssetData {
    _id: string;
    Brand?: string;
    Model?: string;
    Status?: number;
    Description?: string;
    Purchase_Date?: number | null;
    Type?: string;
    [key: string]: any;
}

export async function createAsset(data: CreateAssetData): Promise<Asset> {
    if (!data._id) {
        throw new Error('Asset _id is required');
    }

    const newAsset = await insertAsset(data as Asset);

    return newAsset;
}
