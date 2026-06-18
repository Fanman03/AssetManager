import type { Asset, AssetPropertyOptions } from '@/types/asset';

const normalizeOption = (value: unknown) => String(value ?? '').trim();
const AUTOCOMPLETE_EXCLUDED_FIELDS = new Set(['_id', 'Description', 'Purchase_Date']);

const uniqueSortedOptions = (assets: Asset[], field: keyof Asset): string[] => {
  const options = new Set<string>();

  for (const asset of assets) {
    const value = normalizeOption(asset[field]);
    if (value) options.add(value);
  }

  return [...options].sort((a, b) => a.localeCompare(b));
};

export function getAssetPropertyOptions(assets: Asset[]): AssetPropertyOptions {
  const fields = new Set<string>(['Brand', 'Model', 'Type', 'Site']);

  for (const asset of assets) {
    for (const field of Object.keys(asset)) {
      if (!AUTOCOMPLETE_EXCLUDED_FIELDS.has(field)) {
        fields.add(field);
      }
    }
  }

  return Object.fromEntries(
    [...fields].map((field) => [field, uniqueSortedOptions(assets, field)])
  ) as AssetPropertyOptions;
}
