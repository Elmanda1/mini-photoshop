"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, MousePointer2, Settings, Download, MonitorPlay } from "lucide-react";

export default function ManualPage() {
  const sections = [
    {
      icon: <MonitorPlay size={20} />,
      title: "1. Persiapan Awal",
      content: [
        "Pastikan Server Backend (Python) berjalan pada port 8000.",
        "Pastikan Frontend (Next.js) berjalan pada port 3000.",
        "Buka browser dan arahkan ke http://localhost:3000."
      ]
    },
    {
      icon: <MousePointer2 size={20} />,
      title: "2. Unggah Gambar",
      content: [
        "Pada Landing Page, klik tombol 'Mulai Editor' atau area Dropzone.",
        "Pilih file JPG, PNG, atau BMP dari komputer Anda.",
        "Tunggu hingga gambar muncul di area Canvas utama."
      ]
    },
    {
      icon: <Settings size={20} />,
      title: "3. Proses Pengolahan",
      content: [
        "Gunakan Tool Panel di sisi kiri untuk memilih modul (misal: Enhancement).",
        "Geser slider untuk melihat perubahan secara instan pada Canvas.",
        "Gunakan tombol 'Before/After' untuk membandingkan hasil olahan."
      ]
    },
    {
      icon: <Download size={20} />,
      title: "4. Ekspor Hasil",
      content: [
        "Setelah puas dengan hasilnya, klik tombol 'Export' di sisi kanan.",
        "Pilih format gambar yang diinginkan.",
        "Klik 'Download' untuk menyimpan gambar ke folder unduhan Anda."
      ]
    }
  ];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Navigation */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--wine-lighter)", textDecoration: "none", fontSize: 14, marginBottom: 32 }}>
          <ArrowLeft size={16} /> Kembali ke Landing Page
        </Link>

        {/* Header */}
        <header style={{ marginBottom: 48, borderBottom: "1px solid var(--border-color)", paddingBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, background: "rgba(146, 26, 26, 0.1)", borderRadius: 12, color: "var(--wine-light)" }}>
              <BookOpen size={28} />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>Panduan Pengguna</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6 }}>
            Selamat datang di panduan penggunaan Mini Photoshop. Ikuti langkah-langkah di bawah ini untuk 
            memulai pengolahan citra digital Anda.
          </p>
        </header>

        {/* Manual Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {sections.map((section, idx) => (
            <div key={idx} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, color: "var(--wine-light)" }}>
                {section.icon}
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{section.title}</h2>
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 16, paddingLeft: 20 }}>
                {section.content.map((item, i) => (
                  <li key={i} style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.5 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div style={{ marginTop: 48, padding: 24, borderRadius: 16, border: "1px dashed var(--border-wine)", background: "rgba(146, 26, 26, 0.05)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--wine-lighter)" }}>Tips Pro:</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            Gunakan fitur <strong>Histogram Analysis</strong> (tombol chart di toolbar) untuk memastikan 
            distribusi warna citra Anda seimbang setelah melakukan peningkatan kontras.
          </p>
        </div>

        <footer style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid var(--border-color)", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
          &copy; 2026 Mini Photoshop Manual — TI-4C Project
        </footer>
      </div>
    </div>
  );
}
