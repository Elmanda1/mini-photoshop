"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Code, Send, Terminal, Database, ShieldCheck } from "lucide-react";

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/enhance",
      desc: "Modul 2: Perbaikan citra (Brightness, Contrast, Sharpen, Equalization).",
      body: `{
  "image": "data:image/png;base64,...",
  "operation": "brightness_contrast",
  "brightness": 1.2,
  "contrast": 1.5
}`
    },
    {
      method: "POST",
      path: "/transform",
      desc: "Modul 3: Transformasi spasial (Rotate, Flip, Resize, Crop).",
      body: `{
  "image": "base64_string",
  "operation": "rotate",
  "angle": 90
}`
    },
    {
      method: "POST",
      path: "/filter",
      desc: "Modul 4: Restorasi citra dan noise reduction (Gaussian, Median).",
      body: `{
  "image": "base64_string",
  "operation": "median",
  "kernel_size": 5
}`
    },
    {
      method: "POST",
      path: "/edge",
      desc: "Modul 6: Deteksi tepi (6 metode) dan operasi morfologi.",
      body: `{
  "image": "base64_string",
  "operation": "canny",
  "threshold1": 100,
  "threshold2": 200
}`
    },
    {
      method: "POST",
      path: "/color",
      desc: "Modul 5: Manipulasi warna (Grayscale, HSV, Colorize).",
      body: `{
  "image": "base64_string",
  "operation": "hsv",
  "saturation": 1.5
}`
    },
    {
      method: "POST",
      path: "/segment",
      desc: "Modul 7: Segmentasi wilayah (K-Means, Thresholding).",
      body: `{
  "image": "base64_string",
  "method": "region",
  "num_regions": 3
}`
    },
    {
      method: "POST",
      path: "/compress",
      desc: "Modul 8: Kompresi JPEG dengan simulasi kuantisasi DCT.",
      body: `{
  "image": "base64_string",
  "quality": 50
}`
    },
    {
      method: "POST",
      path: "/histogram",
      desc: "Modul 9: Analisis distribusi intensitas piksel (RGB Channels).",
      body: `{
  "image": "base64_string"
}`
    },
    {
      method: "POST",
      path: "/ml/predict",
      desc: "Modul 11: Pengenalan objek AI berbasis model CNN.",
      body: `{
  "image": "base64_string"
}`
    }
  ];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Navigation */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--wine-lighter)", textDecoration: "none", fontSize: 14, marginBottom: 32 }}>
          <ArrowLeft size={16} /> Kembali ke Landing Page
        </Link>

        {/* Header */}
        <header style={{ marginBottom: 48, borderBottom: "1px solid var(--border-color)", paddingBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, background: "rgba(146, 26, 26, 0.1)", borderRadius: 12, color: "var(--wine-light)" }}>
              <Code size={28} />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>Dokumentasi Lengkap API</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6 }}>
            Berikut adalah daftar lengkap endpoint API untuk ke-11 modul Mini Photoshop. 
            Semua endpoint menggunakan protokol <strong>HTTP POST</strong>.
          </p>
        </header>

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 48 }}>
          <div style={{ padding: 20, background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "var(--wine-lighter)" }}>
              <Terminal size={18} />
              <span style={{ fontWeight: 700, fontSize: 13 }}>Server Endpoint</span>
            </div>
            <code style={{ background: "var(--bg-primary)", padding: "4px 8px", borderRadius: 4, fontSize: 13, color: "var(--text-primary)" }}>
              http://localhost:8000/api
            </code>
          </div>
          <div style={{ padding: 20, background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "var(--gold)" }}>
              <Database size={18} />
              <span style={{ fontWeight: 700, fontSize: 13 }}>Content Type</span>
            </div>
            <code style={{ background: "var(--bg-primary)", padding: "4px 8px", borderRadius: 4, fontSize: 13, color: "var(--text-primary)" }}>
              application/json
            </code>
          </div>
          <div style={{ padding: 20, background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "var(--sage)" }}>
              <ShieldCheck size={18} />
              <span style={{ fontWeight: 700, fontSize: 13 }}>Data Payload</span>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Base64 Encoded Strings</span>
          </div>
        </div>

        {/* Endpoints List */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {endpoints.map((ep, idx) => (
            <div key={idx} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ background: ep.method === "POST" ? "var(--wine)" : "#444", color: "white", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 900 }}>{ep.method}</span>
                <code style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{ep.path}</code>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>{ep.desc}</p>
              <div style={{ background: "#080808", borderRadius: 10, padding: 16, border: "1px solid #1a1a1a" }}>
                <pre style={{ margin: 0, fontSize: 12, color: "#aaa", overflowX: "auto", fontFamily: "var(--font-mono)" }}>
                  {ep.body}
                </pre>
              </div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid var(--border-color)", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
          &copy; 2026 Mini Photoshop Documentation — TI-4C Project
        </footer>
      </div>
    </div>
  );
}
