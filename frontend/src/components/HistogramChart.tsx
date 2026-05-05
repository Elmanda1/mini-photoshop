"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

interface HistogramData {
  grayscale?: number[];
  r?: number[];
  g?: number[];
  b?: number[];
}

interface HistogramChartProps {
  beforeData: HistogramData | null;
  afterData: HistogramData | null;
  showComparison: boolean;
}

export default function HistogramChart({
  beforeData,
  afterData,
  showComparison,
}: HistogramChartProps) {
  if (!beforeData && !afterData) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Upload an image to view histogram
      </div>
    );
  }

  const labels = Array.from({ length: 256 }, (_, i) => i);
  const datasets: any[] = [];
  const data = showComparison && afterData ? afterData : beforeData;
  const prefix = showComparison && afterData ? "After" : "Before";

  if (data?.grayscale) {
    datasets.push({
      label: `${prefix} — Grayscale`,
      data: data.grayscale,
      borderColor: "rgba(168, 154, 149, 0.7)",
      backgroundColor: "rgba(168, 154, 149, 0.08)",
      borderWidth: 1, pointRadius: 0, fill: true, tension: 0.3,
    });
  }

  if (data?.r) {
    datasets.push({
      label: `${prefix} — Red`,
      data: data.r,
      borderColor: "rgba(201, 107, 107, 0.8)",
      backgroundColor: "rgba(201, 107, 107, 0.08)",
      borderWidth: 1, pointRadius: 0, fill: true, tension: 0.3,
    });
  }

  if (data?.g) {
    datasets.push({
      label: `${prefix} — Green`,
      data: data.g,
      borderColor: "rgba(122, 155, 126, 0.8)",
      backgroundColor: "rgba(122, 155, 126, 0.08)",
      borderWidth: 1, pointRadius: 0, fill: true, tension: 0.3,
    });
  }

  if (data?.b) {
    datasets.push({
      label: `${prefix} — Blue`,
      data: data.b,
      borderColor: "rgba(138, 155, 173, 0.8)",
      backgroundColor: "rgba(138, 155, 173, 0.08)",
      borderWidth: 1, pointRadius: 0, fill: true, tension: 0.3,
    });
  }

  const chartData = { labels, datasets };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "rgba(168, 154, 149, 0.7)",
          font: { size: 10, family: "'Inter', sans-serif" },
          boxWidth: 10, padding: 10, usePointStyle: true, pointStyle: "circle",
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(37, 27, 31, 0.95)",
        borderColor: "rgba(139, 34, 82, 0.2)",
        borderWidth: 1,
        titleFont: { size: 11 },
        bodyFont: { size: 10, family: "'JetBrains Mono', monospace" },
        padding: 10, cornerRadius: 8,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: { color: "rgba(168, 154, 149, 0.4)", font: { size: 9 }, maxTicksLimit: 8 },
        title: { display: true, text: "Pixel Intensity", color: "rgba(168, 154, 149, 0.5)", font: { size: 10 } },
      },
      y: {
        display: true,
        grid: { color: "rgba(255, 255, 255, 0.03)" },
        ticks: { color: "rgba(168, 154, 149, 0.4)", font: { size: 9 }, maxTicksLimit: 5 },
        title: { display: true, text: "Frequency", color: "rgba(168, 154, 149, 0.5)", font: { size: 10 } },
      },
    },
    interaction: { mode: "nearest" as const, axis: "x" as const, intersect: false },
  };

  return (
    <div style={{ height: 200, padding: "8px 12px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
