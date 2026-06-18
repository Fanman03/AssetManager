'use server';

import { saveSite } from '@/lib/db';
import type { Site } from '@/types/site';

export async function updateSite(originalId: string, data: Partial<Site>): Promise<Site> {
  return saveSite(originalId, data);
}
