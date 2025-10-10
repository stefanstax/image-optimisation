
import React, { useEffect } from 'react';
import { useImageDrag } from '../hooks/useImageDrag';
import type { AspectRatio, Position, Size } from '../types';
import { ASPECT_RATIOS } from '../constants';

interface ImageEditorProps {
  imageSrc: string;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onPositionChange: (position: Position) => void;
  onSizeChange: (size: Size) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageSrc,
  aspectRatio,
  onAspectRatioChange,
  onPositionChange,
  onSizeChange,
}) => {
  const { containerRef, imageRef, imagePosition, imageSize, naturalSize } = useImageDrag(
    onPositionChange,
    imageSrc,
    aspectRatio.value
  );

  useEffect(() => {
    if (imageSize.width > 0) {
      onSizeChange(imageSize);
    }
  }, [imageSize, onSizeChange]);

  return (
    <div className="w-full flex flex-col items-center space-y-4">
        <div className="text-lg font-medium text-gray-300">Crop & Position</div>
        <div
            ref={containerRef}
            className={`w-full max-w-full rounded-lg overflow-hidden relative bg-black ${aspectRatio.className}`}
            style={{ 
                aspectRatio: aspectRatio.value 
                    ? `${aspectRatio.value}` 
                    : (naturalSize.width && naturalSize.height) 
                        ? `${naturalSize.width}/${naturalSize.height}`
                        : '1'
             }}
        >
            <img
                ref={imageRef}
                src={imageSrc}
                alt="Editable preview"
                className="absolute max-w-none cursor-grab active:cursor-grabbing"
                style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    width: `${imageSize.width}px`,
                    height: `${imageSize.height}px`,
                }}
                draggable="false"
            />
        </div>
        <div className="flex space-x-2 p-2 bg-gray-800 rounded-full">
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
        </div>
    </div>
  );
};
