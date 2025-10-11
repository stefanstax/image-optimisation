import React, { useState, useCallback, useMemo } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { ImageEditor } from "./components/ImageEditor";
import { OutputControls } from "./components/OutputControls";
import { ImageList } from "./components/ImageList";
import { generateImageText as generateImageTextService } from "./services/geminiService";
import { processImage } from "./services/imageService";
import type {
  ImageState,
  AspectRatio,
  Position,
  Size,
  ImageFit,
  PaddingSize,
} from "./types";
import { ASPECT_RATIOS, MAX_IMAGE_SIZE_KB } from "./constants";
import { LogoIcon, ResetIcon } from "./components/icons";

export default function App() {
  const [images, setImages] = useState<ImageState[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const updateImage = useCallback(
    (id: string, newProps: Partial<ImageState>) => {
      setImages((currentImages) =>
        currentImages.map((img) =>
          img.id === id ? { ...img, ...newProps } : img
        )
      );
    },
    []
  );

  const updateSelectedImage = useCallback(
    (newProps: Partial<Omit<ImageState, "id" | "file" | "url">>) => {
      if (selectedImageId) {
        updateImage(selectedImageId, newProps);
      }
    },
    [selectedImageId, updateImage]
  );

  // Memoize all event handlers to prevent re-renders in child components
  const handleAspectRatioChange = useCallback(
    (aspectRatio: AspectRatio) => updateSelectedImage({ aspectRatio }),
    [updateSelectedImage]
  );
  const handleIsCenteredChange = useCallback(
    (isCentered: boolean) => updateSelectedImage({ isCentered }),
    [updateSelectedImage]
  );

  const handlePositionChange = useCallback(
    (position: Position, source: "drag" | "center") => {
      if (source === "drag") {
        updateSelectedImage({ position, isCentered: false });
      } else {
        // source === 'center'
        updateSelectedImage({ position }); // Just update position, don't change isCentered flag
      }
    },
    [updateSelectedImage]
  );
  const handleSizeChange = useCallback(
    (size: Size) => updateSelectedImage({ size }),
    [updateSelectedImage]
  );
  const handleImageFitChange = useCallback(
    (imageFit: ImageFit) => updateSelectedImage({ imageFit }),
    [updateSelectedImage]
  );
  const handleImageTitleChange = useCallback(
    (title: string) => updateSelectedImage({ title }),
    [updateSelectedImage]
  );
  const handleMaxSizeChange = useCallback(
    (maxSizeKB: number) => updateSelectedImage({ maxSizeKB }),
    [updateSelectedImage]
  );
  const handleLanguageChange = useCallback(
    (language: string) => updateSelectedImage({ language }),
    [updateSelectedImage]
  );
  const handleKeywordChange = useCallback(
    (keyword: string) => updateSelectedImage({ keyword }),
    [updateSelectedImage]
  );
  const handlePaddingSizeChange = useCallback(
    (paddingSize: PaddingSize) => updateSelectedImage({ paddingSize }),
    [updateSelectedImage]
  );
  const handleBackgroundColorChange = useCallback(
    (backgroundColor: string) => updateSelectedImage({ backgroundColor }),
    [updateSelectedImage]
  );

  const handleImageUpload = useCallback(
    (files: File[]) => {
      const newImages: ImageState[] = files.map((file, index) => {
        const id = `${Date.now()}-${index}`;
        return {
          id,
          file,
          url: URL.createObjectURL(file),
          title: file.name.split(".").slice(0, -1).join("."),
          altText: "",
          aspectRatio: ASPECT_RATIOS.original,
          position: { x: 0, y: 0 },
          size: { width: 0, height: 0 },
          maxSizeKB: MAX_IMAGE_SIZE_KB,
          language: "English",
          keyword: "",
          imageFit: "cover",
          paddingSize: "none",
          backgroundColor: "#000000",
          isCentered: true,
          isGeneratingText: false,
          isProcessing: false,
        };
      });

      setImages((prevImages) => [...prevImages, ...newImages]);
      if (!selectedImageId && newImages.length > 0) {
        setSelectedImageId(newImages[0].id);
      }
    },
    [selectedImageId]
  );

  const handleReset = useCallback(() => {
    images.forEach((image) => URL.revokeObjectURL(image.url));
    setImages([]);
    setSelectedImageId(null);
  }, [images]);

  const selectedImage = useMemo(() => {
    if (!selectedImageId) return null;
    return images.find((img) => img.id === selectedImageId) ?? null;
  }, [images, selectedImageId]);

  const handleGenerateImageText = useCallback(async () => {
    if (!selectedImage) return;

    updateImage(selectedImage.id, {
      isGeneratingText: true,
      title: "Generating...",
    });

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(selectedImage.file);
      });

      const { title, altText } = await generateImageTextService(
        base64Image,
        selectedImage.file.type,
        selectedImage.language,
        selectedImage.keyword
      );
      updateImage(selectedImage.id, { altText, title });
    } catch (error) {
      console.error("Error generating image text:", error);
      const originalBaseName = selectedImage.file.name
        .split(".")
        .slice(0, -1)
        .join(".");
      updateImage(selectedImage.id, {
        altText: "Sorry, could not generate alt text.",
        title: originalBaseName,
      });
    } finally {
      updateImage(selectedImage.id, { isGeneratingText: false });
    }
  }, [selectedImage, updateImage]);

  const downloadImage = useCallback(
    async (image: ImageState) => {
      if (image.size.width === 0) {
        console.error(`Image ${image.title} has not rendered, cannot process.`);
        return;
      }

      updateImage(image.id, { isProcessing: true });
      try {
        const img = new Image();
        img.src = image.url;
        await img.decode(); // Ensure image is loaded

        const blob = await processImage(
          img,
          image.aspectRatio,
          image.position,
          image.maxSizeKB,
          image.size,
          image.imageFit,
          image.paddingSize,
          image.backgroundColor
        );

        const sanitizedTitle =
          image.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .slice(0, 50) || "compressed-image";

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${sanitizedTitle}.webp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error processing image:", error);
      } finally {
        updateImage(image.id, { isProcessing: false });
      }
    },
    [updateImage]
  );

  const handleDownloadSelected = useCallback(async () => {
    if (selectedImage) {
      await downloadImage(selectedImage);
    }
  }, [selectedImage, downloadImage]);

  const handleDownloadAll = useCallback(async () => {
    for (const image of images) {
      await downloadImage(image);
    }
  }, [images, downloadImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="w-full max-w-7xl mb-6 flex justify-between items-center">
        <div className="w-full flex items-center justify-center gap-6">
          <img
            src="https://maypact.com/wp-content/uploads/2024/08/maypact-official-blurple-logo-mobile.svg"
            className="w-[50px] h-[50px] rounded-[8px] bg-white p-2"
          />
          <h1 className="text-2xl font-bold text-white">
            Image Optimisation Tool
          </h1>
        </div>
        {images.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            <ResetIcon />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        )}
      </header>

      <main className="w-full max-w-7xl flex-grow bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8">
        {images.length === 0 ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-3 xl:col-span-2 flex flex-col h-full">
              <ImageList
                images={images}
                selectedImageId={selectedImageId}
                onSelectImage={setSelectedImageId}
                onAddImages={handleImageUpload}
              />
            </div>
            {selectedImage && (
              <>
                <div className="lg:col-span-5 xl:col-span-6 flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-xl">
                  <ImageEditor
                    key={selectedImage.id} // Add key to force re-mount on image change
                    imageSrc={selectedImage.url}
                    aspectRatio={selectedImage.aspectRatio}
                    onAspectRatioChange={handleAspectRatioChange}
                    position={selectedImage.position}
                    onPositionChange={handlePositionChange}
                    onSizeChange={handleSizeChange}
                    imageFit={selectedImage.imageFit}
                    onImageFitChange={handleImageFitChange}
                    paddingSize={selectedImage.paddingSize}
                    backgroundColor={selectedImage.backgroundColor}
                    isCentered={selectedImage.isCentered}
                    onIsCenteredChange={handleIsCenteredChange}
                  />
                </div>
                <div className="lg:col-span-4 xl:col-span-4 flex flex-col space-y-6">
                  <OutputControls
                    imageTitle={selectedImage.title}
                    onImageTitleChange={handleImageTitleChange}
                    altText={selectedImage.altText}
                    onGenerateImageText={handleGenerateImageText}
                    onDownload={handleDownloadSelected}
                    onDownloadAll={handleDownloadAll}
                    isGeneratingAltText={selectedImage.isGeneratingText}
                    isProcessingImage={selectedImage.isProcessing}
                    maxSizeKB={selectedImage.maxSizeKB}
                    onMaxSizeChange={handleMaxSizeChange}
                    language={selectedImage.language}
                    onLanguageChange={handleLanguageChange}
                    keyword={selectedImage.keyword}
                    onKeywordChange={handleKeywordChange}
                    imageFit={selectedImage.imageFit}
                    paddingSize={selectedImage.paddingSize}
                    onPaddingSizeChange={handlePaddingSizeChange}
                    backgroundColor={selectedImage.backgroundColor}
                    onBackgroundColorChange={handleBackgroundColorChange}
                    aspectRatio={selectedImage.aspectRatio}
                  />
                </div>
              </>
            )}
            {!selectedImage && images.length > 0 && (
              <div className="lg:col-span-9 flex items-center justify-center text-gray-400">
                <p>Select an image from the list to begin editing.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="w-full max-w-7xl mt-6 text-center text-gray-500 text-sm">
        <p>
          Built and Maintained by{" "}
          <a
            href="https://maypact.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-400 transition-colors"
          >
            MAYPACT
          </a>
        </p>
      </footer>
    </div>
  );
}
