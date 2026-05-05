"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Sun,
  RotateCw,
  Waves,
  ScanLine,
  Palette,
  Layers,
  Archive,
  Brain,
  ArrowRight,
  BarChart3,
  Upload,
  Zap,
  ChevronRight,
  Monitor,
  Cpu,
  Eye,
} from "lucide-react";

const MODULES = [
  {
    icon: <Upload size={22} />,
    title: "Image Management",
    desc: "Load, save, and export images in JPG, PNG, and BMP formats with drag & drop.",
    color: "var(--cream)",
  },
  {
    icon: <Sun size={22} />,
    title: "Enhancement",
    desc: "Adjust brightness, contrast, apply histogram equalization, sharpen, and blur.",
    color: "var(--gold)",
  },
  {
    icon: <RotateCw size={22} />,
    title: "Geometric Transform",
    desc: "Rotate, flip, crop, resize, and translate images with affine transformations.",
    color: "var(--slate)",
  },
  {
    icon: <Waves size={22} />,
    title: "Noise Reduction",
    desc: "Remove noise with Gaussian blur, median filter, and salt & pepper handling.",
    color: "var(--sage)",
  },
  {
    icon: <ScanLine size={22} />,
    title: "Edge Detection",
    desc: "Six methods: Canny, Sobel, Prewitt, Robert, Laplacian, LoG + morphology.",
    color: "var(--coral)",
  },
  {
    icon: <Palette size={22} />,
    title: "Color Processing",
    desc: "Convert to grayscale, split RGB channels, adjust hue and saturation.",
    color: "var(--wine-lighter)",
  },
  {
    icon: <Layers size={22} />,
    title: "Segmentation",
    desc: "Threshold-based, edge-based, and K-means region segmentation.",
    color: "var(--blush)",
  },
  {
    icon: <Archive size={22} />,
    title: "Compression",
    desc: "JPEG quality simulation with real-time file size comparison.",
    color: "var(--cream)",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Histogram Analysis",
    desc: "Real-time histogram visualization with before/after comparison.",
    color: "var(--slate)",
  },
  {
    icon: <Eye size={22} />,
    title: "User Interface",
    desc: "Professional dark UI with before/after panel, sliders, and toolbars.",
    color: "var(--gold)",
  },
  {
    icon: <Brain size={22} />,
    title: "AI Recognition",
    desc: "CNN-based object classification using MobileNetV2 with confidence scores.",
    color: "var(--wine-light)",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Upload Image",
    desc: "Drag & drop or browse for JPG, PNG, or BMP images.",
  },
  {
    num: "2",
    title: "Apply Processing",
    desc: "Choose from 11 modules with real-time parameter controls.",
  },
  {
    num: "3",
    title: "Compare & Analyze",
    desc: "View before/after side-by-side with histogram analysis.",
  },
  {
    num: "4",
    title: "Export Result",
    desc: "Download your processed image in your preferred format.",
  },
];

export default function LandingPage() {
  useEffect(() => {
    document.body.classList.add("landing-mode");
    return () => document.body.classList.remove("landing-mode");
  }, []);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* ═══════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          height: 60,
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-primary)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.03em" }}>
            <span style={{ color: "var(--wine-light)" }}>Mini</span>{" "}
            <span style={{ color: "var(--text-primary)" }}>Photoshop</span>
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "How It Works", "Tech Stack"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: 500,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--wine-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              {item}
            </a>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <Link href="/editor" style={{ textDecoration: "none" }}>
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Open Editor <ArrowRight size={14} />
          </button>
        </Link>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section
        style={{
          padding: "100px 32px 80px",
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Tag */}
        <div
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: "var(--radius-full)",
            background: "var(--wine-bg)",
            border: "1px solid var(--border-wine)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--wine-lighter)",
            marginBottom: 28,
          }}
        >
          <Cpu size={12} />
          Pengolahan Citra Digital
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in stagger-1"
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            margin: "0 0 20px",
          }}
        >
          Image Processing,{" "}
          <span style={{ color: "var(--wine-light)" }}>Simplified</span>
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in stagger-2"
          style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}
        >
          A full-stack digital image processing application with 11 modules,
          powered by Python, OpenCV, and AI-based object recognition.
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-in stagger-3"
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/editor" style={{ textDecoration: "none" }}>
            <button
              className="btn-primary btn-lg"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Launch Editor
              <ArrowRight size={16} />
            </button>
          </Link>
          <a href="#features" style={{ textDecoration: "none" }}>
            <button className="btn-wine-outline btn-lg">
              Explore Features
            </button>
          </a>
        </div>

        {/* Stats row */}
        <div
          className="animate-fade-in stagger-4"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
            marginTop: 64,
            paddingTop: 40,
            borderTop: "1px solid var(--border-color)",
          }}
        >
          {[
            { value: "11", label: "Modules" },
            { value: "6", label: "Edge Methods" },
            { value: "30+", label: "Operations" },
            { value: "CNN", label: "AI Powered" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES GRID
          ═══════════════════════════════════════════ */}
      <section
        id="features"
        style={{
          padding: "80px 32px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-divider" style={{ marginBottom: 20 }} />
          <h2
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 12,
              color: "var(--text-primary)",
            }}
          >
            11 Processing Modules
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            From basic enhancement to AI-powered object recognition,
            everything you need in one application.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {MODULES.map((mod, i) => (
            <div
              key={mod.title}
              className={`feature-item animate-fade-in stagger-${Math.min(i + 1, 8)}`}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: mod.color,
                }}
              >
                {mod.icon}
              </div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {mod.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {mod.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{
          padding: "80px 32px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-color)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-divider" style={{ marginBottom: 20 }} />
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}
            >
              How It Works
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              From upload to export in four simple steps.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`animate-fade-in stagger-${i + 1}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                  padding: "28px 0",
                  borderBottom:
                    i < STEPS.length - 1
                      ? "1px solid var(--border-color)"
                      : "none",
                }}
              >
                <div className="step-number">{step.num}</div>
                <div>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      marginBottom: 6,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TECH STACK
          ═══════════════════════════════════════════ */}
      <section
        id="tech-stack"
        style={{
          padding: "80px 32px",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-divider" style={{ marginBottom: 20 }} />
          <h2
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            Tech Stack
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Built with modern, production-grade tools.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          {[
            {
              icon: <Cpu size={20} />,
              title: "Backend",
              items: ["Python", "FastAPI", "Uvicorn"],
              color: "var(--sage)",
            },
            {
              icon: <Eye size={20} />,
              title: "Image Processing",
              items: ["OpenCV", "NumPy", "Pillow"],
              color: "var(--cream)",
            },
            {
              icon: <Monitor size={20} />,
              title: "Frontend",
              items: ["Next.js", "TypeScript", "Tailwind CSS"],
              color: "var(--slate)",
            },
            {
              icon: <Brain size={20} />,
              title: "Machine Learning",
              items: ["TensorFlow", "MobileNetV2", "CNN"],
              color: "var(--wine-lighter)",
            },
          ].map((stack, i) => (
            <div
              key={stack.title}
              className={`card animate-fade-in stagger-${i + 1}`}
              style={{ padding: "28px 24px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                  color: stack.color,
                }}
              >
                {stack.icon}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {stack.title}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {stack.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-color)",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FOOTER
          ═══════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px 32px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-color)",
          textAlign: "center",
        }}
      >
        <h2
          className="animate-fade-in"
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
        >
          Ready to Process Images?
        </h2>
        <p
          className="animate-fade-in stagger-1"
          style={{
            fontSize: 15,
            color: "var(--text-secondary)",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          Open the editor and start working with all 11 modules instantly.
        </p>
        <Link href="/editor" style={{ textDecoration: "none" }}>
          <button
            className="btn-primary btn-lg animate-fade-in stagger-2"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Open Editor
            <ChevronRight size={16} />
          </button>
        </Link>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer
        style={{
          padding: "24px 32px",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Mini Photoshop — Pengolahan Citra Digital
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Built with Python + Next.js
        </span>
      </footer>
    </div>
  );
}
