import type { AspectRatio } from './types';

export const ASPECT_RATIOS: { [key: string]: AspectRatio } = {
  original: { name: 'Original', value: null, className: '' },
  fullhd: { 
    name: '1920x1080', 
    value: 1920 / 1080, 
    width: 1920, 
    height: 1080, 
    className: 'aspect-w-16 aspect-h-9' 
  },
  custom: { 
    name: '1200x657', 
    value: 1200 / 657, 
    width: 1200, 
    height: 657, 
    className: '' 
  },
  square: { 
    name: '600x600', 
    value: 1, 
    width: 600, 
    height: 600, 
    className: 'aspect-w-1 aspect-h-1' 
  },
};

export const MAX_IMAGE_SIZE_KB = 200;