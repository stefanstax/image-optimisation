import React, { useState } from "react";
import { DownloadIcon, SparklesIcon, CopyIcon, CheckIcon } from "./icons";
import type { ImageFit, PaddingSize, AspectRatio } from "../types";

interface OutputControlsProps {
  imageTitle: string;
  onImageTitleChange: (name: string) => void;
  altText: string;
  onGenerateImageText: () => void;
  onDownload: () => void;
  onDownloadAll: () => void;
  isGeneratingAltText: boolean;
  isProcessingImage: boolean;
  maxSizeKB: number;
  onMaxSizeChange: (size: number) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  imageFit: ImageFit;
  paddingSize: PaddingSize;
  onPaddingSizeChange: (size: PaddingSize) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  aspectRatio: AspectRatio;
}

const PADDING_OPTIONS: { key: PaddingSize; label: string }[] = [
  { key: "none", label: "None" },
  { key: "small", label: "S" },
  { key: "medium", label: "M" },
  { key: "large", label: "L" },
];

const QUALITY_OPTIONS: { [key: string]: { label: string; sizeKB: number }[] } =
  {
    large: [
      { label: "Great Quality", sizeKB: 200 },
      { label: "Good Quality", sizeKB: 100 },
    ],
    featured: [{ label: "Optimized Quality", sizeKB: 75 }],
    square: [
      { label: "Great Quality", sizeKB: 100 },
      { label: "Good Quality", sizeKB: 50 },
    ],
  };

const LoadingSpinner: React.FC = () => (
  <div className="w-5 h-5 border-2 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
);

export const OutputControls: React.FC<OutputControlsProps> = ({
  imageTitle,
  onImageTitleChange,
  altText,
  onGenerateImageText,
  onDownload,
  onDownloadAll,
  isGeneratingAltText,
  isProcessingImage,
  maxSizeKB,
  onMaxSizeChange,
  language,
  onLanguageChange,
  keyword,
  onKeywordChange,
  imageFit,
  paddingSize,
  onPaddingSizeChange,
  backgroundColor,
  onBackgroundColorChange,
  aspectRatio,
}) => {
  const [titleCopied, setTitleCopied] = useState(false);
  const [altTextCopied, setAltTextCopied] = useState(false);

  const handleCopyToClipboard = (text: string, type: "title" | "alt") => {
    if (!navigator.clipboard) {
      console.error("Clipboard API not available");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "title") {
          setTitleCopied(true);
          setTimeout(() => setTitleCopied(false), 2000);
        } else {
          setAltTextCopied(true);
          setTimeout(() => setAltTextCopied(false), 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const getQualityOptions = () => {
    if (aspectRatio.name === "Banner") {
      return QUALITY_OPTIONS.large;
    }
    if (aspectRatio.name === "Featured Image") {
      return QUALITY_OPTIONS.featured;
    }
    if (["Blog Post Big", "Blog Post Regular"].includes(aspectRatio.name)) {
      return QUALITY_OPTIONS.square;
    }
    return null; // Fallback for 'Original' and any other aspect ratios
  };

  const qualityOptions = getQualityOptions();

  return (
    <div className="flex flex-col h-full bg-gray-900/50 p-6 rounded-lg space-y-6 overflow-y-auto">
      <div>
        <label
          htmlFor="imageTitle"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Image Title
        </label>
        <div className="relative">
          <input
            type="text"
            id="imageTitle"
            value={imageTitle}
            onChange={(e) => onImageTitleChange(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="e.g., A busy street in London"
            disabled={isGeneratingAltText}
          />
          <button
            onClick={() => handleCopyToClipboard(imageTitle, "title")}
            disabled={!imageTitle || isGeneratingAltText}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Copy title to clipboard"
          >
            {titleCopied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Alt Text
        </label>
        <div className="relative flex-grow bg-gray-700 border-gray-600 rounded-md p-3 text-gray-200 text-sm overflow-y-auto min-h-[100px]">
          {isGeneratingAltText && (
            <span className="text-gray-400 italic">Generating...</span>
          )}
          {!isGeneratingAltText && altText ? (
            <>
              <p className="pr-8">{altText}</p>
              <button
                onClick={() => handleCopyToClipboard(altText, "alt")}
                className="absolute top-2 right-2 p-1.5 bg-gray-800/50 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                aria-label="Copy alt text to clipboard"
              >
                {altTextCopied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </>
          ) : !isGeneratingAltText && !altText ? (
            <span className="text-gray-400">
              Click below to generate a title and alt text.
            </span>
          ) : null}
        </div>

        <div className="mt-4">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
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
            <option>Serbian</option>
          </select>
        </div>

        <div className="mt-3">
          <label
            htmlFor="keyword"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Optional Keyword
          </label>
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Guide the AI with a specific topic"
            disabled={isGeneratingAltText}
          />
        </div>

        <button
          onClick={onGenerateImageText}
          disabled={isGeneratingAltText}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingAltText ? <LoadingSpinner /> : <SparklesIcon />}
          <span>
            {isGeneratingAltText
              ? "Generating..."
              : "Generate Title & Alt Text"}
          </span>
        </button>
      </div>

      {imageFit === "contain" && (
        <div className="pt-4 border-t border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Padding
            </label>
            <div className="flex justify-between gap-2">
              {PADDING_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => onPaddingSizeChange(key)}
                  className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                    paddingSize === key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="bgColor"
              className="text-sm font-medium text-gray-300"
            >
              Background Color
            </label>
            <div className="relative w-10 h-10 rounded-md overflow-hidden border-2 border-gray-600">
              <input
                type="color"
                id="bgColor"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
                aria-label="Choose background color"
                style={{
                  border: "none",
                  padding: 0,
                  background: "transparent",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-700 space-y-4">
        {aspectRatio.name !== "Original" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {qualityOptions ? "Output Quality" : "Max File Size"}
            </label>
            {qualityOptions ? (
              <div className="flex justify-around gap-2">
                {qualityOptions.map(({ label, sizeKB }) => (
                  <button
                    key={label}
                    onClick={() => onMaxSizeChange(sizeKB)}
                    className={`w-full py-2 px-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                      maxSizeKB === sizeKB
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {label} ({sizeKB}KB)
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative">
                <input
                  type="number"
                  id="maxSize"
                  value={maxSizeKB}
                  onChange={(e) =>
                    onMaxSizeChange(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 pr-12 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="e.g., 200"
                  min="1"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  KB
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={onDownload}
            disabled={isProcessingImage}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors duration-200 disabled:bg-indigo-800 disabled:cursor-wait"
          >
            {isProcessingImage ? <LoadingSpinner /> : <DownloadIcon />}
            <span>
              {isProcessingImage ? "Processing..." : "Download Selected"}
            </span>
          </button>

          <button
            onClick={onDownloadAll}
            disabled={isProcessingImage}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadIcon />
            <span>Download All</span>
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 !mt-2">
          Output is compressed and converted to WebP format.
        </p>
      </div>
    </div>
  );
};
