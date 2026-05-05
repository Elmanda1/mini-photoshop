"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";

interface ImageCanvasProps {
  originalImage?: string | null;
  currentImage: string | null;
  onImageUpload: (base64: string) => void;
  loading?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function ImageCanvas({
  originalImage,
  currentImage,
  onImageUpload,
  loading = false,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ImageCanvasProps) {
  const [zoom, setZoom] = React.useState(1);

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

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);

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

  const imageStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: "top left",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain" as const,
    transition: "transform 0.2s ease, filter 0.2s ease",
    borderRadius: "var(--radius-sm)",
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      {/* Zoom controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "5px 16px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
        }}
      >
        <button className="btn-icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={14} />
        </button>
        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            minWidth: 40,
            textAlign: "center",
            fontFamily: "var(--font-mono)",
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button className="btn-icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={14} />
        </button>
        <button className="btn-icon" onClick={handleResetZoom} title="Fit">
          <Maximize2 size={14} />
        </button>
        <div style={{ flex: 1 }} />
        {onUndo && (
          <button className="btn-icon" onClick={onUndo} disabled={!canUndo} title="Undo" style={{ opacity: canUndo ? 1 : 0.5 }}>
            <Undo2 size={14} />
          </button>
        )}
        {onRedo && (
          <button className="btn-icon" onClick={onRedo} disabled={!canRedo} title="Redo" style={{ opacity: canRedo ? 1 : 0.5 }}>
            <Redo2 size={14} />
          </button>
        )}
      </div>

      {/* Split image canvas */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        
        {/* LEFT: Before (Original) */}
        <div style={{ flex: 1, borderRight: "1px dashed rgba(255,255,255,0.1)", position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 12, left: 16, zIndex: 10, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
            BEFORE
          </div>
          <div className="canvas-checkerboard" style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
             <img src={`data:image/png;base64,${originalImage || currentImage}`} alt="Original Image" style={imageStyle} />
          </div>
        </div>

        {/* RIGHT: After (Live Updated) */}
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 12, left: 16, zIndex: 10, background: "var(--wine-bg-strong)", border: "1px solid var(--border-wine)", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--wine-light)" }}>
            AFTER
          </div>
          <div className="canvas-checkerboard" style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
             <img src={`data:image/png;base64,${currentImage}`} alt="Edited Image" style={{ ...imageStyle, filter: loading ? "blur(4px) grayscale(50%)" : "none" }} />
          </div>
        </div>

      </div>
    </div>
  );
}
