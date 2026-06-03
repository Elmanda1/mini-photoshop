"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Sliders,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  Waves,
  ScanLine,
  Palette,
  Layers,
  Archive,
  Brain,
  ChevronDown,
  Sparkles,
  Crop,
  ArrowLeft,
  Check,
  X,
  Lock,
  Unlock
} from "lucide-react";

interface ColorWheelProps {
  color: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

function ColorWheel({ color, onChange, disabled }: ColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localHex, setLocalHex] = useState(color);

  // Sync color changes from external (e.g. mouse drag on wheel)
  useEffect(() => {
    setLocalHex(color.toUpperCase());
  }, [color]);

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 0, b: 0 };
  };

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s, v };
  };

  const hsvToRgb = (h: number, s: number, v: number) => {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
  };

  const rgb = hexToRgb(color);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  
  const angleRad = (hsv.h - 90) * (Math.PI / 180);
  const radiusPercent = hsv.s * 50;

  const handleX = 50 + Math.cos(angleRad) * radiusPercent;
  const handleY = 50 + Math.sin(angleRad) * radiusPercent;

  const handleInteract = (clientX: number, clientY: number) => {
    if (!wheelRef.current || disabled) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = clientX - rect.left - cx;
    const dy = clientY - rect.top - cy;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    let h = (angle + 90 + 360) % 360;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = rect.width / 2;
    const s = Math.min(dist / maxR, 1);

    const rgbVal = hsvToRgb(h, s, 1.0);
    const newHex = rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b);
    onChange(newHex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteract(e.clientX, e.clientY);
  };

  const handleTextChange = (val: string) => {
    const upperVal = val.toUpperCase();
    setLocalHex(upperVal);

    const formatted = upperVal.startsWith("#") ? upperVal : "#" + upperVal;
    if (/^#[0-9A-F]{6}$/.test(formatted) || /^#[0-9A-F]{3}$/.test(formatted)) {
      onChange(formatted);
    }
  };

  const handleBlur = () => {
    setLocalHex(color.toUpperCase());
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleInteract(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        ref={wheelRef}
        onMouseDown={handleMouseDown}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          position: "relative",
          cursor: disabled ? "not-allowed" : "crosshair",
          background: "radial-gradient(circle, #ffffff 0%, transparent 100%), conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid var(--border-color)",
          touchAction: "none",
          opacity: disabled ? 0.5 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: color,
            border: "2px solid #ffffff",
            boxShadow: "0 0 4px rgba(0,0,0,0.8)",
            left: `${handleX}%`,
            top: `${handleY}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: color,
            border: "1px solid var(--border-color)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        />
        <input
          type="text"
          value={localHex}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="#FFFFFF"
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            padding: "2px 6px",
            width: 75,
            textAlign: "center",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--wine-bg-strong)")}
        />
      </div>
    </div>
  );
}

interface ToolPanelProps {
  onApply: (module: string, operation: string, params: Record<string, any>, isPreview?: boolean) => void;
  onCancelPreview: () => void;
  hasImage: boolean;
  loading: boolean;
  imageDimensions: { width: number; height: number } | null;
  liveFilters: { brightness: number; contrast: number; hueShift: number; saturation: number; rotation: number; scale: number };
  setLiveFilters: (filters: any) => void;
  onOpenCropModal: () => void;
}

const SECTION_COLORS: Record<string, string> = {
  Enhancement: "var(--gold)",
  Transform: "var(--slate)",
  "Noise Reduction": "var(--sage)",
  "Edge & Binary": "var(--coral)",
  "Color Processing": "var(--wine-lighter)",
  Segmentation: "var(--blush)",
  Compression: "var(--cream)",
  "AI Recognition": "var(--wine-light)",
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const accentColor = SECTION_COLORS[title] || "var(--wine-light)";

  return (
    <div
      className={`section-accent ${open ? "active" : ""}`}
      style={{ borderBottom: "1px solid var(--border-color)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 16px",
          background: open ? "var(--bg-hover)" : "transparent",
          border: "none",
          color: "var(--text-primary)",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "var(--font-sans)",
          transition: "background 0.15s ease",
        }}
      >
        <span style={{ color: accentColor, display: "flex" }}>{icon}</span>
        <span style={{ flex: 1, textAlign: "left", letterSpacing: "-0.01em" }}>{title}</span>
        <span
          style={{
            color: "var(--text-muted)",
            display: "flex",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          <ChevronDown size={13} />
        </span>
      </button>
      {open && (
        <div className="animate-fade-in" style={{ padding: "6px 16px 16px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SliderControl({
  label, value, min, max, step, onChange, onMouseUp, unit,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; onMouseUp?: () => void; unit?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--wine-lighter)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
          {value}{unit || ""}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseUp={onMouseUp}
        onTouchEnd={onMouseUp}
      />
    </div>
  );
}


export default function ToolPanel({
  onApply, onCancelPreview, hasImage, loading, imageDimensions, liveFilters, setLiveFilters, onOpenCropModal
}: ToolPanelProps) {
  // Enhancement
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1.0);

  const handleBCChange = (b: number, c: number) => {
    setBrightness(b);
    setContrast(c);
    if (hasImage && !loading) {
      setLiveFilters({ ...liveFilters, brightness: b, contrast: c });
    }
  };

  const handleBCApply = () => {
    if (hasImage && !loading) {
      // Convert brightness -100...100 to multiplier 0.0...2.0
      const bMultiplier = 1 + (brightness / 100);
      onApply("enhance", "brightness_contrast", { brightness: bMultiplier, contrast }, false);
      setBrightness(0);
      setContrast(1.0);
      // Removed immediate setLiveFilters reset to avoid flicker
    }
  };

  const [sharpIntensity, setSharpIntensity] = useState(1.0);
  const [blurKernel, setBlurKernel] = useState(5);

  // Transform
  const [angle, setAngle] = useState(0);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(1.0);

  const handleRotateChange = (a: number) => {
    setAngle(a);
    if (hasImage && !loading) {
      setLiveFilters({ ...liveFilters, rotation: a });
    }
  };



  const handleRotateApply = () => {
    if (hasImage && !loading) {
      onApply("transform", "rotate", { angle }, false);
      setAngle(0);
    }
  };




  const handleTranslateChange = (x: number, y: number) => {
    setTx(x);
    setTy(y);
    if (hasImage && !loading) {
      onApply("transform", "translate", { tx: x, ty: y }, true);
    }
  };

  const handleTranslateApply = () => {
    if (hasImage && !loading) {
      onApply("transform", "translate", { tx, ty }, false);
      setTx(0);
      setTy(0);
    }
  };

  // Filter / noise
  const [filterKernel, setFilterKernel] = useState(5);
  const [noiseAmount, setNoiseAmount] = useState(0.05);

  // Edge
  const [edgeMethod, setEdgeMethod] = useState("canny");
  const [threshold1, setThreshold1] = useState(100);
  const [threshold2, setThreshold2] = useState(200);
  const [edgeKernel, setEdgeKernel] = useState(5);
  const [morphIterations, setMorphIterations] = useState(1);

  // Color Processing States & Effects
  const [colorMode, setColorMode] = useState<"normal" | "grayscale" | "channel" | "tint" | "huesat">("normal");
  const [colorChannel, setColorChannel] = useState<"r" | "g" | "b">("r");
  const [hueShift, setHueShift] = useState(0);
  const [satScale, setSatScale] = useState(1.0);
  const [tintColor, setTintColor] = useState("#8a2be2");
  const [tintIntensity, setTintIntensity] = useState(30);
  const [hasUnappliedColorChanges, setHasUnappliedColorChanges] = useState(false);

  // Trigger backend preview automatically when active states change
  useEffect(() => {
    if (!hasImage || loading) return;

    if (colorMode === "normal") {
      if (hasUnappliedColorChanges) {
        onCancelPreview();
        setHasUnappliedColorChanges(false);
      }
      return;
    }

    setHasUnappliedColorChanges(true);

    if (colorMode === "grayscale") {
      onApply("color", "grayscale", {}, true);
    } else if (colorMode === "channel") {
      onApply("color", "channel_split", { channel: colorChannel }, true);
    } else if (colorMode === "huesat") {
      onApply("color", "hue_saturation", { hue_shift: hueShift, saturation_scale: satScale }, true);
    } else if (colorMode === "tint") {
      onApply("color", "colorize", { hex_color: tintColor, intensity: tintIntensity / 100 }, true);
    }
  }, [colorMode, colorChannel, hueShift, satScale, tintColor, tintIntensity]);

  const handleColorApply = () => {
    if (!hasImage || loading) return;

    if (colorMode === "grayscale") {
      onApply("color", "grayscale", {}, false);
    } else if (colorMode === "channel") {
      onApply("color", "channel_split", { channel: colorChannel }, false);
    } else if (colorMode === "huesat") {
      onApply("color", "hue_saturation", { hue_shift: hueShift, saturation_scale: satScale }, false);
    } else if (colorMode === "tint") {
      onApply("color", "colorize", { hex_color: tintColor, intensity: tintIntensity / 100 }, false);
    }

    // Commit state
    setHasUnappliedColorChanges(false);
    setColorMode("normal");
  };

  const handleColorCancel = () => {
    onCancelPreview();
    setColorMode("normal");
    setHueShift(0);
    setSatScale(1.0);
    setTintIntensity(30);
    setHasUnappliedColorChanges(false);
  };

  // Segment
  const [segMethod, setSegMethod] = useState("threshold");
  const [segThreshold, setSegThreshold] = useState(127);
  const [numRegions, setNumRegions] = useState(3);

  // Compress
  const [compressQuality, setCompressQuality] = useState(80);

  const disabled = !hasImage || loading;


  return (
    <div
      className="animate-slide-left"
      style={{
        width: 272, minWidth: 272, height: "100%", overflowY: "auto",
        background: "var(--bg-secondary)", borderRight: "1px solid var(--border-color)",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border-color)",
        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span>Tools</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Enhancement — LIVE sliders + manual buttons */}
        <Section title="Enhancement" icon={<Sliders size={15} />} defaultOpen={true}>
          <SliderControl label="Brightness" value={brightness} min={-100} max={100} step={1} onChange={(v) => handleBCChange(v, contrast)} />
          <SliderControl label="Contrast" value={contrast} min={0.1} max={3.0} step={0.1} onChange={(v) => handleBCChange(brightness, v)} unit="x" />
          <button className="btn-primary" style={{ width: "100%", marginBottom: 12 }} disabled={disabled || (brightness === 0 && contrast === 1.0)}
            onClick={handleBCApply}>Apply Enhancement</button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <button
              className="btn-primary"
              style={{
                height: 48,
                background: "linear-gradient(135deg, var(--wine-bg-strong) 0%, #4a0e0e 100%)",
                border: "1px solid var(--border-wine)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                padding: "4px 8px",
                lineHeight: 1.1,
              }}
              disabled={disabled}
              onClick={() => onApply("enhance", "smart_enhance", {})}
            >
              <span>Smart Enhance</span>
            </button>
            <button className="btn-secondary" style={{ height: 48, fontSize: 11, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, padding: "4px 8px", lineHeight: 1.1 }}
              disabled={disabled} onClick={() => onApply("enhance", "histogram_eq", {})}>
              <span>Hist EQ</span>
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <button className="btn-secondary" style={{ height: 38, fontSize: 11 }} disabled={disabled}
              onClick={() => onApply("enhance", "sharpen", { intensity: sharpIntensity })}>Sharpen</button>
            <button className="btn-secondary" style={{ height: 38, fontSize: 11 }} disabled={disabled}
              onClick={() => onApply("enhance", "blur", { kernel_size: blurKernel })}>Blur</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <SliderControl label="Sharpen Intensity" value={sharpIntensity} min={0.5} max={3.0} step={0.1} onChange={setSharpIntensity} />
            <SliderControl label="Blur Kernel" value={blurKernel} min={3} max={31} step={2} onChange={setBlurKernel} />
          </div>
        </Section>

        {/* Transform — LIVE sliders + manual buttons */}
        <Section title="Transform" icon={<RotateCw size={15} />}>
          <SliderControl label="Rotation" value={angle} min={0} max={360} step={1} onChange={handleRotateChange} unit="°" />
          <button className="btn-primary" style={{ width: "100%", marginBottom: 8 }} disabled={disabled || angle === 0}
            onClick={handleRotateApply}>Apply Rotation</button>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            <button className="btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} disabled={disabled}
              onClick={() => onApply("transform", "flip", { flip_code: 1 })}><FlipHorizontal2 size={13} /> H-Flip</button>
            <button className="btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} disabled={disabled}
              onClick={() => onApply("transform", "flip", { flip_code: 0 })}><FlipVertical2 size={13} /> V-Flip</button>
          </div>
          <SliderControl label="Translate X" value={tx} min={-500} max={500} step={1} onChange={(x) => handleTranslateChange(x, ty)} unit="px" />
          <SliderControl label="Translate Y" value={ty} min={-500} max={500} step={1} onChange={(y) => handleTranslateChange(tx, y)} unit="px" />
          <button className="btn-primary" style={{ width: "100%", marginBottom: 10 }} disabled={disabled || (tx === 0 && ty === 0)}
            onClick={handleTranslateApply}>Apply Translate</button>

          {/* Scaling */}
          <div style={{ height: "1px", background: "var(--border-color)", margin: "10px 0" }} />

          {/* ✅ PERBAIKAN: handleScaleChange + setLiveFilters */}
          <SliderControl
            label="Scale"
            value={scale}
            min={0.1}
            max={3.0}
            step={0.05}
            onChange={(s) => {
              setScale(s);
              if (hasImage && !loading) {
                setLiveFilters({ ...liveFilters, scale: s });
              }
            }}
            unit="x"
          />

          {imageDimensions && (
            <div style={{
              fontSize: 10, color: "var(--text-muted)",
              marginBottom: 8, fontFamily: "var(--font-mono)"
            }}>
              → {Math.round(imageDimensions.width * scale)} ×{" "}
              {Math.round(imageDimensions.height * scale)} px
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: "100%", marginBottom: 10 }}
            disabled={disabled || scale === 1.0}
            onClick={() => {
              if (hasImage && !loading) {
                onApply("transform", "resize", { scale }, false);
                setScale(1.0);
              }
            }}
          >
            Apply Scale
          </button>

          <div style={{ height: "1px", background: "var(--border-color)", margin: "10px 0" }} />




          <button
            className="btn-secondary"
            style={{ width: "100%", background: "var(--bg-elevated)", borderColor: "var(--wine-light)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            disabled={disabled}
            onClick={onOpenCropModal}
          >
            <Crop size={14} /> Crop (C)
          </button>
        </Section>
        {/* Noise Reduction */}
        <Section title="Noise Reduction" icon={<Waves size={15} />}>
          <SliderControl label="Kernel Size" value={filterKernel} min={3} max={31} step={2} onChange={setFilterKernel} />
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            <button className="btn-secondary" style={{ flex: 1 }} disabled={disabled}
              onClick={() => onApply("filter", "gaussian", { kernel_size: filterKernel })}>Gaussian</button>
            <button className="btn-secondary" style={{ flex: 1 }} disabled={disabled}
              onClick={() => onApply("filter", "median", { kernel_size: filterKernel })}>Median</button>
          </div>
          <SliderControl label="Noise Amount" value={noiseAmount} min={0.01} max={0.5} step={0.01} onChange={setNoiseAmount} />
          <button className="btn-secondary" style={{ width: "100%" }} disabled={disabled}
            onClick={() => onApply("filter", "add_noise", { noise_amount: noiseAmount })}>Add S&P Noise</button>
        </Section>

        {/* Edge Detection */}
        <Section title="Edge & Binary" icon={<ScanLine size={15} />}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 5, fontWeight: 500 }}>Method</span>
            <select value={edgeMethod} onChange={(e) => setEdgeMethod(e.target.value)} style={{ width: "100%" }}>
              <option value="canny">Canny</option>
              <option value="sobel">Sobel</option>
              <option value="prewitt">Prewitt</option>
              <option value="robert">Robert</option>
              <option value="laplacian">Laplacian</option>
              <option value="log">LoG</option>
            </select>
          </div>
          <SliderControl label="Threshold 1" value={threshold1} min={0} max={255} step={1} onChange={setThreshold1} />
          <SliderControl label="Threshold 2" value={threshold2} min={0} max={255} step={1} onChange={setThreshold2} />
          <button className="btn-primary" style={{ width: "100%", marginBottom: 8 }} disabled={disabled}
            onClick={() => onApply("edge", edgeMethod, { threshold1, threshold2, kernel_size: edgeKernel })}>Detect Edges</button>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            <button className="btn-secondary" style={{ flex: 1 }} disabled={disabled}
              onClick={() => onApply("edge", "threshold", { thresh_value: threshold1 })}>Threshold</button>
            <button className="btn-secondary" style={{ flex: 1 }} disabled={disabled}
              onClick={() => onApply("edge", "erosion", { kernel_size: edgeKernel, iterations: morphIterations })}>Erode</button>
            <button className="btn-secondary" style={{ flex: 1 }} disabled={disabled}
              onClick={() => onApply("edge", "dilation", { kernel_size: edgeKernel, iterations: morphIterations })}>Dilate</button>
          </div>
          <SliderControl label="Morph Kernel" value={edgeKernel} min={3} max={15} step={2} onChange={setEdgeKernel} />
          <SliderControl label="Iterations" value={morphIterations} min={1} max={10} step={1} onChange={setMorphIterations} />
        </Section>

        {/* Color Processing — PREVIEW & COMMIT SYSTEM */}
        <Section title="Color Processing" icon={<Palette size={15} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Mode selection buttons */}
            <div>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Adjustment Mode
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { mode: "grayscale", label: "Grayscale" },
                  { mode: "channel", label: "Channel Split" },
                  { mode: "tint", label: "Color Tint" },
                  { mode: "huesat", label: "Hue / Sat" },
                ].map((item) => (
                  <button
                    key={item.mode}
                    disabled={disabled}
                    onClick={() => setColorMode(item.mode as any)}
                    className={colorMode === item.mode ? "btn-primary" : "btn-secondary"}
                    style={{
                      height: 28,
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 6,
                      padding: 0,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Controls */}
            {colorMode === "grayscale" && (
              <div style={{ padding: "10px 12px", background: "var(--bg-elevated)", border: "1px dashed var(--border-color)", borderRadius: 8, textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  Previewing Grayscale. Click Apply to commit.
                </span>
              </div>
            )}

            {colorMode === "channel" && (
              <div>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Select B&W Channel
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { ch: "r", color: "#C96B6B", label: "Red" },
                    { ch: "g", color: "#7A9B7E", label: "Green" },
                    { ch: "b", color: "#8A9BAD", label: "Blue" },
                  ].map(({ ch, color, label }) => (
                    <button
                      key={ch}
                      disabled={disabled}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        height: 32,
                        fontSize: 11,
                        fontWeight: 700,
                        color: colorChannel === ch ? color : "var(--text-secondary)",
                        borderColor: colorChannel === ch ? `${color}70` : "var(--border-color)",
                        background: colorChannel === ch ? `${color}15` : "var(--bg-elevated)",
                      }}
                      onClick={() => setColorChannel(ch as any)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colorMode === "tint" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", display: "block", textAlign: "center", marginBottom: -4 }}>
                  Drag to Pick Color
                </span>
                
                {/* Circular color picker wheel */}
                <ColorWheel color={tintColor} onChange={setTintColor} disabled={disabled} />

                <SliderControl
                  label="Tint Intensity"
                  value={tintIntensity}
                  min={1}
                  max={100}
                  step={1}
                  onChange={setTintIntensity}
                  unit="%"
                />
              </div>
            )}

            {colorMode === "huesat" && (
              <div>
                <SliderControl
                  label="Hue Shift"
                  value={hueShift}
                  min={-180}
                  max={180}
                  step={1}
                  onChange={setHueShift}
                  unit="°"
                />
                <SliderControl
                  label="Saturation"
                  value={satScale}
                  min={0.0}
                  max={3.0}
                  step={0.1}
                  onChange={setSatScale}
                  unit="x"
                />
              </div>
            )}

            {/* Commit / Cancel controls */}
            {hasUnappliedColorChanges && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                <button
                  className="btn-primary"
                  style={{
                    width: "100%",
                    height: 36,
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: "var(--wine-bg-strong)",
                    borderColor: "var(--border-wine)",
                    color: "var(--wine-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                  onClick={handleColorApply}
                >
                  <Check size={14} /> Apply Color Processing
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    width: "100%",
                    height: 34,
                    fontSize: 11,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                  onClick={handleColorCancel}
                >
                  <X size={14} /> Cancel Preview
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* Segmentation */}
        <Section title="Segmentation" icon={<Layers size={15} />}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 5, fontWeight: 500 }}>Method</span>
            <select value={segMethod} onChange={(e) => setSegMethod(e.target.value)} style={{ width: "100%" }}>
              <option value="threshold">Threshold</option>
              <option value="edge">Edge-based</option>
              <option value="region">Region (K-means)</option>
            </select>
          </div>
          {segMethod !== "region" ? (
            <SliderControl label="Threshold" value={segThreshold} min={0} max={255} step={1} onChange={setSegThreshold} />
          ) : (
            <SliderControl label="Regions" value={numRegions} min={2} max={10} step={1} onChange={setNumRegions} />
          )}
          <button className="btn-primary" style={{ width: "100%" }} disabled={disabled}
            onClick={() => onApply("segment", segMethod, { threshold: segThreshold, threshold1, threshold2, num_regions: numRegions })}>Segment</button>
        </Section>

        {/* Compression */}
        <Section title="Compression" icon={<Archive size={15} />}>
          <SliderControl label="JPEG Quality" value={compressQuality} min={1} max={100} step={1} onChange={setCompressQuality} unit="%" />
          <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} disabled={disabled}
            onClick={() => {
              console.log("[DEBUG] ToolPanel sending compression quality:", compressQuality);
              onApply("compress", "jpeg", { quality: Math.round(compressQuality) }, false);
              setCompressQuality(80); // ✅ Reset to default after apply
            }}>Apply Compression</button>
        </Section>

        {/* AI Recognition */}
        <Section title="AI Recognition" icon={<Brain size={15} />}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.6 }}>
            Use MobileNetV2 CNN to classify image content. Returns top-5 predictions with confidence scores.
          </p>
          <button className="btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            disabled={disabled}
            onClick={() => onApply("ml", "recognize", {})}>
            <Sparkles size={14} /> Recognize Object
          </button>
        </Section>
      </div>
    </div>
  );
}
