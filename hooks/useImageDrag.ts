import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Position, ImageFit, PaddingSize } from "../types";

const PADDING_MAP: Record<PaddingSize, number> = {
  none: 0,
  small: 0.05,
  medium: 0.1,
  large: 0.15,
};

export const useImageDrag = (
  onPositionChange: (position: Position, source: "drag" | "center") => void,
  imageSrc: string,
  aspectRatioValue: number | null,
  imageFit: ImageFit,
  paddingSize: PaddingSize,
  initialPosition: Position,
  isCentered: boolean
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef(initialPosition);

  const [imagePosition, setImagePosition] = useState(initialPosition);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    positionRef.current = imagePosition;
  }, [imagePosition]);

  const updateImageGeometry = useCallback(() => {
    if (containerRef.current && imageRef.current && naturalSize.width > 0) {
      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth === 0) return;

      const currentAspectRatio =
        aspectRatioValue ?? naturalSize.width / naturalSize.height;
      const containerHeight = containerWidth / currentAspectRatio;
      if (containerHeight === 0 || !isFinite(containerHeight)) return;

      const { width: naturalWidth, height: naturalHeight } = naturalSize;
      const imageRatio = naturalWidth / naturalHeight;

      let newWidth, newHeight;

      if (imageFit === "cover") {
        const containerRatio = currentAspectRatio;
        if (imageRatio > containerRatio) {
          newHeight = containerHeight;
          newWidth = newHeight * imageRatio;
        } else {
          newWidth = containerWidth;
          newHeight = newWidth / imageRatio;
        }
        setImageSize({ width: newWidth, height: newHeight });

        if (isCentered) {
          const centerX = (containerWidth - newWidth) / 2;
          const centerY = (containerHeight - newHeight) / 2;
          const centeredPos = { x: centerX, y: centerY };
          setImagePosition(centeredPos);
          if (
            initialPosition.x !== centeredPos.x ||
            initialPosition.y !== centeredPos.y
          ) {
            onPositionChange(centeredPos, "center");
          }
        } else {
          const maxX = 0;
          const minX = containerWidth - newWidth;
          const maxY = 0;
          const minY = containerHeight - newHeight;
          const newX = Math.max(minX, Math.min(initialPosition.x, maxX));
          const newY = Math.max(minY, Math.min(initialPosition.y, maxY));
          setImagePosition({ x: newX, y: newY });
        }
      } else {
        // 'contain'
        const padding = PADDING_MAP[paddingSize];
        const paddingX = containerWidth * padding;
        const paddingY = containerHeight * padding;

        const paddedWidth = containerWidth - 2 * paddingX;
        const paddedHeight = containerHeight - 2 * paddingY;
        const paddedRatio = paddedWidth / paddedHeight;

        if (imageRatio > paddedRatio) {
          newWidth = paddedWidth;
          newHeight = newWidth / imageRatio;
        } else {
          newHeight = paddedHeight;
          newWidth = newHeight * imageRatio;
        }
        setImageSize({ width: newWidth, height: newHeight });

        const newX = paddingX + (paddedWidth - newWidth) / 2;
        const newY = paddingY + (paddedHeight - newHeight) / 2;
        setImagePosition({ x: newX, y: newY });
      }
    }
  }, [
    aspectRatioValue,
    imageFit,
    naturalSize,
    paddingSize,
    isCentered,
    initialPosition,
    onPositionChange,
  ]);

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;
    const handleLoad = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.addEventListener("load", handleLoad);
    if (img.complete && img.naturalWidth > 0) handleLoad();
    return () => img.removeEventListener("load", handleLoad);
  }, [imageSrc]);

  useEffect(() => {
    if (naturalSize.width > 0) {
      updateImageGeometry();
    }
  }, [naturalSize, updateImageGeometry]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => updateImageGeometry());
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateImageGeometry]);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (imageFit !== "cover") return;
      e.preventDefault();
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX - positionRef.current.x,
        y: e.clientY - positionRef.current.y,
      };
    },
    [imageFit]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current || !imageRef.current)
        return;

      const containerRect = containerRef.current.getBoundingClientRect();

      let newX = e.clientX - dragStartRef.current.x;
      let newY = e.clientY - dragStartRef.current.y;

      const maxX = 0;
      const minX = containerRect.width - imageSize.width;
      const maxY = 0;
      const minY = containerRect.height - imageSize.height;

      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));

      setImagePosition({ x: newX, y: newY });
    },
    [imageSize.width, imageSize.height]
  );

  const onMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      onPositionChange(positionRef.current, "drag");
    }
  }, [onPositionChange]);

  useEffect(() => {
    const currentImageEl = imageRef.current;
    if (currentImageEl) {
      currentImageEl.addEventListener("mousedown", onMouseDown);
    }

    if (imageFit === "cover") {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      if (currentImageEl) {
        currentImageEl.removeEventListener("mousedown", onMouseDown);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [imageFit, onMouseDown, onMouseMove, onMouseUp]);

  return { containerRef, imageRef, imagePosition, imageSize, naturalSize };
};
