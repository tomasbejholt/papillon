"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const MODEL_COLORS: Record<string, string> = {
  mlp:          "#818cf8",
  cnn:          "#34d399",
  efficientnet: "#f472b6",
  resnet18:     "#38bdf8",
};

const MODEL_NAMES: Record<string, string> = {
  mlp:          "MLP",
  cnn:          "CNN",
  efficientnet: "EfficientNet-B0",
  resnet18:     "ResNet-18",
};

interface Prediction {
  predicted_class: string;
  confidence: number;
  all_probs: Record<string, number>;
}

export default function TestPage() {
  const [testImages, setTestImages] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, Prediction> | null>(null);
  const [loading, setLoading] = useState(false);
  const [predError, setPredError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const top3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${BASE}/test-images`)
      .then(r => r.json())
      .then(d => setTestImages(d.images ?? []))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (predictions) {
      top3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [predictions]);

  const speciesList = Array.from(new Set(testImages.map(img => {
    const parts = img.replace(".jpg", "").split("_");
    parts.pop();
    return parts.join(" ");
  }))).sort();

  const filteredImages = selectedSpecies === "all"
    ? testImages
    : testImages.filter(img => img.startsWith(selectedSpecies.replace(/ /g, "_")));

  const runPrediction = useCallback(async (file: File, url: string) => {
    setPreviewUrl(url);
    setPredictions(null);
    setPredError(null);
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${BASE}/predict`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.text();
        setPredError(`API ${res.status}: ${err.slice(0, 120)}`);
        return;
      }
      const data = await res.json();
      setPredictions(data.predictions ?? null);
    } catch (e) {
      setPredError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    runPrediction(file, url);
  };

  const handleTestImage = async (filename: string) => {
    const previewUrl = `${BASE}/test-image/${encodeURIComponent(filename)}`;
    const predictUrl = `${BASE}/predict/${encodeURIComponent(filename)}`;
    setPreviewUrl(previewUrl);
    setPredictions(null);
    setPredError(null);
    setLoading(true);
    try {
      const res = await fetch(predictUrl);
      if (!res.ok) {
        const err = await res.text();
        setPredError(`API ${res.status}: ${err.slice(0, 120)}`);
        return;
      }
      const data = await res.json();
      setPredictions(data.predictions ?? null);
    } catch (e) {
      setPredError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRandom = async () => {
    const pool = filteredImages.length > 0 ? filteredImages : testImages;
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    await handleTestImage(pick);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const galleryImage = e.dataTransfer.getData("gallery-image");
    if (galleryImage) { handleTestImage(galleryImage); return; }
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-white/40 text-sm tracking-widest uppercase mb-3">Classification</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Test the Models</h1>
        <div className="accent-bar w-16 mb-6" />
        <p className="text-white/60 text-lg max-w-2xl">
          Upload an image or pick from the test gallery. All four models classify simultaneously.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Left: upload + preview + results */}
        <div className="flex flex-col gap-6">
          {/* Drop zone */}
          <div
            className={`glass p-8 text-center cursor-pointer transition-all ${dragging ? "border-violet-400" : ""}`}
            style={{ borderStyle: dragging ? "solid" : "dashed", borderColor: dragging ? "#a78bfa" : "rgba(255,255,255,0.15)" }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {previewUrl ? (
              <div className="relative w-full aspect-square max-w-xs mx-auto rounded-xl overflow-hidden">
                <Image src={previewUrl} alt="Selected image" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-center">
                  <svg width="72" height="64" viewBox="0 0 120 105" fill="none" xmlns="http://www.w3.org/2000/svg"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M58 22 C54 15 48 10 44 6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d="M62 22 C66 15 72 10 76 6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <circle cx="44" cy="6" r="2.5" fill="rgba(255,255,255,0.35)" />
                    <circle cx="76" cy="6" r="2.5" fill="rgba(255,255,255,0.35)" />
                    <path d="M57 22 C55 35 55 60 57 78 C58 82 62 82 63 78 C65 60 65 35 63 22 Z"
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d="M57 30 C48 22 28 18 14 26 C4 33 6 50 18 54 C32 58 50 50 58 40"
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d="M63 30 C72 22 92 18 106 26 C116 33 114 50 102 54 C88 58 70 50 62 40"
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d="M57 46 C46 52 30 64 26 76 C22 86 32 94 44 88 C54 82 58 68 58 54"
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d="M63 46 C74 52 90 64 94 76 C98 86 88 94 76 88 C66 82 62 68 62 54"
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d="M35 28 C30 36 28 46 32 52" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                    <path d="M20 38 C22 44 26 50 30 54" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                    <path d="M85 28 C90 36 92 46 88 52" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                    <path d="M100 38 C98 44 94 50 90 54" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                    <path d="M40 64 C36 72 36 80 40 86" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                    <path d="M80 64 C84 72 84 80 80 86" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                  </svg>
                </div>
                <p className="text-white/60 text-sm">Drag and drop an image here</p>
                <p className="text-white/30 text-xs mt-1">or tap to select a file</p>
              </>
            )}
          </div>

          {/* Predictions */}
          {loading && (
            <div className="glass p-6 text-center text-white/50 text-sm">Analyzing...</div>
          )}
          {predError && !loading && (
            <div className="glass p-4 text-red-400 text-xs font-mono break-all">{predError}</div>
          )}
          {predictions && !loading && (
            <div className="glass p-6 flex flex-col gap-4">
              <h3 className="text-white font-semibold mb-2">Predictions</h3>
              {Object.entries(predictions).map(([key, pred]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: MODEL_COLORS[key] }}>{MODEL_NAMES[key]}</span>
                    <span className="text-white text-sm font-semibold">{(pred.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-white/60 text-xs mb-2">{pred.predicted_class}</div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pred.confidence * 100}%`, background: MODEL_COLORS[key] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: image library */}
        <div className="glass p-6 flex flex-col gap-4" style={{ maxHeight: "75vh", overflow: "hidden" }}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-white font-semibold">Test Library</h3>
              <p className="text-white/35 text-xs mt-0.5 hidden sm:block">Images from the validation set, not used during training</p>
            </div>
            <button
              onClick={handleRandom}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
            >
              Random
            </button>
          </div>

          {/* Species filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpecies("all")}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={{
                background: selectedSpecies === "all" ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${selectedSpecies === "all" ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
                color: selectedSpecies === "all" ? "white" : "rgba(255,255,255,0.5)",
              }}
            >
              All
            </button>
            {speciesList.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSpecies(s)}
                className="px-3 py-1 rounded-full text-xs transition-all capitalize"
                style={{
                  background: selectedSpecies === s ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${selectedSpecies === s ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
                  color: selectedSpecies === s ? "white" : "rgba(255,255,255,0.5)",
                }}
              >
                {s.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Image gallery */}
          <div className="overflow-y-auto flex-1 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            <div className="grid grid-cols-3 gap-2">
              {filteredImages.map(img => {
                const isSelected = previewUrl?.includes(encodeURIComponent(img));
                return (
                  <button
                    key={img}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.effectAllowed = "copy";
                      e.dataTransfer.setData("gallery-image", img);
                    }}
                    onClick={() => handleTestImage(img)}
                    className="relative aspect-square rounded-lg overflow-hidden transition-all"
                    style={{
                      border: `2px solid ${isSelected ? "#a78bfa" : "transparent"}`,
                      opacity: isSelected ? 1 : 0.75,
                      cursor: "pointer",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${BASE}/test-image/${encodeURIComponent(img)}`}
                      alt={img}
                      draggable={false}
                      className="object-cover w-full h-full"
                    />
                  </button>
                );
              })}
              {filteredImages.length === 0 && (
                <div className="col-span-3 text-center text-white/30 text-sm py-8">No images</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top-3 per model */}
      {predictions && !loading && (
        <div ref={top3Ref} className="glass p-6 md:p-8">
          <h3 className="text-white font-semibold mb-6">Top-3 per model</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(predictions).map(([key, pred]) => {
              const top3 = Object.entries(pred.all_probs)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);
              return (
                <div key={key}>
                  <div className="text-sm font-semibold mb-3" style={{ color: MODEL_COLORS[key] }}>{MODEL_NAMES[key]}</div>
                  {top3.map(([cls, prob]) => (
                    <div key={cls} className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60 truncate">{cls.toLowerCase()}</span>
                        <span className="text-white/80 ml-2">{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${prob * 100}%`, background: MODEL_COLORS[key] }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
