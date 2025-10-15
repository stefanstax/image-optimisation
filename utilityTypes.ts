export interface AspectRatio {
  name: string;
  value: number | null; // The calculated aspect ratio for the preview
  width?: number; // The target output width in pixels
  height?: number; // The target output height in pixels
  className: string;
  qualityKey: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ImageText {
  altText: string;
  title: string;
}

export type ImageFit = "cover" | "contain";

export type PaddingSize = "none" | "small" | "medium" | "large";
