import React from 'react';
import { DownloadIcon, SparklesIcon } from './icons';

interface OutputControlsProps {
  imageTitle: string;
  onImageTitleChange: (name: string) => void;
  altText: string;
  onGenerateImageText: () => void;
  onDownload: () => void;
  isGeneratingAltText: boolean;
  isProcessingImage: boolean;
  maxSizeKB: number;
  onMaxSizeChange: (size: number) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
);

export const OutputControls: React.FC<OutputControlsProps> = ({
  imageTitle,
  onImageTitleChange,
  altText,
  onGenerateImageText,
  onDownload,
  isGeneratingAltText,
  isProcessingImage,
  maxSizeKB,
  onMaxSizeChange,
  language,
  onLanguageChange,
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-900/50 p-6 rounded-xl space-y-6">
      <div>
        <label htmlFor="imageTitle" className="block text-sm font-medium text-gray-300 mb-2">
          Image Title
        </label>
        <div className="relative">
            <input
            type="text"
            id="imageTitle"
            value={imageTitle}
            onChange={(e) => onImageTitleChange(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 pr-4 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="e.g., A busy street in London"
            disabled={isGeneratingAltText}
            />
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Alt Text
        </label>
        <div className="flex-grow bg-gray-700 border-gray-600 rounded-md p-3 text-gray-200 text-sm overflow-y-auto min-h-[100px]">
          {isGeneratingAltText && <span className="text-gray-400 italic">Generating...</span>}
          {!isGeneratingAltText && altText ? altText : !isGeneratingAltText && !altText ? <span className="text-gray-400">Click below to generate a title and alt text.</span> : ''}
        </div>
        
        <div className="mt-4">
            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
            Generation Language
            </label>
            <select
            id="language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isGeneratingAltText}
            >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Japanese</option>
            <option>Chinese</option>
            <option>Italian</option>
            <option>Portuguese</option>
            <option>Russian</option>
            <option>Serbian</option>
            </select>
        </div>

        <button
          onClick={onGenerateImageText}
          disabled={isGeneratingAltText}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingAltText ? <LoadingSpinner /> : <SparklesIcon />}
          <span>{isGeneratingAltText ? 'Generating...' : 'Generate Title & Alt Text'}</span>
        </button>
      </div>

      <div className="pt-4 border-t border-gray-700 space-y-4">
        <div>
          <label htmlFor="maxSize" className="block text-sm font-medium text-gray-300 mb-2">
            Max File Size
          </label>
          <div className="relative">
            <input
              type="number"
              id="maxSize"
              value={maxSizeKB}
              onChange={(e) => onMaxSizeChange(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 pr-12 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g., 200"
              min="1"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">KB</span>
          </div>
        </div>

        <button
          onClick={onDownload}
          disabled={isProcessingImage}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-lg transition-colors duration-200 disabled:bg-indigo-800 disabled:cursor-wait"
        >
          {isProcessingImage ? <LoadingSpinner /> : <DownloadIcon />}
          <span>{isProcessingImage ? 'Processing...' : 'Download Image'}</span>
        </button>
        <p className="text-center text-xs text-gray-500 !mt-2">Output is compressed and converted to WebP format.</p>
      </div>
    </div>
  );
};