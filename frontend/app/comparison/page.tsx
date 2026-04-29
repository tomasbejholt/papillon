"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const CLASSES = [
  "MOURNING CLOAK", "GREEN HAIRSTREAK", "BROWN ARGUS", "BROOKES BIRDWING",
  "SLEEPY ORANGE", "CHALK HILL BLUE", "ATALA", "HUMMING BIRD HAWK MOTH",
  "WHITE LINED SPHINX MOTH", "ARCIGERA FLOWER MOTH",
];

const SHORT = [
  "Mourning Cloak", "Green Hairstreak", "Brown Argus", "Brookes Birdwing",
  "Sleepy Orange", "Chalk Hill Blue", "Atala", "Hawk Moth",
  "Sphinx Moth", "Arcigera Moth",
];

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

const overviewData = [
  { model: "MLP",            accuracy: 0.80,  params: 25.3, time: 0.8 },
  { model: "CNN",            accuracy: 0.92,  params: 1.2,  time: 1.0 },
  { model: "EfficientNet",   accuracy: 0.98,  params: 4.0,  time: 1.1 },
  { model: "ResNet-18",      accuracy: 1.00,  params: 11.2, time: 0.9 },
];

const CHART_COLORS = ["#818cf8", "#34d399", "#f472b6", "#38bdf8"];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function computeClassMetrics(matrix: number[][]) {
  return CLASSES.map((_, i) => {
    const tp = matrix[i][i];
    const fp = matrix.reduce((sum, row, ri) => ri !== i ? sum + row[i] : sum, 0);
    const fn = matrix[i].reduce((sum, val, ci) => ci !== i ? sum + val : sum, 0);
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall    = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1        = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
    return { name: SHORT[i], precision, recall, f1 };
  });
}

function ConfusionMatrix({ matrix, modelName, color }: { matrix: number[][], modelName: string, color: string }) {
  const max = Math.max(...matrix.flat());
  const [tooltip, setTooltip] = useState<{ x: number; y: number; ri: number; ci: number; val: number } | null>(null);

  return (
    <div className="glass p-6">
      <h3 className="text-white font-semibold mb-1">{modelName}</h3>
      <p className="text-white/40 text-xs mb-4">Confusion matrix (10×10)</p>
      <div className="overflow-x-auto relative">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${CLASSES.length}, minmax(28px, 1fr))`, gap: 2 }}>
          {matrix.map((row, ri) =>
            row.map((val, ci) => {
              const intensity = val / max;
              const isCorrect = ri === ci;
              return (
                <div
                  key={`${ri}-${ci}`}
                  onMouseEnter={e => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, ri, ci, val });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    width: 28, height: 28,
                    background: isCorrect
                      ? `rgba(${hexToRgb(color)}, ${0.2 + intensity * 0.8})`
                      : `rgba(255,255,255,${intensity * 0.4})`,
                    borderRadius: 3,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: intensity > 0.3 ? "white" : "rgba(255,255,255,0.3)",
                    cursor: "default",
                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.35)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 6px rgba(${hexToRgb(color)}, 0.5)`;
                    (e.currentTarget as HTMLElement).style.zIndex = "10";
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.zIndex = "auto";
                  }}
                >
                  {val > 0 ? val : ""}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex justify-between mt-3 text-xs text-white/40">
        <div className="flex gap-4">
          <span>↓ Actual class</span>
          <span>→ Predicted class</span>
        </div>
        <span>Hover a cell for details</span>
      </div>

      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          <div className="px-3 py-2 text-xs" style={{ borderRadius: "0.5rem", minWidth: 140, background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-white/40">Actual</span>
              <span className="text-white font-medium">{SHORT[tooltip.ri]}</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-white/40">Predicted</span>
              <span className="font-medium" style={{ color: tooltip.ri === tooltip.ci ? color : "rgba(255,100,100,0.9)" }}>
                {SHORT[tooltip.ci]}
              </span>
            </div>
            <div className="border-t border-white/10 pt-1.5 flex justify-between">
              <span className="text-white/40">Count</span>
              <span className="text-white font-semibold">{tooltip.val}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label, suffix }: { active?: boolean, payload?: {value: number}[], label?: string, suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 text-sm">
      <p className="text-white/60 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value}{suffix ?? ""}</p>
    </div>
  );
}

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <span className="text-xs text-white/70 w-10 text-right font-mono">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

export default function ComparisonPage() {
  const [results, setResults] = useState<Record<string, { confusion_matrix: number[][] }> | null>(null);
  const [activeModel, setActiveModel] = useState("mlp");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    fetch(`${base}/results`).then(r => r.json()).then(setResults).catch(() => null);
  }, []);

  const activeColor = MODEL_COLORS[activeModel];
  const classMetrics = results?.[activeModel]
    ? computeClassMetrics(results[activeModel].confusion_matrix)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-16">
        <p className="text-white/40 text-sm tracking-widest uppercase mb-3">Results &amp; Analysis</p>
        <h1 className="text-5xl font-bold text-white mb-2">Comparison</h1>
        <div className="accent-bar w-16 mb-6" />
        <p className="text-white/60 text-lg max-w-2xl">
          Accuracy, parameters, and training time for all four models, along with per-model confusion matrices and per-class metrics.
        </p>
      </div>

      {/* Three bar charts */}
      <section className="grid grid-cols-3 gap-6 mb-16">
        {[
          { title: "Val Accuracy", key: "accuracy" as const, suffix: "", domain: [0, 1] as [number, number] },
          { title: "Parameters (M)", key: "params" as const, suffix: " M", domain: [0, 30] as [number, number] },
          { title: "Training time (min)", key: "time" as const, suffix: " min", domain: [0, 2] as [number, number] },
        ].map(({ title, key, suffix, domain }) => (
          <div key={title} className="glass p-6">
            <h3 className="text-white font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={overviewData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="model" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={domain} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip suffix={suffix} />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey={key} radius={[4, 4, 0, 0]}>
                  {overviewData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </section>

      {/* Summary table */}
      <section className="glass p-8 mb-16">
        <h2 className="text-xl font-bold text-white mb-6">Summary</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {["Model", "Parameters", "Val Accuracy", "Training time", "GPU"].map(h => (
                <th key={h} className="text-left text-white/40 text-xs uppercase tracking-wider pb-3 pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { model: "MLP",            params: "25 331 850", acc: "80%",  time: "0.8 min" },
              { model: "CNN",            params: "1 175 786",  acc: "92%",  time: "1.0 min" },
              { model: "EfficientNet-B0",params: "4 020 358",  acc: "98%",  time: "1.1 min" },
              { model: "ResNet-18",      params: "11 181 642", acc: "100%", time: "0.9 min" },
            ].map((row, i) => (
              <tr key={row.model} className="border-b border-white/5">
                <td className="py-4 pr-6">
                  <span className="font-medium" style={{ color: CHART_COLORS[i] }}>{row.model}</span>
                </td>
                <td className="py-4 pr-6 text-white/60 text-sm font-mono">{row.params}</td>
                <td className="py-4 pr-6 text-white font-semibold">{row.acc}</td>
                <td className="py-4 pr-6 text-white/60 text-sm">{row.time}</td>
                <td className="py-4 text-white/40 text-sm">NVIDIA L4</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Model selector (shared by confusion matrix + per-class metrics) */}
      <div className="flex gap-3 mb-8">
        {Object.entries(MODEL_NAMES).map(([key, name]) => (
          <button
            key={key}
            onClick={() => setActiveModel(key)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeModel === key ? `rgba(${hexToRgb(MODEL_COLORS[key])}, 0.2)` : "rgba(255,255,255,0.05)",
              border: `1px solid ${activeModel === key ? MODEL_COLORS[key] : "rgba(255,255,255,0.1)"}`,
              color: activeModel === key ? "white" : "rgba(255,255,255,0.5)",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Confusion matrix */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">Confusion Matrix</h2>
        <div className="accent-bar w-16 mb-6" />
        <p className="text-white/50 text-sm mb-8">
          Each row = actual class. Each column = predicted class. The diagonal (highlighted) shows correctly classified images.
        </p>

        {results && results[activeModel] ? (
          <ConfusionMatrix
            matrix={results[activeModel].confusion_matrix}
            modelName={MODEL_NAMES[activeModel]}
            color={activeColor}
          />
        ) : (
          <div className="glass p-12 text-center text-white/30">
            {results === null ? "Loading confusion matrices..." : "No data available"}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6">
          {CLASSES.map((cls, i) => (
            <div key={cls} className="flex items-center gap-2 text-xs text-white/50">
              <span className="font-mono text-white/30 w-4">{String(i).padStart(2,"0")}</span>
              <span>{cls}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Per-class metrics */}
      <section className="glass p-8">
        <h2 className="text-xl font-bold text-white mb-2">Per-class Metrics — {MODEL_NAMES[activeModel]}</h2>
        <p className="text-white/40 text-xs mb-6">Precision, recall and F1 computed from the confusion matrix above.</p>

        {classMetrics ? (
          <div>
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 mb-3 px-1">
              <span className="text-white/40 text-xs uppercase tracking-wider">Class</span>
              <span className="text-white/40 text-xs uppercase tracking-wider">Precision</span>
              <span className="text-white/40 text-xs uppercase tracking-wider">Recall</span>
              <span className="text-white/40 text-xs uppercase tracking-wider">F1</span>
            </div>
            <div className="flex flex-col gap-3">
              {classMetrics.map(({ name, precision, recall, f1 }) => (
                <div key={name} className="grid grid-cols-4 gap-4 items-center px-1 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-white/70 text-sm">{name}</span>
                  <MetricBar value={precision} color={activeColor} />
                  <MetricBar value={recall} color={activeColor} />
                  <MetricBar value={f1} color={activeColor} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-white/30 py-8">
            {results === null ? "Loading..." : "No data available"}
          </div>
        )}
      </section>
    </div>
  );
}
