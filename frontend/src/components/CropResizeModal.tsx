"use client";

import React, { useState, useRef } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { 
  X, Crop, Check, Maximize2, 
  RotateCcw, Layout, Square, 
  Smartphone, Monitor 
} from "lucide-react";

interface CropResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (module: string, operation: string, params: any, isPreview?: boolean) => void;
  image: string | null;
  imageDimensions: { width: number; height: number } | null;
}

const CropResizeModal: React.FC<CropResizeModalProps> = ({
  isOpen,
  onClose,
  onApply,
  image,
  imageDimensions,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [activeRatio, setActiveRatio] = useState<string>("Free");

  if (!isOpen || !image) return null;

  const handleApply = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const croppedData = cropper.getData(true); // true means rounded values

    onApply("transform", "crop", {
      x1: croppedData.x,
      y1: croppedData.y,
      x2: croppedData.x + croppedData.width,
      y2: croppedData.y + croppedData.height,
      target_w: croppedData.width,
      target_h: croppedData.height,
    });
    onClose();
  };

  const getAspectValue = (label: string) => {
    if (label === "Free") return NaN;
    if (label === "1:1") return 1;
    
    const [w, h] = label.split(":").map(Number);
    return orientation === "landscape" ? w / h : h / w;
  };

  const handleRatioClick = (label: string) => {
    setActiveRatio(label);
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setAspectRatio(getAspectValue(label));
    }
  };

  const handleOrientationToggle = (newOrientation: "landscape" | "portrait") => {
    setOrientation(newOrientation);
    const cropper = cropperRef.current?.cropper;
    if (cropper && activeRatio !== "Free" && activeRatio !== "1:1") {
      // Update existing aspect ratio with new orientation
      cropper.setAspectRatio(getAspectValue(activeRatio));
    }
  };

  const aspectRatios = [
    { label: "Free", icon: <Maximize2 size={14} /> },
    { label: "1:1", icon: <Square size={14} /> },
    { label: "4:3", icon: <Layout size={14} /> },
    { label: "16:9", icon: <Layout size={14} style={{ transform: orientation === "landscape" ? "rotate(90deg)" : "none" }} /> },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        className="animate-fade-in-scale"
        style={{
          width: "100%",
          maxWidth: "1000px",
          height: "90vh",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid var(--border-color)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 28px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-tertiary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                backgroundColor: "var(--wine-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Crop size={20} style={{ color: "var(--wine-light)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Advanced Image Cropper
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                Drag corners to resize • Toggle orientation • Professional grid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ padding: 8, borderRadius: "50%" }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Cropper Section */}
        <div
          style={{
            flex: 1,
            position: "relative",
            backgroundColor: "#050505",
            margin: "16px",
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Cropper
            ref={cropperRef}
            src={`data:image/png;base64,${image}`}
            style={{ height: "100%", width: "100%" }}
            initialAspectRatio={NaN}
            guides={true}
            viewMode={1}
            dragMode="move"
            autoCropArea={0.8}
            background={false}
            responsive={true}
            checkOrientation={false}
          />
          
          {/* Internal CSS for CropperJS custom styling to match Modern Dark theme */}
          <style jsx global>{`
            .cropper-view-box {
              outline: 2px solid var(--wine-light);
              outline-color: var(--wine-light);
            }
            .cropper-line {
              background-color: var(--wine-light);
            }
            .cropper-point {
              background-color: var(--wine-light);
              width: 8px;
              height: 8px;
              opacity: 1;
            }
            .cropper-point.point-se {
              width: 12px;
              height: 12px;
            }
            .cropper-face {
              background-color: transparent;
            }
            .cropper-modal {
              opacity: 0.75;
              background-color: #000;
            }
          `}</style>
        </div>

        {/* Footer Controls */}
        <div
          style={{
            padding: "24px 32px",
            background: "var(--bg-tertiary)",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
            {/* Orientation Toggle */}
            <div style={{ width: 180 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 12, letterSpacing: "0.05em" }}>
                Orientation
              </span>
              <div style={{ display: "flex", backgroundColor: "var(--bg-elevated)", padding: 4, borderRadius: 10, border: "1px solid var(--border-color)" }}>
                <button
                  onClick={() => handleOrientationToggle("landscape")}
                  style={{
                    flex: 1,
                    height: 34,
                    borderRadius: 7,
                    border: "none",
                    backgroundColor: orientation === "landscape" ? "var(--wine-bg-strong)" : "transparent",
                    color: orientation === "landscape" ? "var(--wine-light)" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Monitor size={14} /> Landscape
                </button>
                <button
                  onClick={() => handleOrientationToggle("portrait")}
                  style={{
                    flex: 1,
                    height: 34,
                    borderRadius: 7,
                    border: "none",
                    backgroundColor: orientation === "portrait" ? "var(--wine-bg-strong)" : "transparent",
                    color: orientation === "portrait" ? "var(--wine-light)" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Smartphone size={14} /> Portrait
                </button>
              </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 12, letterSpacing: "0.05em" }}>
                Aspect Ratio
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.label}
                    onClick={() => handleRatioClick(ratio.label)}
                    className={activeRatio === ratio.label ? "btn-primary" : "btn-secondary"}
                    style={{
                      flex: 1,
                      height: 40,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      padding: "0 14px",
                      borderRadius: "10px",
                    }}
                  >
                    {ratio.icon}
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
            <div style={{ display: "flex", gap: 12 }}>
                <button 
                  onClick={() => cropperRef.current?.cropper.reset()}
                  className="btn-secondary"
                  style={{ height: 42, width: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, padding: 0 }}
                  title="Reset Crop"
                >
                  <RotateCcw size={18} />
                </button>
                <div style={{ width: 1, height: 42, backgroundColor: "var(--border-color)" }} />
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Original Size</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                        {imageDimensions?.width} × {imageDimensions?.height} px
                    </span>
                </div>
            </div>
            
            <div style={{ display: "flex", gap: 14 }}>
              <button
                onClick={onClose}
                className="btn-secondary"
                style={{ height: 44, padding: "0 28px", borderRadius: "12px", fontWeight: 600, fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="btn-primary"
                style={{
                  height: 44,
                  padding: "0 32px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 8px 20px -6px var(--wine-bg-strong)",
                }}
              >
                <Check size={20} />
                Confirm Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropResizeModal;
