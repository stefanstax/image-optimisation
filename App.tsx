import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageEditor } from './components/ImageEditor';
import { OutputControls } from './components/OutputControls';
import { generateImageText as generateImageTextService } from './services/geminiService';
import { processImage } from './services/imageService';
import type { AspectRatio, Position, Size } from './types';
import { ASPECT_RATIOS, MAX_IMAGE_SIZE_KB } from './constants';
import { LogoIcon, ResetIcon } from './components/icons';

export default function App() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS.original);
  const [imagePosition, setImagePosition] = useState<Position>({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState<Size>({ width: 0, height: 0 });
  const [imageTitle, setImageTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [isGeneratingAltText, setIsGeneratingAltText] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [maxSizeKB, setMaxSizeKB] = useState<number>(MAX_IMAGE_SIZE_KB);
  const [language, setLanguage] = useState('English');
  const [keyword, setKeyword] = useState('');

  const handleImageUpload = useCallback((file: File) => {
    setOriginalImage(file);
    setImageUrl(URL.createObjectURL(file));
    setImageTitle(file.name.split('.').slice(0, -1).join('.'));
    setAltText('');
    setAspectRatio(ASPECT_RATIOS.original);
    setImagePosition({ x: 0, y: 0 });
    setImageSize({ width: 0, height: 0 });
    setMaxSizeKB(MAX_IMAGE_SIZE_KB);
    setLanguage('English');
    setKeyword('');
  }, []);
  
  const handleReset = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setOriginalImage(null);
    setImageUrl(null);
    setImageTitle('');
    setAltText('');
    setAspectRatio(ASPECT_RATIOS.original);
    setImagePosition({ x: 0, y: 0 });
    setImageSize({ width: 0, height: 0 });
    setMaxSizeKB(MAX_IMAGE_SIZE_KB);
    setLanguage('English');
    setKeyword('');
  }, [imageUrl]);

  const handleGenerateImageText = useCallback(async () => {
    if (!imageUrl || !originalImage) return;
    
    const originalBaseName = originalImage.name.split('.').slice(0, -1).join('.');
    setIsGeneratingAltText(true);
    setImageTitle('Generating...');
    setAltText('');

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(originalImage);
      });

      const { title, altText } = await generateImageTextService(base64Image, originalImage.type, language, keyword);
      setAltText(altText);
      setImageTitle(title);

    } catch (error) {
      console.error('Error generating image text:', error);
      setAltText('Sorry, could not generate alt text.');
      setImageTitle(originalBaseName); // Restore original name on error
    } finally {
      setIsGeneratingAltText(false);
    }
  }, [imageUrl, originalImage, language, keyword]);

  const handleDownload = useCallback(async () => {
    if (!imageUrl || imageSize.width === 0) return;
    setIsProcessingImage(true);
    try {
      const img = new Image();
      img.src = imageUrl;
      img.onload = async () => {
        const blob = await processImage(img, aspectRatio, imagePosition, maxSizeKB, imageSize);
        
        const sanitizedTitle = imageTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // allow letters, numbers, spaces, hyphens
            .trim()
            .replace(/\s+/g, '-') // replace spaces with hyphens
            .slice(0, 50) || 'compressed-image';

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${sanitizedTitle}.webp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        setIsProcessingImage(false);
      };
      img.onerror = () => {
          console.error("Image failed to load for processing.");
          setIsProcessingImage(false);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessingImage(false);
    }
  }, [imageUrl, aspectRatio, imagePosition, imageTitle, maxSizeKB, imageSize]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="w-full max-w-6xl mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <LogoIcon />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Image Optimisation by Maypact</h1>
        </div>
        {imageUrl && (
            <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
                <ResetIcon />
                <span className="hidden sm:inline">New Image</span>
            </button>
        )}
      </header>

      <main className="w-full max-w-6xl flex-grow bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8">
        {!imageUrl ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
            <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-xl">
              <ImageEditor
                imageSrc={imageUrl}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                onPositionChange={setImagePosition}
                onSizeChange={setImageSize}
              />
            </div>
            <div className="lg:col-span-2 flex flex-col space-y-6">
              <OutputControls
                imageTitle={imageTitle}
                onImageTitleChange={setImageTitle}
                altText={altText}
                onGenerateImageText={handleGenerateImageText}
                onDownload={handleDownload}
                isGeneratingAltText={isGeneratingAltText}
                isProcessingImage={isProcessingImage}
                maxSizeKB={maxSizeKB}
                onMaxSizeChange={setMaxSizeKB}
                language={language}
                onLanguageChange={setLanguage}
                keyword={keyword}
                onKeywordChange={setKeyword}
              />
            </div>
          </div>
        )}
      </main>
       <footer className="w-full max-w-6xl mt-6 text-center text-gray-500 text-sm">
        <p>
            Powered by <a href="https://maypact.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400 transition-colors">MAYPACT</a>
        </p>
      </footer>
    </div>
  );
}