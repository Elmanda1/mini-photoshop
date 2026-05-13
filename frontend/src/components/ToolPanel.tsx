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

interface ToolPanelProps {
  onApply: (module: string, operation: string, params: Record<string, any>, isPreview?: boolean) => void;
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
  onApply, hasImage, loading, imageDimensions, liveFilters, setLiveFilters, onOpenCropModal
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

  // Color
  const [colorChannel, setColorChannel] = useState("r");
  const [hueShift, setHueShift] = useState(0);
  const [satScale, setSatScale] = useState(1.0);

  const handleHSChange = (h: number, s: number) => {
    setHueShift(h);
    setSatScale(s);
    if (hasImage && !loading) {
      setLiveFilters({ ...liveFilters, hueShift: h, saturation: s });
    }
  };

  const handleHSApply = () => {
    if (hasImage && !loading) {
      onApply("color", "hue_saturation", { hue_shift: hueShift, saturation_scale: satScale }, false);
      setHueShift(0);
      setSatScale(1.0);
      // Removed immediate setLiveFilters reset to avoid flicker
    }
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

        {/* Color Processing — ZERO LATENCY sliders */}
        <Section title="Color Processing" icon={<Palette size={15} />}>
          <button className="btn-secondary" style={{ width: "100%", marginBottom: 10 }} disabled={disabled}
            onClick={() => onApply("color", "grayscale", {})}>Grayscale</button>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 5, fontWeight: 500 }}>Channel</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { ch: "r", color: "#C96B6B", label: "R" },
                { ch: "g", color: "#7A9B7E", label: "G" },
                { ch: "b", color: "#8A9BAD", label: "B" },
              ].map(({ ch, color, label }) => (
                <button key={ch} disabled={disabled} className="btn-secondary"
                  style={{
                    flex: 1, fontWeight: 700,
                    color: colorChannel === ch ? color : "var(--text-secondary)",
                    borderColor: colorChannel === ch ? `${color}60` : "var(--border-color)",
                    background: colorChannel === ch ? `${color}12` : "var(--bg-elevated)",
                  }}
                  onClick={() => { setColorChannel(ch); onApply("color", "channel_split", { channel: ch }); }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <SliderControl label="Hue Shift" value={hueShift} min={-180} max={180} step={1} onChange={(v) => handleHSChange(v, satScale)} unit="°" />
          <SliderControl label="Saturation" value={satScale} min={0} max={3.0} step={0.1} onChange={(v) => handleHSChange(hueShift, v)} unit="x" />
          <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} disabled={disabled || (hueShift === 0 && satScale === 1.0)}
            onClick={handleHSApply}>Apply Colors</button>
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
