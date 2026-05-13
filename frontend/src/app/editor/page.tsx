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
import CropResizeModal from "@/components/CropResizeModal";

import {
  RotateCcw,
  Download,
  BarChart3,
  ArrowLeft,
  Upload,
  Home,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  Undo2,
  Redo2
} from "lucide-react";
import Link from "next/link";

const MenuButton = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ position: "relative", padding: "4px 8px", cursor: "pointer", background: open ? "var(--bg-elevated)" : "transparent" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {label}
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, background: "var(--bg-elevated)",
          border: "1px solid var(--border-color)", minWidth: 180, zIndex: 100,
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)", padding: "4px 0", borderRadius: 4
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ label, onClick, shortcut, disabled }: { label: string; onClick?: () => void; shortcut?: string; disabled?: boolean }) => (
  <div
    style={{
      padding: "6px 16px", fontSize: 12, display: "flex", justifyContent: "space-between",
      color: disabled ? "var(--text-muted)" : "var(--text-primary)",
      cursor: disabled ? "default" : "pointer",
      background: "transparent"
    }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "var(--bg-hover)"; }}
    onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = "transparent"; }}
    onClick={() => { if (!disabled && onClick) onClick(); }}
  >
    <span>{label}</span>
    {shortcut && <span style={{ color: "var(--text-muted)" }}>{shortcut}</span>}
  </div>
);

/**
 * Single-image live editor.
 * No comparison view — just one image that updates in real-time.
 * Reset returns to the original uploaded image.
 */

const LIVE_OPERATIONS = new Set([
  "brightness_contrast",
  "hue_saturation",
  "jpeg"
]);

const formatOpDetails = (op: string, params: any) => {
  const name = op.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  let details = "";

  if (!params || Object.keys(params).length === 0) return name;

  if (op === "brightness_contrast") details = `B: ${params.brightness}, C: ${params.contrast}`;
  else if (op === "hue_saturation") details = `Hue: ${params.hue_shift}°, Sat: ${params.saturation_scale}x`;
  else if (op === "jpeg") details = `Quality: ${params.quality}%`;
  else if (op === "rotate") details = `Angle: ${params.angle}°`;
  else if (op === "resize") details = `Scale: ${params.scale}x`;
  else if (op === "translate") details = `X: ${params.tx}px, Y: ${params.ty}px`;
  else if (op === "flip") details = params.flip_code === 1 ? "Horizontal" : "Vertical";
  else if (op === "gaussian" || op === "median" || op === "blur") details = `Kernel: ${params.kernel_size}`;
  else if (op === "sharpen") details = `Intensity: ${params.intensity}`;
  else if (op === "add_noise") details = `Amount: ${params.noise_amount}`;
  else if (op === "segment") details = `Method: ${params.method || "auto"}`;

  return details ? `${name} (${details})` : name;
};

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
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const [exportFormat, setExportFormat] = useState("png");
  const [exportQuality, setExportQuality] = useState(90);

  const [zoom, setZoom] = useState(1);
  const [resetKey, setResetKey] = useState(0);
const [liveFilters, setLiveFilters] = useState({
  brightness: 0,
  contrast: 1.0,
  hueShift: 0,
  saturation: 1.0,
  rotation: 0,
  scale: 1.0,
});

  const [historyState, setHistoryState] = useState<{
    list: { image: string; log: string[] }[];
    index: number;
  }>({ list: [], index: -1 });

  const editLog = historyState.list[historyState.index]?.log || [];

  // Ref to hold the fast preview image (compressed)
  const previewImageRef = useRef<{ base: string; preview: string } | null>(null);

  const getPreviewImage = async (base64: string): Promise<string> => {
    if (previewImageRef.current?.base === base64) {
      return previewImageRef.current.preview;
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const maxWidth = 800; // compress for smooth preview
        if (width <= maxWidth) {
          previewImageRef.current = { base: base64, preview: base64 };
          resolve(base64);
          return;
        }
        const scale = maxWidth / width;
        width = maxWidth;
        height = height * scale;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(base64);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        const previewBase64 = dataUrl.split(",")[1];
        previewImageRef.current = { base: base64, preview: previewBase64 };
        resolve(previewBase64);
      };
      img.onerror = () => resolve(base64);
      img.src = `data:image/png;base64,${base64}`;
    });
  };

  // Track the last live operation so we can commit changes if the user switches tools
  const lastOperationRef = useRef<{ op: string; params: any } | null>(null);

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

    setHistoryState({
      list: [{ image: base64, log: [] }],
      index: 0
    });
    setResetKey((k) => k + 1);

    try {

      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = `data:image/png;base64,${base64}`;

      const hist = await getHistogram(base64);
      setHistData(hist);
    } catch { }

    showToast("Image loaded");
  }, []);


  const handleReset = () => {
    if (!uploadedImage) return;

    // 1. Stop any pending live operations
    if (liveTimeout.current) {
      clearTimeout(liveTimeout.current);
      liveTimeout.current = null;
    }
    // Increment requestId to discard any currently flying backend responses
    liveRequestId.current++;
    
    setLoading(false);
    setMlLoading(false);

    // 2. Reset images
    setBaseImage(uploadedImage);
    setDisplayImage(uploadedImage);
    setMlResult(null);
    setCompressionInfo(null);

    // 3. Reset filters & UI states
    setLiveFilters({
      brightness: 0,
      contrast: 1.0,
      hueShift: 0,
      saturation: 1.0,
      rotation: 0,
      scale: 1.0,
    });
    setZoom(1);
    setResetKey((k) => k + 1);


    setHistoryState({
      list: [{ image: uploadedImage, log: [] }],
      index: 0
    });

    showToast("Reset to original (All processes stopped)");

    // Update histogram
    getHistogram(uploadedImage).then(setHistData).catch(() => { });
  };


  const handleSave = () => {
    if (!displayImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const hasFilters =
        liveFilters.brightness !== 0 ||
        liveFilters.contrast !== 1.0 ||
        liveFilters.hueShift !== 0 ||
        liveFilters.saturation !== 1.0;

      if (hasFilters) {
        // Bake CSS filter yang sedang aktif ke canvas
        ctx.filter = `
          brightness(${100 * (1 + liveFilters.brightness / 100)}%)
          contrast(${100 * liveFilters.contrast}%)
          hue-rotate(${liveFilters.hueShift}deg)
          saturate(${100 * liveFilters.saturation}%)
        `;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "mini-photoshop-output.png";
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = `data:image/png;base64,${displayImage}`;
    showToast("Quick Save (PNG)");
  };

  const handleExport = () => {
    if (!displayImage) return;
    setLoading(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setLoading(false);
        return;
      }

      const hasFilters =
        liveFilters.brightness !== 0 ||
        liveFilters.contrast !== 1.0 ||
        liveFilters.hueShift !== 0 ||
        liveFilters.saturation !== 1.0;

      if (hasFilters) {
        ctx.filter = `
          brightness(${100 * (1 + liveFilters.brightness / 100)}%)
          contrast(${100 * liveFilters.contrast}%)
          hue-rotate(${liveFilters.hueShift}deg)
          saturate(${100 * liveFilters.saturation}%)
        `;
      }
      ctx.drawImage(img, 0, 0);

      let mimeType = "image/png";
      let extension = "png";

      if (exportFormat === "jpg") {
        mimeType = "image/jpeg";
        extension = "jpg";
      } else if (exportFormat === "webp") {
        mimeType = "image/webp";
        extension = "webp";
      }

      const quality = exportQuality / 100;
      const dataUrl = canvas.toDataURL(mimeType, quality);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `mini-photoshop-export.${extension}`;
      link.click();

      setLoading(false);
      showToast(`Exported as ${exportFormat.toUpperCase()}`);
    };
    img.onerror = () => {
      setLoading(false);
      showToast("Export failed");
    };
    img.src = `data:image/png;base64,${displayImage}`;
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

  const pushHistory = useCallback((newImage: string, newOpDetail: string) => {
    setBaseImage(newImage);

    setHistoryState((prev) => {
      const currentLog = prev.list[prev.index]?.log || [];
      const nextLog = [...currentLog, newOpDetail];
      const newList = prev.list.slice(0, prev.index + 1);
      newList.push({ image: newImage, log: nextLog });

      if (newList.length > 20) {
        newList.shift();
      }
      return { list: newList, index: newList.length - 1 };
    });
  }, []);

  const lastLiveCall = useRef<number>(0);
  const liveTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleApply = useCallback(
    async (
      module: string,
      operation: string,
      params: Record<string, any>,
      isPreview: boolean = false
    ) => {
      const isLive = isPreview;

      if (isLive) {
        const now = Date.now();
        if (now - lastLiveCall.current < 150) {
          if (liveTimeout.current) clearTimeout(liveTimeout.current);
          liveTimeout.current = setTimeout(() => {
            handleApply(module, operation, params, true);
          }, 150);
          return;
        }
        lastLiveCall.current = now;
        lastOperationRef.current = { op: operation, params };
      } else {
        lastOperationRef.current = null; // reset on manual ops
        if (liveTimeout.current) clearTimeout(liveTimeout.current);
      }

      // Live ops use the *current* baseImage
      const currentBase = baseImage;

      const rawSourceImage = currentBase || displayImage;

      if (!rawSourceImage) return;

      // setLoading(true); // Removed to prevent canvas flicker during apply

      const sourceImage = isLive ? await getPreviewImage(rawSourceImage) : rawSourceImage;

      // All operations (including live previews) are now processed by the backend.
      // This ensures 100% pixel-perfect consistency between the preview and the final applied image,
      // preventing visual jumps caused by CSS filter math differing from OpenCV math.

      const requestId = ++liveRequestId.current;

      try {
        let result: any;
        if (module === "compress") {
          console.log(`[DEBUG] Compression - Module: ${module}, Op: ${operation}, Quality: ${params.quality}`);
        }

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
          if (!isLive) {
            // ZERO FLICKER: Keep the old state visible (including filters) until the new image is physically ready
            const img = new Image();
            img.onload = () => {
              // Now that the new bits are in the browser's memory, we swap everything at once
              setDisplayImage(result.image);
              setLiveFilters({ brightness: 0, contrast: 1.0, hueShift: 0, saturation: 1.0, rotation: 0, scale: 1.0 });
              setImageDimensions({ width: img.width, height: img.height });
              
              const detailStr = formatOpDetails(operation, params);
              pushHistory(result.image, detailStr);
              showToast(`Applied: ${operation}`);
              setLoading(false);
            };
            img.onerror = () => {
              setLoading(false);
              showToast("Failed to render result");
            };
            img.src = `data:image/png;base64,${result.image}`;
            return;
          } else {
            setDisplayImage(result.image);
          }
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
    [baseImage, displayImage, pushHistory]
  );

  const handleUndo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index > 0) {
        const newIdx = prev.index - 1;
        const state = prev.list[newIdx];
        setBaseImage(state.image);
        setDisplayImage(state.image);

        const img = new Image();
        img.onload = () => setImageDimensions({ width: img.width, height: img.height });
        img.src = `data:image/png;base64,${state.image}`;

        lastOperationRef.current = null;
        setLiveFilters({ brightness: 0, contrast: 1.0, hueShift: 0, saturation: 1.0, rotation: 0, scale: 1.0 });
        getHistogram(state.image).then(setHistData).catch(() => { });
        return { ...prev, index: newIdx };
      }
      return prev;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index < prev.list.length - 1) {
        const newIdx = prev.index + 1;
        const state = prev.list[newIdx];
        setBaseImage(state.image);
        setDisplayImage(state.image);

        const img = new Image();
        img.onload = () => setImageDimensions({ width: img.width, height: img.height });
        img.src = `data:image/png;base64,${state.image}`;

        lastOperationRef.current = null;
        setLiveFilters({ brightness: 0, contrast: 1.0, hueShift: 0, saturation: 1.0, rotation: 0, scale: 1.0 });
        getHistogram(state.image).then(setHistData).catch(() => { });
        return { ...prev, index: newIdx };
      }
      return prev;
    });
  }, []);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          if (historyState.index > 0) handleUndo();
        } else if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
          e.preventDefault();
          if (historyState.index < historyState.list.length - 1) handleRedo();
        }
      } else {
        if (e.key.toLowerCase() === "c" && uploadedImage && !isCropModalOpen) {
          e.preventDefault();
          setIsCropModalOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyState.index, historyState.list.length, handleUndo, handleRedo]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      {/* ═══ Top Menu Bar (Photoshop Style) ═══ */}
      <div style={{
        display: "flex", alignItems: "center", height: 28,
        background: "var(--bg-tertiary)", borderBottom: "1px solid var(--bg-primary)",
        padding: "0 12px", fontSize: 12, color: "var(--text-secondary)", gap: 16,
        userSelect: "none"
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em", paddingRight: 8 }}>
          <span style={{ color: "var(--wine-light)" }}>Mini</span>{" "}
          <span style={{ color: "var(--text-primary)" }}>Photoshop</span>
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <MenuButton label="File">
            <MenuItem label="New Image..." shortcut="Ctrl+N" onClick={handleNewImage} />
            <div style={{ height: 1, background: "var(--border-color)", margin: "4px 0" }} />
            <MenuItem label="Quick Save (PNG)" shortcut="Ctrl+S" disabled={!displayImage} onClick={handleSave} />
            <MenuItem label="Export As..." disabled={!displayImage} onClick={() => document.getElementById('export-panel')?.scrollIntoView({ behavior: 'smooth' })} />
          </MenuButton>
          <MenuButton label="Edit">
            <MenuItem label="Undo" shortcut="Ctrl+Z" disabled={historyState.index <= 0} onClick={handleUndo} />
            <MenuItem label="Redo" shortcut="Ctrl+Shift+Z" disabled={historyState.index >= historyState.list.length - 1} onClick={handleRedo} />
            <div style={{ height: 1, background: "var(--border-color)", margin: "4px 0" }} />
            <MenuItem label="Reset to Original" disabled={!uploadedImage || displayImage === uploadedImage} onClick={handleReset} />
          </MenuButton>
          <MenuButton label="Image">
            <MenuItem label="Adjustments" disabled />
            <MenuItem label="Image Size..." disabled />
            <MenuItem label="Canvas Size..." disabled />
          </MenuButton>
          <MenuButton label="Layer">
            <MenuItem label="New" disabled />
            <MenuItem label="Duplicate Layer..." disabled />
          </MenuButton>
          <MenuButton label="Filter">
            <MenuItem label="Noise" disabled />
            <MenuItem label="Blur" disabled />
            <MenuItem label="Sharpen" disabled />
          </MenuButton>
          <MenuButton label="View">
            <MenuItem label={showHistogram ? "Hide Histogram" : "Show Histogram"} onClick={() => setShowHistogram(!showHistogram)} />
          </MenuButton>
          <MenuButton label="Help">
            <MenuItem label="About Mini Photoshop" />
          </MenuButton>
        </div>
      </div>

      {/* ═══ Options Bar ═══ */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          height: 36,
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
          gap: 12,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex" }}>
          <button className="btn-icon" title="Home" style={{ padding: 4 }}>
            <Home size={15} />
          </button>
        </Link>
        <div style={{ width: 1, height: 18, background: "var(--border-color)" }} />

        {/* Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button className="btn-icon" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))} title="Zoom Out">
            <ZoomOut size={15} />
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
          <button className="btn-icon" onClick={() => setZoom((z) => Math.min(z + 0.25, 5))} title="Zoom In">
            <ZoomIn size={15} />
          </button>
          <button className="btn-icon" onClick={() => setZoom(1)} title="Fit">
            <Maximize2 size={15} />
          </button>
        </div>

        <div style={{ width: 1, height: 18, background: "var(--border-color)" }} />

        {/* Undo / Redo */}
        <div style={{ display: "flex", gap: 4 }}>
          <button className="btn-icon" title="Undo" disabled={historyState.index <= 0} onClick={handleUndo}>
            <Undo2 size={15} />
          </button>
          <button className="btn-icon" title="Redo" disabled={historyState.index >= historyState.list.length - 1} onClick={handleRedo}>
            <Redo2 size={15} />
          </button>
        </div>

        <div style={{ width: 1, height: 18, background: "var(--border-color)" }} />

        <label
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}
          onClick={() => setShowHistogram(!showHistogram)}
        >
          <div style={{ width: 12, height: 12, border: "1px solid var(--border-color)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", background: showHistogram ? "var(--wine-bg-strong)" : "transparent" }}>
            {showHistogram && <Check size={10} color="var(--wine-light)" />}
          </div>
          Show Histogram
        </label>

        <div style={{ flex: 1 }} />

        {uploadedImage && (
          <button
            className="btn-secondary"
            onClick={handleReset}
            title="Reset to Original"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, height: 24 }}
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}

        <div style={{ width: 8 }} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/bmp"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </header>

      {/* ═══ Main ═══ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: Tools */}
          <ToolPanel 
            key={resetKey}
            onApply={handleApply} 
            hasImage={!!uploadedImage} 
            loading={loading} 
            imageDimensions={imageDimensions}
            liveFilters={liveFilters}
            setLiveFilters={setLiveFilters}
            onOpenCropModal={() => setIsCropModalOpen(true)}
          />

        {/* Center: Single canvas */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <ImageCanvas
              originalImage={uploadedImage}
              currentImage={displayImage}
              onImageUpload={handleImageUpload}
              loading={loading}
              zoom={zoom}
              liveFilters={liveFilters}
              imageDimensions={imageDimensions}
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

                {editLog.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Edit History</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {editLog.map((logMsg, idx) => (
                        <div key={idx} style={{ fontSize: 11, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "var(--wine-light)", fontSize: 10 }}>•</span>
                          {logMsg}
                        </div>
                      ))}
                    </div>
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
          {/* Export As Section */}
          <div
            id="export-panel"
            className="animate-fade-in"
            style={{
              padding: 16,
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              Export As
            </p>

            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Format</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["png", "jpg", "webp"].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: exportFormat === fmt ? "var(--wine-bg-strong)" : "var(--bg-elevated)",
                      color: exportFormat === fmt ? "var(--wine-light)" : "var(--text-muted)",
                      borderColor: exportFormat === fmt ? "var(--wine-light)" : "var(--border-color)",
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {(exportFormat === "jpg" || exportFormat === "webp") && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Quality</span>
                  <span style={{ fontSize: 11, color: "var(--wine-light)", fontWeight: 700 }}>{exportQuality}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={exportQuality}
                  onChange={(e) => setExportQuality(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--wine-light)" }}
                />
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onClick={handleExport}
              disabled={!displayImage || loading}
            >
              <Download size={14} /> Export Image
            </button>
          </div>

          <div
            className="animate-fade-in"
            style={{
              padding: 16,
              marginTop: "auto",
              borderTop: "1px solid var(--border-color)",
              background: "rgba(146, 26, 26, 0.05)",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "var(--wine-light)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
            </p>
          </div>
        </div>
      </div>

      <CropResizeModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onApply={handleApply}
        image={displayImage}
        imageDimensions={imageDimensions}
      />

      {toast && <div className="toast">{toast}</div>}

    </div>
  );
}
