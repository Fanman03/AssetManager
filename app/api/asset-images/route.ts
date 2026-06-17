import {
  ASSET_IMAGE_EXTENSION,
  ASSET_IMAGE_REPO_BRANCH,
  ASSET_IMAGE_REPO_NAME,
  ASSET_IMAGE_REPO_OWNER,
  toAssetImageOption,
} from '@/lib/assetImages';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type GitHubTreeItem = {
  path: string;
  type: string;
};

type GitHubTreeResponse = {
  tree?: GitHubTreeItem[];
};

export async function GET() {
  const treeUrl = `https://api.github.com/repos/${ASSET_IMAGE_REPO_OWNER}/${ASSET_IMAGE_REPO_NAME}/git/trees/${ASSET_IMAGE_REPO_BRANCH}?recursive=1`;

  try {
    const response = await fetch(treeUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'AssetManager image picker',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { images: [], error: 'Unable to load asset images' },
        { status: response.status }
      );
    }

    const data = (await response.json()) as GitHubTreeResponse;
    const images = (data.tree || [])
      .filter(
        (item) =>
          item.type === 'blob' &&
          item.path.toLowerCase().endsWith(ASSET_IMAGE_EXTENSION)
      )
      .map((item) => toAssetImageOption(item.path))
      .sort((a, b) => a.path.localeCompare(b.path));

    return NextResponse.json(
      { images },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { images: [], error: 'Unable to load asset images' },
      { status: 502 }
    );
  }
}
