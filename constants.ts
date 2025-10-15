import type { AspectRatio } from "./types";

export const ASPECT_RATIOS: { [key: string]: AspectRatio } = {
  original: {
    name: "Original",
    value: null,
    className: "",
    qualityKey: "default",
  },
  fullhd: {
    name: "Banner",
    value: 1920 / 1080,
    width: 1920,
    height: 1080,
    className: "aspect-w-16 aspect-h-9",
    qualityKey: "banner",
  },
  custom: {
    name: "Featured Image",
    value: 1200 / 657,
    width: 1200,
    height: 657,
    className: "",
    qualityKey: "featured",
  },
  square: {
    name: "Blog Post Regular",
    value: 1,
    width: 600,
    height: 600,
    className: "aspect-w-1 aspect-h-1",
    qualityKey: "postRegular",
  },
  squareHD: {
    name: "Blog Post Big",
    value: 1,
    width: 1080,
    height: 1080,
    className: "aspect-w-1 aspect-h-1",
    qualityKey: "postBig",
  },
  /*
  igPortrait: {
    name: '1080x1350',
    value: 1080 / 1350,
    width: 1080,
    height: 1350,
    className: 'aspect-w-4 aspect-h-5'
  },
  story: {
    name: '1080x1920',
    value: 1080 / 1920,
    width: 1080,
    height: 1920,
    className: 'aspect-w-9 aspect-h-16'
  }
  */
};

export const MAX_IMAGE_SIZE_KB = 200;
