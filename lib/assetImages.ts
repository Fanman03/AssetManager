export const ASSET_IMAGE_REPO_OWNER = 'Fanman03';
export const ASSET_IMAGE_REPO_NAME = 'asset-images';
export const ASSET_IMAGE_REPO_BRANCH = 'master';
export const ASSET_IMAGE_EXTENSION = '.png';
export const ASSET_IMAGE_REPO_URL = `https://github.com/${ASSET_IMAGE_REPO_OWNER}/${ASSET_IMAGE_REPO_NAME}`;

export type AssetImageOption = {
  path: string;
  name: string;
  brand: string;
  url: string;
};

export function getAssetImageRawUrl(path: string) {
  const safePath = path
    .replace(/\\/g, '/')
    .replace(/\.png$/i, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://raw.githubusercontent.com/${ASSET_IMAGE_REPO_OWNER}/${ASSET_IMAGE_REPO_NAME}/${ASSET_IMAGE_REPO_BRANCH}/${safePath}${ASSET_IMAGE_EXTENSION}`;
}

export function toAssetImageOption(repoPath: string): AssetImageOption {
  const path = repoPath.replace(/\\/g, '/').replace(/\.png$/i, '');
  const parts = path.split('/');
  const name = parts.at(-1) || path;
  const brand = parts.length > 1 ? parts.slice(0, -1).join('/') : '';

  return {
    path,
    name,
    brand,
    url: getAssetImageRawUrl(path),
  };
}
