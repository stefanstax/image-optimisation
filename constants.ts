import type { AspectRatio } from "./types";

export const ASPECT_RATIOS: { [key: string]: AspectRatio } = {
  original: {
    name: "Original",
    value: null,
    className: "",
    qualityKey: "default",
  },
  fullhd: {
    name: "Banner 1920x1080",
    value: 1920 / 1080,
    width: 1920,
    height: 1080,
    className: "aspect-w-16 aspect-h-9",
    qualityKey: "banner",
  },
  custom: {
    name: "Featured 1200x657",
    value: 1200 / 657,
    width: 1200,
    height: 657,
    className: "",
    qualityKey: "featured",
  },
  squareHD: {
    name: "Post 1080x1080",
    value: 1,
    width: 1080,
    height: 1080,
    className: "aspect-w-1 aspect-h-1",
    qualityKey: "postBig",
  },
  square: {
    name: "Post 600x600",
    value: 1,
    width: 600,
    height: 600,
    className: "aspect-w-1 aspect-h-1",
    qualityKey: "postRegular",
  },
  squareMini: {
    name: "Post 300x300",
    value: 1,
    width: 300,
    height: 300,
    className: " aspect-w-1 aspect-h-1",
    qualityKey: "postMini",
  },
};

export const MAX_IMAGE_SIZE_KB = 200;
