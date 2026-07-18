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
  data: HistogramData | null;
  title: string;
  color?: string; // Optional accent color
}

export default function HistogramChart({
  data,
  title,
  color = "var(--wine-light)",
}: HistogramChartProps) {
  if (!data) {
    return (
      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border-color)", borderRadius: 8, margin: "8px 12px" }}>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>No histogram data</span>
      </div>
    );
  }

  const labels = Array.from({ length: 256 }, (_, i) => i);
  const datasets: any[] = [];

  if (data?.grayscale) {
    datasets.push({
      label: "Grayscale",
      data: data.grayscale,
      borderColor: "rgba(168, 154, 149, 0.9)",
      backgroundColor: "rgba(168, 154, 149, 0.15)",
      borderWidth: 1.5, pointRadius: 0, fill: true, tension: 0.4,
    });
  }

  if (data?.r) {
    datasets.push({
      label: "Red",
      data: data.r,
      borderColor: "rgba(201, 107, 107, 0.8)",
      backgroundColor: "rgba(201, 107, 107, 0.05)",
      borderWidth: 1, pointRadius: 0, fill: false, tension: 0.4,
    });
  }

  if (data?.g) {
    datasets.push({
      label: "Green",
      data: data.g,
      borderColor: "rgba(122, 155, 126, 0.8)",
      backgroundColor: "rgba(122, 155, 126, 0.05)",
      borderWidth: 1, pointRadius: 0, fill: false, tension: 0.4,
    });
  }

  if (data?.b) {
    datasets.push({
      label: "Blue",
      data: data.b,
      borderColor: "rgba(138, 155, 173, 0.8)",
      backgroundColor: "rgba(138, 155, 173, 0.05)",
      borderWidth: 1, pointRadius: 0, fill: false, tension: 0.4,
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
        align: "end" as const,
        labels: {
          color: "rgba(168, 154, 149, 0.7)",
          font: { size: 9, family: "'Inter', sans-serif" },
          boxWidth: 8, padding: 6, usePointStyle: true, pointStyle: "circle",
        },
      },
      title: {
        display: true,
        text: title,
        align: "start" as const,
        color: color,
        font: { size: 10, weight: 700, family: "'Inter', sans-serif" },
        padding: { bottom: 10 }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(37, 27, 31, 0.95)",
        borderColor: "rgba(139, 34, 82, 0.2)",
        borderWidth: 1,
        titleFont: { size: 11 },
        bodyFont: { size: 10, family: "'JetBrains Mono', monospace" },
        padding: 8, cornerRadius: 6,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: { color: "rgba(168, 154, 149, 0.3)", font: { size: 8 }, maxTicksLimit: 6 },
      },
      y: {
        display: true,
        grid: { color: "rgba(255, 255, 255, 0.02)" },
        ticks: { display: false },
      },
    },
    interaction: { mode: "nearest" as const, axis: "x" as const, intersect: false },
  };

  return (
    <div style={{ height: 160, padding: "4px 12px 12px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
