"use client";

import React from "react";
import { X, Cpu, Layers, Brain, Database, Monitor, Code } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TechItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 8, background: "var(--wine-bg)",
      border: "1px solid var(--border-wine)", display: "flex", alignItems: "center",
      justifyContent: "center", color: "var(--wine-light)", flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{title}</h4>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</p>
    </div>
  </div>
);

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20
    }} onClick={onClose}>
      <div
        style={{
          background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 500,
          maxHeight: "90vh", overflowY: "auto", position: "relative",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)", padding: 32
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20, background: "transparent",
            border: "none", color: "var(--text-muted)", cursor: "pointer"
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
            Tentang <span style={{ color: "var(--wine-light)" }}>Mini Photoshop</span>
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Sistem Pengolahan Citra Digital Modern
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--wine-light)", letterSpacing: "0.1em", marginBottom: 20 }}>
            Teknologi & Fitur
          </h3>

          <TechItem
            icon={<Monitor size={18} />}
            title="Next.js 15 & TypeScript"
            desc="Frontend modern dengan performa tinggi, sistem navigasi cepat, dan tipe data yang aman."
          />
          <TechItem
            icon={<Database size={18} />}
            title="FastAPI & Python"
            desc="Backend berkecepatan tinggi yang menangani komputasi berat dan pemrosesan citra asinkron."
          />
          <TechItem
            icon={<Cpu size={18} />}
            title="OpenCV"
            desc="Library standar industri untuk manipulasi piksel, deteksi tepi, dan transformasi geometris."
          />
          <TechItem 
            icon={<Brain size={18} />} 
            title="AI: CNN (Convolutional Neural Network)" 
            desc="Klasifikasi biner real-time menggunakan model TensorFlow kustom untuk membedakan antara subjek Manusia dan Bukan Manusia (Human vs Not Human)."
          />
          <TechItem
            icon={<Layers size={18} />}
            title="11 Modul Pemrosesan"
            desc="Mencakup peningkatan kualitas, reduksi derau, segmentasi, hingga simulasi kompresi citra."
          />
          <TechItem
            icon={<Code size={18} />}
            title="Clean Architecture"
            desc="Pemisahan logika antara antarmuka pengguna (UI) dan mesin pemroses (Engine) untuk kemudahan pengembangan."
          />
        </div>
      </div>
    </div>
  );
}
