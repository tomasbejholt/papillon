const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ModelInfo {
  name: string;
  params: number;
  val_accuracy: number;
  train_time_min: number;
}

export interface Prediction {
  predicted_class: string;
  confidence: number;
  all_probs: Record<string, number>;
}

export interface PredictResponse {
  predictions: Record<string, Prediction>;
}

export interface ModelInfoResponse {
  models: Record<string, ModelInfo>;
  training_gpu: string;
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const res = await fetch(`${BASE}/model-info`);
  return res.json();
}

export async function fetchResults() {
  const res = await fetch(`${BASE}/results`);
  return res.json();
}

export async function fetchClasses(): Promise<{ classes: string[] }> {
  const res = await fetch(`${BASE}/classes`);
  return res.json();
}

export async function fetchTestImages(): Promise<{ images: string[] }> {
  const res = await fetch(`${BASE}/test-images`);
  return res.json();
}

export function getTestImageUrl(filename: string) {
  return `${BASE}/test-image/${encodeURIComponent(filename)}`;
}

export function getRandomImageUrl() {
  return `${BASE}/random-image?t=${Date.now()}`;
}

export async function predict(file: File): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/predict`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}
