import { contentfulClient } from './../../lib/contentful';
import type { APIRoute } from 'astro';
import { generateImage } from '../../lib/generateImage';
import { OgImage } from '../../components/core/OgImage/OgImage';
import type { Asset } from 'contentful';
import { random } from 'radash';

export type generateUrlOptions = Record<string, any> & {
  title: string;
};

export interface ApiOgImage {
  userInfo: string;
  image: Asset;
}

export type ApiOgImageToRender = Omit<ApiOgImage, 'img'> & {
  img: string;
};

const apiOgImageEntries = await contentfulClient.getEntries<ApiOgImage>({
  content_type: 'apiOgImages'
});

const ogImages: Array<ApiOgImageToRender> = apiOgImageEntries.items.map(
  (i) => ({ userInfo: i.fields.userInfo, img: i.fields.image.fields.file.url })
);

export const get: APIRoute = async ({ url }) => {
  const debug = Boolean(url.searchParams.get('debug'));
  const rawWidth = url.searchParams.get('w');
  const width = rawWidth ? parseInt(rawWidth) : 1200;
  const rawHeight = url.searchParams.get('h');
  const height = rawHeight ? parseInt(rawHeight) : 630;

  const args = Object.fromEntries(url.searchParams);
  const props = {
    url,
    ogImages,
    ...args
  };

  const imageOptions = { width, height, debug };
  const buffer = await generateImage(OgImage, props, imageOptions);

  return new Response(buffer, {
    status: 200,
    headers: {
      'Cache-Control': 'max-age=31536000, immutable',
      'Content-Type': 'image/png'
    }
  });
};
