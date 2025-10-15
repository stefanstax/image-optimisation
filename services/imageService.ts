import type {
  AspectRatio,
  Position,
  Size,
  ImageFit,
  PaddingSize,
} from "../types";

const PADDING_MAP: Record<PaddingSize, number> = {
  none: 0,
  small: 0.05,
  medium: 0.1,
  large: 0.15,
};

/**
 * Processes the image: crops, resizes, converts to WebP, and compresses.
 * @param image The source HTMLImageElement.
 * @param aspectRatio The selected aspect ratio for cropping.
 * @param imagePosition The current dragged position of the image.
 * @param maxSizeKB The target maximum file size in kilobytes.
 * @param renderedSize The rendered size of the image in the editor.
 * @param imageFit The image fit mode ('cover' or 'contain').
 * @param paddingSize The padding size for 'contain' mode.
 * @param backgroundColor The background color for 'contain' mode.
 * @returns A promise that resolves with the processed image as a Blob.
 */
export async function processImage(
  image: HTMLImageElement,
  aspectRatio: AspectRatio,
  imagePosition: Position,
  maxSizeKB: number,
  renderedSize: Size,
  imageFit: ImageFit,
  paddingSize: PaddingSize,
  backgroundColor: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  const imageRatio = naturalWidth / naturalHeight;

  if (imageFit === "contain") {
    const targetWidth = aspectRatio.width ?? naturalWidth;
    const targetHeight =
      aspectRatio.height ??
      (aspectRatio.value ? targetWidth / aspectRatio.value : naturalHeight);

    canvas.width = Math.round(targetWidth);
    canvas.height = Math.round(targetHeight);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = PADDING_MAP[paddingSize];
    const paddingX = canvas.width * padding;
    const paddingY = canvas.height * padding;

    const paddedWidth = canvas.width - 2 * paddingX;
    const paddedHeight = canvas.height - 2 * paddingY;
    const paddedRatio = paddedWidth / paddedHeight;

    let destWidth, destHeight;
    if (imageRatio > paddedRatio) {
      // Image is wider, fit to padded width
      destWidth = paddedWidth;
      destHeight = destWidth / imageRatio;
    } else {
      // Image is taller or same, fit to padded height
      destHeight = paddedHeight;
      destWidth = destHeight * imageRatio;
    }

    const destX = paddingX + (paddedWidth - destWidth) / 2;
    const destY = paddingY + (paddedHeight - destHeight) / 2;

    ctx.drawImage(
      image,
      0,
      0,
      naturalWidth,
      naturalHeight, // source rect is the whole image
      Math.round(destX),
      Math.round(destY),
      Math.round(destWidth),
      Math.round(destHeight) // destination rect
    );
  } else {
    // 'cover' logic
    if (renderedSize.width === 0) {
      throw new Error("Rendered image size is not available for processing.");
    }

    const scale = naturalWidth / renderedSize.width;
    const arValue = aspectRatio.value ?? imageRatio;

    let containerWidthInRenderedPixels: number;
    let containerHeightInRenderedPixels: number;

    if (imageRatio > arValue) {
      containerHeightInRenderedPixels = renderedSize.height;
      containerWidthInRenderedPixels =
        containerHeightInRenderedPixels * arValue;
    } else {
      containerWidthInRenderedPixels = renderedSize.width;
      containerHeightInRenderedPixels =
        containerWidthInRenderedPixels / arValue;
    }

    const sWidth = containerWidthInRenderedPixels * scale;
    const sHeight = containerHeightInRenderedPixels * scale;
    const sx = -imagePosition.x * scale;
    const sy = -imagePosition.y * scale;

    canvas.width = Math.round(aspectRatio.width ?? sWidth);
    canvas.height = Math.round(aspectRatio.height ?? sHeight);

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
  }

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
async function compressCanvasToBlob(
  canvas: HTMLCanvasElement,
  maxSizeKB: number
): Promise<Blob> {
  const MAX_SIZE_BYTES = maxSizeKB * 1024;

  let quality = 0.9;
  let minQuality = 0;
  let maxQuality = 1;
  let lastValidBlob: Blob | null = null;

  for (let i = 0; i < 7; i++) {
    // 7 iterations for binary search is enough for good precision
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", quality);
    });

    if (!blob) {
      throw new Error("Failed to create blob from canvas");
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
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create final blob"));
      },
      "image/webp",
      0.1
    );
  });
}
