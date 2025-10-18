import React, { useRef } from "react";
import type { ImageState } from "../types";
import { PlusIcon } from "./icons";

interface ImageListProps {
  images: ImageState[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onAddImages: (files: File[]) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="w-4 h-4 border-2 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
);

export const ImageList: React.FC<ImageListProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  onAddImages,
}) => {
  const addImageInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    addImageInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((file: File) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length > 0) {
        onAddImages(imageFiles);
      }
    }
    // Reset the input value to allow selecting the same file again
    if (addImageInputRef.current) {
      addImageInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 p-3 rounded-lg space-y-3">
      <h2 className="text-lg font-semibold text-center text-gray-200 mb-1">
        Your Images
      </h2>
      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => onSelectImage(image.id)}
            className={`w-full p-2 rounded-lg flex items-center gap-3 transition-colors duration-200 text-left ${
              selectedImageId === image.id
                ? "bg-indigo-600/50"
                : "hover:bg-gray-700"
            }`}
          >
            <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-700">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              {(image.isProcessing || image.isGeneratingText) && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
            <p className="flex-grow text-sm text-gray-200 truncate pr-2">
              {image.title}
            </p>
          </button>
        ))}
      </div>
      <button
        onClick={handleAddClick}
        className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
      >
        <PlusIcon />
        Add More
      </button>
      <input
        ref={addImageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
