"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ImageCanvasProps {
  currentImage: string | null;
  onImageUpload: (base64: string) => void;
  loading?: boolean;
}

export default function ImageCanvas({
  currentImage,
  onImageUpload,
  loading = false,
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
      </div>

      {/* Single image canvas */}
      <div
        className="canvas-checkerboard"
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          position: "relative",
        }}
      >
        <img
          src={`data:image/png;base64,${currentImage}`}
          alt="Image"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            transition: "transform 0.2s ease, filter 0.2s ease",
            borderRadius: "var(--radius-sm)",
            filter: loading ? "brightness(0.6) blur(2px)" : "none",
          }}
        />
        
        {/* Skeleton loading overlay */}
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "rgba(139, 34, 82, 0.15)",
                backdropFilter: "blur(4px)",
                padding: "16px 32px",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: "1px solid rgba(139, 34, 82, 0.3)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="spinner" style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wine-lighter)", letterSpacing: "0.02em" }}>
                Processing...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
