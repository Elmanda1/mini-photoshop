/**
 * Mini Photoshop — API Client
 * Axios wrapper for all FastAPI backend endpoints.
 */

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s for heavy operations
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Module 1: Image Management ───

export async function loadImage(base64: string) {
  const res = await api.post("/api/image/load", { image: base64 });
  return res.data;
}

export async function saveImage(
  base64: string,
  format: string = "png",
  quality: number = 95
) {
  const res = await api.post("/api/image/save", {
    image: base64,
    format,
    quality,
  });
  return res.data;
}

// ─── Module 2: Enhancement ───

export async function applyEnhancement(
  base64: string,
  operation: string,
  params: Record<string, number> = {}
) {
  const res = await api.post("/api/enhance", {
    image: base64,
    operation,
    ...params,
  });
  return res.data;
}

// ─── Module 3: Transform ───

export async function applyTransform(
  base64: string,
  operation: string,
  params: Record<string, number | string> = {}
) {
  const res = await api.post("/api/transform", {
    image: base64,
    operation,
    ...params,
  });
  return res.data;
}

// ─── Module 4: Noise Reduction ───

export async function applyFilter(
  base64: string,
  operation: string,
  params: Record<string, number | string> = {}
) {
  const res = await api.post("/api/filter", {
    image: base64,
    operation,
    ...params,
  });
  return res.data;
}

// ─── Module 5: Edge Detection ───

export async function applyEdge(
  base64: string,
  operation: string,
  params: Record<string, number> = {}
) {
  const res = await api.post("/api/edge", {
    image: base64,
    operation,
    ...params,
  });
  return res.data;
}

// ─── Module 6: Color Processing ───

export async function applyColor(
  base64: string,
  operation: string,
  params: Record<string, number | string> = {}
) {
  const res = await api.post("/api/color", {
    image: base64,
    operation,
    ...params,
  });
  return res.data;
}

// ─── Module 7: Segmentation ───

export async function applySegmentation(
  base64: string,
  method: string,
  params: Record<string, number> = {}
) {
  const res = await api.post("/api/segment", {
    image: base64,
    method,
    ...params,
  });
  return res.data;
}

// ─── Module 8: Compression ───

export async function applyCompression(base64: string, quality: number) {
  const res = await api.post("/api/compress", {
    image: base64,
    quality,
  });
  return res.data;
}

// ─── Module 9: Histogram ───

export async function getHistogram(base64: string) {
  const res = await api.post("/api/histogram", { image: base64 });
  return res.data;
}

// ─── Module 11: ML Recognition ───

export async function recognizeObject(base64: string) {
  const res = await api.post("/api/ml/recognize", { image: base64 });
  return res.data;
}

// ─── Health Check ───

export async function healthCheck() {
  const res = await api.get("/");
  return res.data;
}

export default api;
