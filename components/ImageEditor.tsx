import React, { useEffect } from 'react';
import { useImageDrag } from '../hooks/useImageDrag';
import type { AspectRatio, Position, Size, ImageFit, PaddingSize } from '../types';
import { ASPECT_RATIOS } from '../constants';

interface ImageEditorProps {
  imageSrc: string;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onPositionChange: (position: Position) => void;
  onSizeChange: (size: Size) => void;
  imageFit: ImageFit;
  onImageFitChange: (fit: ImageFit) => void;
  paddingSize: PaddingSize;
  backgroundColor: string;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageSrc,
  aspectRatio,
  onAspectRatioChange,
  onPositionChange,
  onSizeChange,
  imageFit,
  onImageFitChange,
  paddingSize,
  backgroundColor,
}) => {
  const { containerRef, imageRef, imagePosition, imageSize, naturalSize } = useImageDrag(
    onPositionChange,
    imageSrc,
    aspectRatio.value,
    imageFit,
    paddingSize
  );

  useEffect(() => {
    if (imageSize.width > 0) {
      onSizeChange(imageSize);
    }
  }, [imageSize, onSizeChange]);

  const handleFitChange = (fit: ImageFit) => {
    onImageFitChange(fit);
    // When switching to cover, reset position for a clean slate
    if (fit === 'cover') {
      onPositionChange({ x: 0, y: 0 });
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
        <div className="text-lg font-medium text-gray-300">Crop, Position & Fit</div>
        <div
            ref={containerRef}
            className={`w-full max-w-full rounded-lg overflow-hidden relative ${aspectRatio.className}`}
            style={{ 
                aspectRatio: aspectRatio.value 
                    ? `${aspectRatio.value}` 
                    : (naturalSize.width && naturalSize.height) 
                        ? `${naturalSize.width}/${naturalSize.height}`
                        : '1',
                backgroundColor: imageFit === 'contain' ? backgroundColor : '#000000',
             }}
        >
            <img
                ref={imageRef}
                src={imageSrc}
                alt="Editable preview"
                className={`absolute max-w-none ${imageFit === 'cover' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    width: `${imageSize.width}px`,
                    height: `${imageSize.height}px`,
                }}
                draggable="false"
            />
        </div>
        <div className="flex flex-wrap justify-center gap-2 p-2 bg-gray-800 rounded-full">
            {Object.values(ASPECT_RATIOS).map((ratio) => (
                <button
                    key={ratio.name}
                    onClick={() => onAspectRatioChange(ratio)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                        aspectRatio.name === ratio.name
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {ratio.name}
                </button>
            ))}
             <div className="flex items-center space-x-2 border-l border-gray-700 ml-2 pl-2">
                <button
                    onClick={() => handleFitChange('cover')}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                        imageFit === 'cover'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Cover
                </button>
                <button
                    onClick={() => handleFitChange('contain')}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                        imageFit === 'contain'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Contain
                </button>
            </div>
        </div>
    </div>
  );
};
