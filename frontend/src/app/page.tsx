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
    title: "Manajemen Gambar",
    desc: "Muat, simpan, dan ekspor gambar dalam format JPG, PNG, dan BMP dengan drag & drop.",
    color: "var(--cream)",
  },
  {
    icon: <Sun size={22} />,
    title: "Peningkatan Citra",
    desc: "Sesuaikan kecerahan, kontras, perataan histogram, penajaman, dan pengaburan.",
    color: "var(--gold)",
  },
  {
    icon: <RotateCw size={22} />,
    title: "Transformasi Geometris",
    desc: "Putar, balik, potong, ubah ukuran, dan translasi gambar dengan transformasi afin.",
    color: "var(--slate)",
  },
  {
    icon: <Waves size={22} />,
    title: "Reduksi Derau",
    desc: "Hapus noise dengan Gaussian blur, filter median, dan penanganan salt & pepper.",
    color: "var(--sage)",
  },
  {
    icon: <ScanLine size={22} />,
    title: "Deteksi Tepi",
    desc: "Enam metode: Canny, Sobel, Prewitt, Robert, Laplacian, LoG + morfologi.",
    color: "var(--coral)",
  },
  {
    icon: <Palette size={22} />,
    title: "Pengolahan Warna",
    desc: "Konversi ke grayscale, pisah saluran RGB, sesuaikan hue dan saturasi.",
    color: "var(--wine-lighter)",
  },
  {
    icon: <Layers size={22} />,
    title: "Segmentasi",
    desc: "Segmentasi wilayah berbasis ambang batas (threshold), tepi, dan K-means.",
    color: "var(--blush)",
  },
  {
    icon: <Archive size={22} />,
    title: "Kompresi",
    desc: "Simulasi kualitas JPEG dengan perbandingan ukuran file secara real-time.",
    color: "var(--cream)",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Analisis Histogram",
    desc: "Visualisasi histogram real-time dengan perbandingan sebelum/sesudah.",
    color: "var(--slate)",
  },
  {
    icon: <Eye size={22} />,
    title: "Antarmuka Pengguna",
    desc: "UI gelap profesional dengan panel pembanding, slider, dan toolbar.",
    color: "var(--gold)",
  },
  {
    icon: <Brain size={22} />,
    title: "Pengenalan AI",
    desc: "Klasifikasi objek berbasis CNN menggunakan MobileNetV2 dengan skor kepercayaan.",
    color: "var(--wine-light)",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Unggah Gambar",
    desc: "Tarik & lepas atau cari gambar JPG, PNG, atau BMP.",
  },
  {
    num: "2",
    title: "Terapkan Pemrosesan",
    desc: "Pilih dari 11 modul dengan kontrol parameter real-time.",
  },
  {
    num: "3",
    title: "Bandingkan & Analisis",
    desc: "Lihat hasil sebelum/sesudah secara berdampingan dengan analisis histogram.",
  },
  {
    num: "4",
    title: "Ekspor Hasil",
    desc: "Unduh gambar yang telah diproses dalam format pilihan Anda.",
  },
];

const TEAM = [
  {
    name: "Falih Elmanda Ghaisan",
    role: "Lead FullStack Developer",
    nim: "2407411073",
    class: "TI-4C",
    image: "/creators/falih.jpeg",
  },
  {
    name: "Muhammad Fatih Ammario Seno",
    role: "FullStack Developer",
    nim: "2407411074",
    class: "TI-4C",
    image: "/creators/fatih.jpeg",
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
          {[
            { label: "Fitur", id: "features" },
            { label: "Cara Kerja", id: "how-it-works" },
            { label: "Tim", id: "team" }
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
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
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <Link href="/editor" style={{ textDecoration: "none" }}>
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Buka Editor <ArrowRight size={14} />
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
          Pengolahan Citra,{" "}
          <span style={{ color: "var(--wine-light)" }}>Lebih Sederhana</span>
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
          Aplikasi pengolahan citra digital full-stack dengan 11 modul,
          dilengkapi pengenalan objek berbasis AI secara real-time.
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
              Mulai Editor
              <ArrowRight size={16} />
            </button>
          </Link>
          <a href="#features" style={{ textDecoration: "none" }}>
            <button className="btn-wine-outline btn-lg">
              Jelajahi Fitur
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
            { value: "11", label: "Modul" },
            { value: "6", label: "Metode Tepi" },
            { value: "30+", label: "Operasi" },
            { value: "CNN", label: "TensorFlow" },
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
            11 Modul Pemrosesan
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
            Dari perbaikan dasar hingga pengenalan objek berbasis AI,
            semua yang Anda butuhkan dalam satu aplikasi.
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
              Cara Kerja
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Dari unggah hingga ekspor dalam empat langkah mudah.
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
          TEAM BIODATA
          ═══════════════════════════════════════════ */}
      <section
        id="team"
        style={{
          padding: "80px 32px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-divider" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Tim Pengembang
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Kenali para pengembang di balik Mini Photoshop.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="feature-item"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--border-wine)",
                position: "relative",
                overflow: "hidden",
                padding: "24px",
                borderRadius: "var(--radius-lg)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--wine)", flexShrink: 0 }}>
                  <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{member.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--wine-lighter)", fontWeight: 600, marginBottom: 8 }}>{member.role}</p>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" }}>
                    <div>NIM: {member.nim}</div>
                    <div>Kelas: {member.class}</div>
                  </div>
                </div>
              </div>
              <Cpu size={16} style={{ position: "absolute", top: 16, right: 16, opacity: 0.2, color: "var(--wine-lighter)" }} />
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
          Siap Mengolah Gambar?
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
          Buka editor dan mulai gunakan ke-11 modul secara instan.
        </p>
        <Link href="/editor" style={{ textDecoration: "none" }}>
          <button
            className="btn-primary btn-lg animate-fade-in stagger-2"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Buka Editor
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
      </footer>
    </div>
  );
}
