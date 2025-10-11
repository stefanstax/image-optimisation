// Import and re-export all utility types. This makes them available
// to the rest of the app via the central 'types.ts' file and resolves
// any ambiguity for development tools.
export type {
  AspectRatio,
  Position,
  Size,
  ImageText,
  ImageFit,
  PaddingSize,
} from "./utilityTypes";

// Import the types needed for defining interfaces within this file.
import type {
  AspectRatio,
  Position,
  Size,
  ImageFit,
  PaddingSize,
} from "./utilityTypes";

// Define the main application state for a single image.
export interface ImageState {
  id: string;
  file: File;
  url: string;
  aspectRatio: AspectRatio;
  position: Position;
  size: Size;
  title: string;
  altText: string;
  isGeneratingText: boolean;
  isProcessing: boolean;
  maxSizeKB: number;
  language: string;
  keyword: string;
  imageFit: ImageFit;
  paddingSize: PaddingSize;
  backgroundColor: string;
  isCentered: boolean;
}
