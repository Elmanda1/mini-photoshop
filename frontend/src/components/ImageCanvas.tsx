"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";

interface ImageCanvasProps {
  originalImage?: string | null;
  currentImage: string | null;
  onImageUpload: (base64: string) => void;
  loading?: boolean;
  zoom: number;
  liveFilters?: {
    brightness: number;
    contrast: number;
    hueShift: number;
    saturation: number;
    rotation: number;
    scale: number;
    translateX: number;
    translateY: number;
  };
  imageDimensions?: { width: number; height: number } | null;
  originalDimensions?: { width: number; height: number } | null;
}

export default function ImageCanvas({
  originalImage,
  currentImage,
  onImageUpload,
  loading = false,
  zoom,
  liveFilters,
  imageDimensions,
}: ImageCanvasProps) {
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const afterContainerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        onImageUpload(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/bmp": [".bmp"],
    },
    multiple: false,
  });

  const liveFiltersStyle = React.useMemo(() => {
    if (!liveFilters) return { filter: "none", rotation: 0, scale: 1.0, translateX: 0, translateY: 0 };
    
    const filterStr = `
      brightness(${100 * (1 + liveFilters.brightness / 100)}%)
      contrast(${100 * liveFilters.contrast}%)
      hue-rotate(${liveFilters.hueShift}deg)
      saturate(${100 * liveFilters.saturation}%)
    `;
    return {
      filter: filterStr,
      rotation: liveFilters.rotation || 0,
      scale: liveFilters.scale || 1.0,
      translateX: liveFilters.translateX || 0,
      translateY: liveFilters.translateY || 0,
    };
  }, [liveFilters]);


  const beforeStyle = React.useMemo(() => ({
    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
    transformOrigin: "center" as const,
    willChange: "transform",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain" as const,
    transition: isDragging ? "none" : "transform 0.15s ease",
    backfaceVisibility: "hidden" as const,
  }), [zoom, pan, isDragging]);

  const [afterContainerSize, setAfterContainerSize] = React.useState({ width: 800, height: 600 });

  React.useEffect(() => {
    if (!afterContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      setAfterContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    resizeObserver.observe(afterContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const imageDisplayScale = React.useMemo(() => {
    if (!imageDimensions) return 1.0;

    const vpW = Math.max(10, afterContainerSize.width - 48);
    const vpH = Math.max(10, afterContainerSize.height - 48);

    return Math.min(1.0, vpW / imageDimensions.width, vpH / imageDimensions.height);
  }, [afterContainerSize, imageDimensions]);

  const imageStyle = React.useMemo(() => ({
    ...beforeStyle,
    width: imageDimensions ? `${imageDimensions.width}px` : undefined,
    height: imageDimensions ? `${imageDimensions.height}px` : undefined,
    transform: `${beforeStyle.transform} translate(${liveFiltersStyle.translateX * imageDisplayScale}px, ${liveFiltersStyle.translateY * imageDisplayScale}px) scale(${liveFiltersStyle.scale}) rotate(${liveFiltersStyle.rotation}deg)`,
    filter: liveFiltersStyle.filter,
    cursor: isDragging ? "grabbing" : "grab",
    // Remove transitions entirely as requested for a snappier, non-floaty feel
    transition: "none",
  }), [beforeStyle, imageDimensions, imageDisplayScale, liveFiltersStyle, isDragging]);





  // ─── Crop Interaction Logic ───
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPan((prev) => ({
        x: prev.x + (e.movementX || 0),
        y: prev.y + (e.movementY || 0),
      }));
    }
  }, [isDragging]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // No image — dropzone
  if (!currentImage) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <div
          {...getRootProps()}
          className={`dropzone animate-fade-in-scale ${isDragActive ? "active" : ""}`}
          style={{ maxWidth: 480, width: "100%" }}
        >
          <input {...getInputProps()} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--wine-bg)",
                border: "1px solid var(--border-wine)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload
                size={30}
                style={{
                  color: "var(--wine-light)",
                  transition: "transform 0.2s ease",
                  transform: isDragActive ? "translateY(-4px)" : "translateY(0)",
                }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                  letterSpacing: "-0.02em",
                }}
              >
                {isDragActive ? "Release to upload" : "Drop your image here"}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                or click to browse • JPG, PNG, BMP
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div 
        style={{ 
          flex: 1, 
          display: "flex", 
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab"
        }}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {/* LEFT: Before (Original) */}
        <div style={{ flex: 1, borderRight: "1px dashed rgba(255,255,255,0.1)", position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 12, left: 16, zIndex: 10, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
            BEFORE
          </div>
          <div ref={containerRef} className="canvas-checkerboard" style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", padding: 24, userSelect: "none" }}>
              <img src={`data:image/png;base64,${originalImage || currentImage}`} alt="Original Image" style={beforeStyle} draggable={false} />
          </div>
        </div>

        {/* RIGHT: After (Live Updated) */}
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 12, left: 16, zIndex: 10, background: "var(--wine-bg-strong)", border: "1px solid var(--border-wine)", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--wine-light)" }}>
            AFTER
          </div>
          <div ref={afterContainerRef} className="canvas-checkerboard" style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", padding: 24, userSelect: "none" }}>
            <img 
              ref={imgRef}
              src={`data:image/png;base64,${currentImage}`} 
              alt="Edited Image" 
              style={imageStyle} 
              draggable={false} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
