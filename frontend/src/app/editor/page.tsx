"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import ImageCanvas from "@/components/ImageCanvas";
import ToolPanel from "@/components/ToolPanel";
import HistogramChart from "@/components/HistogramChart";
import MLResult from "@/components/MLResult";
import {
  applyEnhancement,
  applyTransform,
  applyFilter,
  applyEdge,
  applyColor,
  applySegmentation,
  applyCompression,
  getHistogram,
  recognizeObject,
} from "@/lib/api";
import {
  RotateCcw,
  Download,
  BarChart3,
  Activity,
  ArrowLeft,
  Upload,
} from "lucide-react";
import Link from "next/link";

/**
 * Single-image live editor.
 * No comparison view — just one image that updates in real-time.
 * Reset returns to the original uploaded image.
 */

const LIVE_OPERATIONS = new Set([
  "brightness_contrast",
  "hue_saturation",
  "jpeg",
  "rotate",
  "resize",
  "translate"
]);

export default function EditorPage() {
  useEffect(() => {
    document.body.classList.add("editor-mode");
    return () => document.body.classList.remove("editor-mode");
  }, []);

  // The original uploaded image (never changes, used for reset)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  // The base for live operations (updated after destructive ops)
  const [baseImage, setBaseImage] = useState<string | null>(null);
  // The currently displayed image
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showHistogram, setShowHistogram] = useState(false);
  const [histData, setHistData] = useState<any>(null);

  const [mlResult, setMlResult] = useState<any>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Track the last live operation so we can commit changes if the user switches tools
  const lastOperationRef = useRef<string | null>(null);

  const liveRequestId = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = useCallback(async (base64: string) => {
    setUploadedImage(base64);
    setBaseImage(base64);
    setDisplayImage(base64);
    setMlResult(null);
    setCompressionInfo(null);

    try {
      const hist = await getHistogram(base64);
      setHistData(hist);
    } catch {}

    showToast("Image loaded");
  }, []);

  const handleReset = () => {
    if (!uploadedImage) return;
    setBaseImage(uploadedImage);
    setDisplayImage(uploadedImage);
    setMlResult(null);
    setCompressionInfo(null);
    showToast("Reset to original");

    // Update histogram
    getHistogram(uploadedImage).then(setHistData).catch(() => {});
  };

  const handleSave = () => {
    if (!displayImage) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${displayImage}`;
    link.download = "mini-photoshop-output.png";
    link.click();
    showToast("Image saved");
  };

  const handleNewImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      handleImageUpload(base64);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleApply = useCallback(
    async (
      module: string,
      operation: string,
      params: Record<string, any>
    ) => {
      const isLive = LIVE_OPERATIONS.has(operation);
      
      // If we switched to a different live operation (e.g. from rotate to brightness),
      // we must commit the previous displayImage as the new baseImage to prevent losing the edit.
      if (isLive && lastOperationRef.current && lastOperationRef.current !== operation && displayImage) {
        setBaseImage(displayImage);
      }
      
      if (isLive) {
        lastOperationRef.current = operation;
      } else {
        lastOperationRef.current = null; // reset on manual ops
      }

      // Live ops use the *current* baseImage (which might have just been updated above)
      // Manual ops use displayImage if available, else baseImage
      const currentBase = (isLive && lastOperationRef.current && lastOperationRef.current !== operation && displayImage) 
          ? displayImage 
          : baseImage;
          
      const sourceImage = isLive ? currentBase : (displayImage || baseImage);

      if (!sourceImage) return;

      setLoading(true); // Always show loading (skeleton on canvas)

      const requestId = ++liveRequestId.current;

      try {
        let result: any;

        switch (module) {
          case "enhance":
            result = await applyEnhancement(sourceImage, operation, params);
            break;
          case "transform":
            result = await applyTransform(sourceImage, operation, params);
            break;
          case "filter":
            result = await applyFilter(sourceImage, operation, params);
            break;
          case "edge":
            result = await applyEdge(sourceImage, operation, params);
            break;
          case "color":
            result = await applyColor(sourceImage, operation, params);
            break;
          case "segment":
            result = await applySegmentation(sourceImage, operation, params);
            break;
          case "compress":
            result = await applyCompression(sourceImage, params.quality || 80);
            if (result.compression_ratio) {
              setCompressionInfo({
                original: result.original_size,
                compressed: result.compressed_size,
                ratio: result.compression_ratio,
                quality: result.quality,
              });
            }
            break;
          case "ml":
            setMlLoading(true);
            result = await recognizeObject(sourceImage);
            setMlResult(result);
            setMlLoading(false);
            setLoading(false);
            return;
          default:
            showToast(`Unknown module: ${module}`);
            setLoading(false);
            return;
        }

        // Discard stale live results
        if (isLive && requestId !== liveRequestId.current) return;

        if (result?.image) {
          setDisplayImage(result.image);

          // Destructive ops commit as new base
          if (!isLive) {
            setBaseImage(result.image);
            showToast(`Applied: ${operation}`);
          }

          // Update histogram
          try {
            const hist = await getHistogram(result.image);
            if (!isLive || requestId === liveRequestId.current) {
              setHistData(hist);
            }
          } catch {}
        } else if (result?.error) {
          showToast(`Error: ${result.error}`);
        }
      } catch (err: any) {
        if (!isLive) {
          showToast(
            `Failed: ${err?.response?.data?.detail || err.message || "Unknown error"}`
          );
        }
      }

      setLoading(false);
    },
    [baseImage, displayImage]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      {/* ═══ Toolbar ═══ */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: 48,
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
          gap: 8,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn-icon" title="Back to Home">
            <ArrowLeft size={15} />
          </button>
        </Link>

        <div style={{ width: 1, height: 22, background: "var(--border-color)" }} />

        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>
          <span style={{ color: "var(--wine-light)" }}>Mini</span>{" "}
          <span style={{ color: "var(--text-primary)" }}>Photoshop</span>
        </span>

        <div style={{ width: 1, height: 22, background: "var(--border-color)", margin: "0 2px" }} />

        {/* Actions */}
        <button
          className="btn-icon tooltip"
          data-tooltip="New Image"
          onClick={handleNewImage}
        >
          <Upload size={14} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/bmp"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        <button
          className="btn-icon tooltip"
          data-tooltip="Save"
          onClick={handleSave}
          disabled={!displayImage}
        >
          <Download size={14} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Reset — prominent */}
        {uploadedImage && displayImage !== uploadedImage && (
          <button
            onClick={handleReset}
            style={{
              background: "var(--wine-bg-strong)",
              color: "var(--wine-lighter)",
              border: "1px solid var(--border-wine)",
              borderRadius: "var(--radius-md)",
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.2s ease",
              fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--wine)";
              e.currentTarget.style.color = "var(--ivory)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--wine-bg-strong)";
              e.currentTarget.style.color = "var(--wine-lighter)";
            }}
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}

        {/* Histogram toggle */}
        <button
          className="btn-icon"
          style={{
            background: showHistogram ? "var(--wine-bg-strong)" : "transparent",
            color: showHistogram ? "var(--wine-light)" : "var(--text-muted)",
          }}
          onClick={() => setShowHistogram(!showHistogram)}
          title="Toggle Histogram"
        >
          <BarChart3 size={14} />
        </button>
      </header>

      {/* ═══ Main ═══ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: Tools */}
        <ToolPanel onApply={handleApply} hasImage={!!uploadedImage} loading={loading} />

        {/* Center: Single canvas */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <ImageCanvas
              currentImage={displayImage}
              onImageUpload={handleImageUpload}
              loading={loading}
            />
          </div>

          {/* Histogram — single view of current image */}
          {showHistogram && (
            <div
              className="animate-slide-up"
              style={{
                borderTop: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 14px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <Activity size={11} style={{ color: "var(--wine-light)" }} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Histogram
                </span>
              </div>
              <HistogramChart
                beforeData={histData}
                afterData={null}
                showComparison={false}
              />
            </div>
          )}
        </div>

        {/* Right: Properties */}
        <div
          className="animate-slide-right"
          style={{
            width: 250,
            minWidth: 250,
            background: "var(--bg-secondary)",
            borderLeft: "1px solid var(--border-color)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-color)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
            }}
          >
            Properties
          </div>

          {uploadedImage && (
            <div
              className="animate-fade-in"
              style={{
                padding: 16,
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                }}
              >
                Status
              </p>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {displayImage !== uploadedImage ? (
                  <span className="badge badge-wine">Edited</span>
                ) : (
                  <span className="badge badge-slate">Original</span>
                )}
                {loading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <div className="spinner" style={{ width: 14, height: 14 }} />
                    <span style={{ color: "var(--wine-light)", fontSize: 12 }}>
                      Processing...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {compressionInfo && (
            <div
              className="animate-fade-in"
              style={{
                padding: 16,
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                }}
              >
                Compression
              </p>
              <div
                style={{
                  background: "var(--wine-bg)",
                  border: "1px solid var(--border-wine)",
                  borderRadius: "var(--radius-md)",
                  padding: 14,
                  fontSize: 12,
                  lineHeight: 2,
                }}
              >
                <div>
                  Original:{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {(compressionInfo.original / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div>
                  Compressed:{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {(compressionInfo.compressed / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div>
                  Ratio:{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--sage)",
                      fontWeight: 600,
                    }}
                  >
                    {compressionInfo.ratio}x
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <p
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                padding: "12px 16px 0",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              AI Recognition
            </p>
            <MLResult result={mlResult} loading={mlLoading} />
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
