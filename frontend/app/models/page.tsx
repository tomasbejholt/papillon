const augmentation = "RandomHorizontalFlip, RandomRotation 15°, ColorJitter (brightness/contrast/saturation 0.3)";

const models = [
  {
    key: "mlp",
    name: "MLP",
    full: "Multilayer Perceptron",
    color: "#818cf8",
    accuracy: "80%",
    params: "25 331 850",
    trainTime: "0.8 min",
    inputSize: "128×128 px",
    epochs: 20,
    optimizer: "Adam (lr=1e-3)",
    loss: "CrossEntropyLoss",
    batchSize: "32",
    augmentation,
    description:
      "An MLP flattens the entire image into a long vector and runs it through fully connected layers. It sees no spatial patterns. Each pixel is treated independently of its neighbours. With 25 million parameters for just 10 classes, overfitting is a real problem, and 80% accuracy shows that.",
    strengths: ["Simple architecture", "Fast training", "Good as a baseline"],
    weaknesses: ["Ignores spatial patterns", "Overfits easily", "Scales poorly to large images"],
    architecture: ["Flatten → 49 152 nodes", "Linear 512 → ReLU → Dropout 0.3", "Linear 256 → ReLU → Dropout 0.3", "Linear 128 → ReLU", "Linear 10 (output)"],
  },
  {
    key: "cnn",
    name: "CNN",
    full: "Convolutional Neural Network",
    color: "#34d399",
    accuracy: "92%",
    params: "1 175 786",
    trainTime: "1.0 min",
    inputSize: "128×128 px",
    epochs: 25,
    optimizer: "Adam (lr=1e-3)",
    loss: "CrossEntropyLoss",
    batchSize: "32",
    augmentation,
    description:
      "A CNN uses convolutional layers that look for local patterns like edges, textures, and shapes, building up an understanding of the image layer by layer. Unlike MLP, it shares weights across the entire image, giving fewer parameters and better generalisation. 1.2M parameters and 92% accuracy.",
    strengths: ["Captures spatial patterns", "Efficient parameter usage", "Good generalisation"],
    weaknesses: ["Trained from scratch", "Needs more data than pretrained models", "Limited without prior knowledge"],
    architecture: ["Conv 3→32, Conv 32→32 stride 2", "Conv 32→64, Conv 64→64 stride 2", "Conv 64→128, Conv 128→128 stride 2", "Conv 128→256, Conv 256→256 stride 2", "AdaptiveAvgPool → Dropout → Linear 10"],
  },
  {
    key: "efficientnet",
    name: "EfficientNet-B0",
    full: "Transfer Learning: EfficientNet-B0",
    color: "#f472b6",
    accuracy: "98%",
    params: "4 020 358",
    trainTime: "1.1 min",
    inputSize: "224×224 px",
    epochs: 15,
    optimizer: "Adam (discriminative LR)",
    loss: "CrossEntropyLoss",
    batchSize: "32",
    augmentation,
    description:
      "EfficientNet-B0 is pretrained on ImageNet (~1.2M images, 1000 classes) and has already learned edges, textures, and shapes. Training happens in two phases: first only the new classification head is trained (frozen backbone), then the entire network is fine-tuned with discriminative learning rates. Early layers get a low LR (1e-5), later layers higher (5e-5), and the head highest (1e-4).",
    strengths: ["Prior knowledge from ImageNet", "High accuracy with little data", "Efficient architecture"],
    weaknesses: ["Requires 224×224 input", "Somewhat sensitive to LR during fine-tuning"],
    architecture: ["Phase 1: Freeze backbone, train head (5 epochs, lr=1e-3)", "Phase 2: Discriminative LR — early 1e-5, late 5e-5, head 1e-4 (10 epochs)", "Output: Dropout 0.2 → Linear 10"],
  },
  {
    key: "resnet18",
    name: "ResNet-18",
    full: "Transfer Learning: ResNet-18",
    color: "#38bdf8",
    accuracy: "100%",
    params: "11 181 642",
    trainTime: "0.9 min",
    inputSize: "224×224 px",
    epochs: 15,
    optimizer: "Adam (discriminative LR)",
    loss: "CrossEntropyLoss",
    batchSize: "32",
    augmentation,
    description:
      "ResNet-18 introduced residual connections (skip connections) that let gradients flow directly through the network, solving the vanishing gradient problem. Pretrained on ImageNet and fine-tuned with six parameter groups with gradually increasing learning rates from conv1 (1e-5) to fc (1e-3). Achieves 100% on validation data.",
    strengths: ["Skip connections prevent vanishing gradients", "Robust and well-proven", "100% val accuracy"],
    weaknesses: ["More parameters than EfficientNet", "Older architecture compared to modern variants"],
    architecture: ["Phase 1: Freeze backbone, train fc (5 epochs, lr=1e-3)", "Phase 2: 6 parameter groups — conv1/layer1: 1e-5, layer2: 2e-5, layer3: 5e-5, layer4: 1e-4, fc: 1e-3 (10 epochs)"],
  },
];

export default function ModelsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-16">
        <p className="text-white/40 text-sm tracking-widest uppercase mb-3">Architecture &amp; Training</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Models</h1>
        <div className="accent-bar w-16 mb-6" />
        <p className="text-white/60 text-lg max-w-2xl">
          Four models trained on the same data, from a simple baseline to state-of-the-art pretrained networks.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {models.map((m, i) => (
          <div key={m.key} className="glass p-5 md:p-8">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white/30 text-sm font-mono">0{i + 1}</span>
                  <h2 className="text-2xl font-bold" style={{ color: m.color }}>{m.name}</h2>
                </div>
                <p className="text-white/50 text-sm">{m.full}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{m.accuracy}</div>
                <div className="text-white/40 text-xs">val accuracy</div>
              </div>
            </div>

            <div className="accent-bar mb-6" style={{ background: `linear-gradient(90deg, ${m.color}, transparent)` }} />

            <p className="text-white/70 leading-relaxed mb-8">{m.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats */}
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Statistics</h3>
                <div className="flex flex-col gap-2">
                  {[
                    ["Parameters", m.params],
                    ["Training time", m.trainTime],
                    ["Epochs", String(m.epochs)],
                    ["Input", m.inputSize],
                    ["Batch size", m.batchSize],
                    ["Optimizer", m.optimizer],
                    ["Loss", m.loss],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm gap-4">
                      <span className="text-white/40 shrink-0">{k}</span>
                      <span className="text-white/80 font-medium text-right">{v}</span>
                    </div>
                  ))}
                </div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mt-4 mb-2">Augmentation</h3>
                <p className="text-white/50 text-xs leading-relaxed">{m.augmentation}</p>
              </div>

              {/* Strengths & weaknesses */}
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Strengths</h3>
                <ul className="flex flex-col gap-1 mb-4">
                  {m.strengths.map((s) => (
                    <li key={s} className="text-sm text-white/70 flex items-center gap-2">
                      <span style={{ color: m.color }}>+</span> {s}
                    </li>
                  ))}
                </ul>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Limitations</h3>
                <ul className="flex flex-col gap-1">
                  {m.weaknesses.map((w) => (
                    <li key={w} className="text-sm text-white/50 flex items-center gap-2">
                      <span className="text-white/30">−</span> {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Architecture */}
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Architecture</h3>
                <div className="flex flex-col gap-2">
                  {m.architecture.map((layer, idx) => (
                    <div key={idx} className="text-xs text-white/60 glass px-3 py-2" style={{ borderRadius: "0.5rem" }}>
                      {layer}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
