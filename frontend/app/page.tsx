import Link from "next/link";

const stats = [
  { label: "Total species", value: "100" },
  { label: "Training images", value: "~12 500" },
  { label: "Validation images", value: "~500" },
  { label: "Image size", value: "224×224 px" },
];

const species = [
  "Mourning Cloak", "Green Hairstreak", "Brown Argus",
  "Brookes Birdwing", "Sleepy Orange", "Chalk Hill Blue",
  "Atala", "Humming Bird Hawk Moth", "White Lined Sphinx Moth", "Arcigera Flower Moth",
];

const models = [
  { name: "MLP", acc: "80%",  color: "#818cf8" },
  { name: "CNN", acc: "92%",  color: "#34d399" },
  { name: "EfficientNet-B0", acc: "98%", color: "#f472b6" },
  { name: "ResNet-18", acc: "100%", color: "#38bdf8" },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* Hero */}
      <section className="text-center mb-24">
        <p className="text-white/40 text-sm tracking-widest uppercase mb-4">Image Classification with Deep Learning</p>
        <h1 className="text-7xl font-bold gradient-text mb-6" style={{ lineHeight: 1.1 }}>
          Papillon
        </h1>
        <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Four models trained to identify 10 species of butterflies and moths.
          From simple MLP networks to pretrained ImageNet models.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/test" className="px-8 py-3 rounded-full text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
            Test the models
          </Link>
          <Link href="/comparison" className="glass px-8 py-3 rounded-full text-sm font-semibold text-white/80 hover:text-white transition-colors">
            View comparison
          </Link>
        </div>
      </section>

      {/* Model results overview */}
      <section className="grid grid-cols-4 gap-4 mb-20">
        {models.map((m) => (
          <div key={m.name} className="glass p-6 text-center glow-purple">
            <div className="text-3xl font-bold mb-1" style={{ color: m.color }}>{m.acc}</div>
            <div className="text-white/50 text-sm">{m.name}</div>
          </div>
        ))}
      </section>

      {/* Dataset */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-white mb-2">The Dataset</h2>
        <div className="accent-bar w-16 mb-8" />
        <div className="grid grid-cols-2 gap-8">
          <div className="glass p-8">
            <p className="text-white/70 leading-relaxed mb-6">
              Butterflies &amp; Moths is a Kaggle dataset containing images of
              100 butterfly and moth species photographed in natural environments. The images are standardised
              with a homogeneous background to simplify classification.
            </p>
            <p className="text-white/70 leading-relaxed">
              Of the 100 species, the 10 with the most training images are used in
              this project. This keeps classes balanced and experiments comparable.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass p-5">
                <div className="text-2xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-white/50 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Species */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-white mb-2">The 10 Species</h2>
        <div className="accent-bar w-16 mb-8" />
        <div className="grid grid-cols-2 gap-3">
          {species.map((s, i) => (
            <div key={s} className="glass px-5 py-3 flex items-center gap-3">
              <span className="text-white/30 text-xs font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-white/80 text-sm font-medium">{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Challenge */}
      <section className="glass p-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Why Is It Challenging?</h2>
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
          Many butterfly species share similar colour patterns and wing shapes. A trained human eye
          can tell them apart, but a neural network must learn these differences from scratch.
          That is precisely what makes it interesting to compare MLP, CNN, and pretrained models
          on the exact same task.
        </p>
      </section>
    </div>
  );
}
