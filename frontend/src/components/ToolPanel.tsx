"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
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
} from "lucide-react";

interface ToolPanelProps {
  onApply: (module: string, operation: string, params: Record<string, any>) => void;
  hasImage: boolean;
  loading: boolean;
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
  label, value, min, max, step, onChange, unit,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; unit?: string;
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
      />
    </div>
  );
}

/* ─── Debounce helper ─── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ToolPanel({ onApply, hasImage, loading }: ToolPanelProps) {
  // Enhancement
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1.0);
  const [sharpIntensity, setSharpIntensity] = useState(1.0);
  const [blurKernel, setBlurKernel] = useState(5);

  // Transform
  const [angle, setAngle] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

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

  // Segment
  const [segMethod, setSegMethod] = useState("threshold");
  const [segThreshold, setSegThreshold] = useState(127);
  const [numRegions, setNumRegions] = useState(3);

  // Compress
  const [compressQuality, setCompressQuality] = useState(80);

  const disabled = !hasImage || loading;

  // ─── LIVE PREVIEW: Debounce slider values, auto-apply on change ───
  const DEBOUNCE_MS = 400;

  const debouncedBrightness = useDebounce(brightness, DEBOUNCE_MS);
  const debouncedContrast = useDebounce(contrast, DEBOUNCE_MS);

  const debouncedHueShift = useDebounce(hueShift, DEBOUNCE_MS);
  const debouncedSatScale = useDebounce(satScale, DEBOUNCE_MS);

  const debouncedCompressQuality = useDebounce(compressQuality, DEBOUNCE_MS);

  // Track whether the user has interacted (to avoid auto-apply on mount)
  const bcInitRef = useRef(true);
  const colorInitRef = useRef(true);
  const compressInitRef = useRef(true);

  // Auto-apply brightness/contrast
  useEffect(() => {
    if (bcInitRef.current) {
      bcInitRef.current = false;
      return;
    }
    if (!hasImage || loading) return;
    onApply("enhance", "brightness_contrast", {
      brightness: debouncedBrightness,
      contrast: debouncedContrast,
    });
  }, [debouncedBrightness, debouncedContrast]);

  // Auto-apply hue/saturation
  useEffect(() => {
    if (colorInitRef.current) {
      colorInitRef.current = false;
      return;
    }
    if (!hasImage || loading) return;
    onApply("color", "hue_saturation", {
      hue_shift: debouncedHueShift,
      saturation_scale: debouncedSatScale,
    });
  }, [debouncedHueShift, debouncedSatScale]);

  // Auto-apply compression
  useEffect(() => {
    if (compressInitRef.current) {
      compressInitRef.current = false;
      return;
    }
    if (!hasImage || loading) return;
    onApply("compress", "jpeg", { quality: debouncedCompressQuality });
  }, [debouncedCompressQuality]);

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
        <span className="badge badge-wine" style={{ fontSize: 9 }}>Live</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Enhancement — LIVE sliders + manual buttons */}
        <Section title="Enhancement" icon={<Sun size={15} />} defaultOpen={true}>
          <SliderControl label="Brightness" value={brightness} min={-100} max={100} step={1} onChange={setBrightness} />
          <SliderControl label="Contrast" value={contrast} min={0.5} max={3.0} step={0.1} onChange={setContrast} />
          <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8, fontStyle: "italic" }}>
            ↑ Live — changes apply as you drag
          </p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <button className="btn-secondary" style={{ flex: 1 }} disabled={disabled}
              onClick={() => onApply("enhance", "histogram_eq", {})}>Hist EQ</button>
            <button className="btn-secondary" style={{ flex: 1 }} disabled={disabled}
              onClick={() => onApply("enhance", "sharpen", { intensity: sharpIntensity })}>Sharpen</button>
            <button className="btn-secondary" style={{ flex: 1 }} disabled={disabled}
              onClick={() => onApply("enhance", "blur", { kernel_size: blurKernel })}>Blur</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <SliderControl label="Sharpen Intensity" value={sharpIntensity} min={0.5} max={3.0} step={0.1} onChange={setSharpIntensity} />
            <SliderControl label="Blur Kernel" value={blurKernel} min={3} max={31} step={2} onChange={setBlurKernel} />
          </div>
        </Section>

        {/* Transform — manual buttons (destructive ops) */}
        <Section title="Transform" icon={<RotateCw size={15} />}>
          <SliderControl label="Rotation" value={angle} min={0} max={360} step={1} onChange={setAngle} unit="°" />
          <button className="btn-primary" style={{ width: "100%", marginBottom: 8 }} disabled={disabled}
            onClick={() => onApply("transform", "rotate", { angle })}>Rotate</button>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            <button className="btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} disabled={disabled}
              onClick={() => onApply("transform", "flip", { flip_code: 1 })}><FlipHorizontal2 size={13} /> H-Flip</button>
            <button className="btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} disabled={disabled}
              onClick={() => onApply("transform", "flip", { flip_code: 0 })}><FlipVertical2 size={13} /> V-Flip</button>
          </div>
          <SliderControl label="Scale" value={scale} min={0.1} max={5.0} step={0.1} onChange={setScale} unit="x" />
          <button className="btn-secondary" style={{ width: "100%", marginBottom: 10 }} disabled={disabled}
            onClick={() => onApply("transform", "resize", { scale })}>Resize</button>
          <SliderControl label="Translate X" value={tx} min={-500} max={500} step={1} onChange={setTx} unit="px" />
          <SliderControl label="Translate Y" value={ty} min={-500} max={500} step={1} onChange={setTy} unit="px" />
          <button className="btn-secondary" style={{ width: "100%" }} disabled={disabled}
            onClick={() => onApply("transform", "translate", { tx, ty })}>Translate</button>
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

        {/* Color Processing — LIVE sliders */}
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
          <SliderControl label="Hue Shift" value={hueShift} min={-180} max={180} step={1} onChange={setHueShift} unit="°" />
          <SliderControl label="Saturation" value={satScale} min={0} max={3.0} step={0.1} onChange={setSatScale} unit="x" />
          <p style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>
            ↑ Live — changes apply as you drag
          </p>
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

        {/* Compression — LIVE slider */}
        <Section title="Compression" icon={<Archive size={15} />}>
          <SliderControl label="JPEG Quality" value={compressQuality} min={1} max={100} step={1} onChange={setCompressQuality} unit="%" />
          <p style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>
            ↑ Live — compresses as you drag
          </p>
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
