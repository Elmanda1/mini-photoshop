"use client";

import React from "react";
import { Brain, Sparkles } from "lucide-react";

interface Prediction {
  label: string;
  description: string;
  confidence: number;
}

interface MLResultProps {
  result: {
    label: string;
    confidence: number;
    predictions: Prediction[];
    error?: string;
  } | null;
  loading: boolean;
}

export default function MLResult({ result, loading }: MLResultProps) {
  if (loading) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div className="spinner" style={{ width: 24, height: 24 }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Analyzing image with AI...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--wine-bg)", border: "1px solid var(--border-wine)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <Brain size={22} style={{ opacity: 0.5, color: "var(--wine-lighter)" }} />
        </div>
        <p style={{ lineHeight: 1.5 }}>
          Click &quot;Recognize&quot; to analyze<br />the image with CNN
        </p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div
        className="animate-fade-in"
        style={{
          padding: 14, margin: 12, fontSize: 12, lineHeight: 1.5,
          background: "rgba(201, 107, 107, 0.08)",
          border: "1px solid rgba(201, 107, 107, 0.2)",
          borderRadius: "var(--radius-md)",
          color: "var(--coral)",
        }}
      >
        {result.error}
      </div>
    );
  }

  const confidenceColor =
    result.confidence >= 0.8 ? "var(--sage)"
    : result.confidence >= 0.5 ? "var(--gold)"
    : "var(--coral)";

  const confidenceBadge =
    result.confidence >= 0.8 ? "badge-sage"
    : result.confidence >= 0.5 ? "badge-cream"
    : "badge-coral";

  return (
    <div className="animate-fade-in" style={{ padding: 12 }}>
      {/* Top prediction */}
      <div
        style={{
          background: "var(--wine-bg)",
          border: "1px solid var(--border-wine)",
          borderRadius: "var(--radius-lg)",
          padding: 18,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        <Sparkles size={18} style={{ color: "var(--wine-light)", margin: "0 auto 10px", display: "block" }} />
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-bright)", textTransform: "capitalize", marginBottom: 8, letterSpacing: "-0.02em" }}>
          {result.label}
        </p>
        <span className={`badge ${confidenceBadge}`}>
          {(result.confidence * 100).toFixed(1)}%
        </span>
      </div>

      {/* Predictions list */}
      {result.predictions && result.predictions.length > 1 && (
        <div>
          <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
            Top Predictions
          </p>
          {result.predictions.map((pred, i) => {
            const barWidth = Math.max(pred.confidence * 100, 4);
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 0",
                  borderBottom: i < result.predictions.length - 1 ? "1px solid var(--border-color)" : "none",
                }}
              >
                <span style={{ fontSize: 10, color: "var(--text-muted)", width: 16, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize", display: "block", marginBottom: 3 }}>
                    {pred.description}
                  </span>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${barWidth}%`,
                        background: i === 0 ? "var(--wine)" : "var(--wine-lighter)",
                        borderRadius: 2,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: 500 }}>
                  {(pred.confidence * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
