
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Position } from '../types';

export const useImageDrag = (
  onPositionChange: (position: Position) => void,
  imageSrc: string,
  aspectRatioValue: number | null
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const updateImageSize = useCallback(() => {
    if (containerRef.current && imageRef.current && imageRef.current.naturalWidth > 0) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      if (containerHeight === 0) return; // Avoid division by zero if container isn't rendered yet

      const { naturalWidth, naturalHeight } = imageRef.current;

      const containerRatio = containerWidth / containerHeight;
      const imageRatio = naturalWidth / naturalHeight;

      let width, height;
      if (imageRatio > containerRatio) {
        // Image is wider than container, scale to cover by matching height
        height = containerHeight;
        width = height * imageRatio;
      } else {
        // Image is taller or same, scale to cover by matching width
        width = containerWidth;
        height = width / imageRatio;
      }
      setImageSize({ width, height });
    }
  }, []);
  
  // Reset position and size when image src changes
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const handleLoad = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setImagePosition({ x: 0, y: 0 });
        updateImageSize();
    };

    img.addEventListener('load', handleLoad);
    // If the image is already cached/loaded, the load event might not fire
    if (img.complete && img.naturalWidth > 0) {
        handleLoad();
    }

    return () => {
        img.removeEventListener('load', handleLoad);
    };
  }, [imageSrc, updateImageSize]);


  useEffect(() => {
    window.addEventListener('resize', updateImageSize);
    return () => {
        window.removeEventListener('resize', updateImageSize);
    };
  }, [updateImageSize]);

  // This effect runs when the aspect ratio of the container changes.
  useEffect(() => {
    // A small delay ensures the container has resized in the DOM before we measure it.
    const handle = setTimeout(() => {
      updateImageSize();
    }, 50);
    return () => clearTimeout(handle);
  }, [aspectRatioValue, naturalSize, updateImageSize]);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    };
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    let newX = e.clientX - dragStartRef.current.x;
    let newY = e.clientY - dragStartRef.current.y;
    
    // Boundary checks
    const maxX = 0;
    const minX = containerRect.width - imageSize.width;
    const maxY = 0;
    const minY = containerRect.height - imageSize.height;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));
    
    setImagePosition({ x: newX, y: newY });
  }, [imageSize.width, imageSize.height]);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    onPositionChange(imagePosition);
  }, [onPositionChange, imagePosition]);
  
  useEffect(() => {
      const currentImageRef = imageRef.current;
      if (currentImageRef) {
          currentImageRef.addEventListener('mousedown', onMouseDown as any);
      }
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      
      return () => {
          if (currentImageRef) {
              currentImageRef.removeEventListener('mousedown', onMouseDown as any);
          }
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
      };
  }, [onMouseDown, onMouseMove, onMouseUp]);


  return { containerRef, imageRef, imagePosition, imageSize, naturalSize };
};
