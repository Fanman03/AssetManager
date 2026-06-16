import type { Asset, AssetPropertyOptions } from '@/types/asset';

const normalizeOption = (value: unknown) => String(value ?? '').trim();

const uniqueSortedOptions = (assets: Asset[], field: keyof Asset): string[] => {
  const options = new Set<string>();

  for (const asset of assets) {
    const value = normalizeOption(asset[field]);
    if (value) options.add(value);
  }

  return [...options].sort((a, b) => a.localeCompare(b));
};

export function getAssetPropertyOptions(assets: Asset[]): AssetPropertyOptions {
  return {
    Brand: uniqueSortedOptions(assets, 'Brand'),
    Model: uniqueSortedOptions(assets, 'Model'),
    Type: uniqueSortedOptions(assets, 'Type'),
    Site: uniqueSortedOptions(assets, 'Site'),
  };
}
