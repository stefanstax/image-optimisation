import type { AspectRatio, Position, Size } from '../types';

/**
 * Processes the image: crops, resizes, converts to WebP, and compresses.
 * @param image The source HTMLImageElement.
 * @param aspectRatio The selected aspect ratio for cropping.
 * @param imagePosition The current dragged position of the image.
 * @param maxSizeKB The target maximum file size in kilobytes.
 * @param renderedSize The rendered size of the image in the editor.
 * @returns A promise that resolves with the processed image as a Blob.
 */
export async function processImage(
  image: HTMLImageElement,
  aspectRatio: AspectRatio,
  imagePosition: Position,
  maxSizeKB: number,
  renderedSize: Size
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  const imageRatio = naturalWidth / naturalHeight;

  if (renderedSize.width === 0) {
    throw new Error("Rendered image size is not available for processing.");
  }
  
  const scale = naturalWidth / renderedSize.width;
  const arValue = aspectRatio.value ?? imageRatio;

  let containerWidthInRenderedPixels: number;
  let containerHeightInRenderedPixels: number;

  // Reconstruct container size from the rendered image size, which is calculated to 'cover' the container.
  if (imageRatio > arValue) {
    // Image is wider than container, so its rendered height matches the container height.
    containerHeightInRenderedPixels = renderedSize.height;
    containerWidthInRenderedPixels = containerHeightInRenderedPixels * arValue;
  } else {
    // Image is taller or same aspect ratio, so its rendered width matches the container width.
    containerWidthInRenderedPixels = renderedSize.width;
    containerHeightInRenderedPixels = containerWidthInRenderedPixels / arValue;
  }

  // Determine the source rectangle (crop area) dimensions by scaling the container size.
  const sWidth = containerWidthInRenderedPixels * scale;
  const sHeight = containerHeightInRenderedPixels * scale;
  
  // Determine the top-left corner of the source rectangle based on the pan.
  const sx = -imagePosition.x * scale;
  const sy = -imagePosition.y * scale;

  // Set canvas size. If a specific resolution is defined, use it.
  // Otherwise, use the calculated crop dimensions (original behavior).
  canvas.width = Math.round(aspectRatio.width ?? sWidth);
  canvas.height = Math.round(aspectRatio.height ?? sHeight);
  
  // Draw the cropped and panned part of the image onto the canvas,
  // resizing it to fit the new canvas dimensions.
  ctx.drawImage(
    image,
    Math.round(sx),
    Math.round(sy),
    Math.round(sWidth),
    Math.round(sHeight),
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await compressCanvasToBlob(canvas, maxSizeKB);
  return blob;
}

/**
 * Compresses a canvas to a WebP blob, aiming for a size under a specified limit.
 * It uses a binary search approach on quality to find the optimal compression.
 * @param canvas The canvas to compress.
 * @param maxSizeKB The target maximum file size in kilobytes.
 * @returns A promise that resolves with the compressed Blob.
 */
async function compressCanvasToBlob(canvas: HTMLCanvasElement, maxSizeKB: number): Promise<Blob> {
  const MAX_SIZE_BYTES = maxSizeKB * 1024;
  
  let quality = 0.9;
  let minQuality = 0;
  let maxQuality = 1;
  let lastValidBlob: Blob | null = null;
  
  for (let i = 0; i < 7; i++) { // 7 iterations for binary search is enough for good precision
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', quality);
    });

    if (!blob) {
      throw new Error('Failed to create blob from canvas');
    }

    if (blob.size <= MAX_SIZE_BYTES) {
      lastValidBlob = blob;
      minQuality = quality;
    } else {
      maxQuality = quality;
    }
    quality = (minQuality + maxQuality) / 2;
  }

  if (lastValidBlob) {
    return lastValidBlob;
  }

  // If we never found a valid blob (even at lowest quality), return the last attempt
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create final blob"));
    }, 'image/webp', 0.1);
  });
}