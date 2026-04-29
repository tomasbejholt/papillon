const sections = [
  {
    number: "01",
    title: "Dataset",
    color: "#818cf8",
    content: `I used a butterfly and moth dataset from Kaggle with 100 species. I picked the 10 species that had the most images so the classes would be roughly equal in size. That way differences in accuracy between models would be about the model, not about one class having way more data than another.

The images are pretty clean with plain backgrounds, which makes it easier than real photos taken outside. I think a messier dataset would have been a better test, but it worked well for comparing the models.`,
  },
  {
    number: "02",
    title: "Why Four Models?",
    color: "#34d399",
    content: `I wanted to see how much difference the architecture makes when everything else stays the same. The MLP has no understanding of spatial structure at all. The CNN handles spatial patterns but is trained from scratch. EfficientNet and ResNet are both pretrained on ImageNet so they already know a lot about visual features before training even starts.

Going from MLP to CNN to pretrained models shows clearly where the big gains come from.`,
  },
  {
    number: "03",
    title: "Key Findings",
    color: "#f472b6",
    content: `The pretrained models were way better than I expected. ResNet-18 hit 100% and EfficientNet got 98%, both after about a minute of training. The CNN reached 92% and the MLP stopped at 80% even though it has 25 million parameters, which is actually more than ResNet-18.

The big takeaway for me was that having pretrained weights matters a lot more than having a big model. The MLP just memorizes patterns without really understanding what it's looking at.`,
  },
  {
    number: "04",
    title: "Challenges",
    color: "#38bdf8",
    content: `The hardest part was figuring out the learning rate for fine-tuning. When I used the same learning rate for all layers the training went unstable. I fixed it by using lower learning rates for the early layers and higher ones for the final classification layer. The early layers already have good general features so you don't want to change them too much.

Some species also look really similar, like Mourning Cloak and Brown Argus. The weaker models mixed these up a lot. ResNet managed to tell them apart, which I think is because its features are just more detailed.`,
  },
  {
    number: "05",
    title: "What I Would Do Differently",
    color: "#fb923c",
    content: `I would try a harder dataset with photos from the wild instead of the clean Kaggle images. The plain backgrounds probably make it easier than it would be in a real use case.

I would also use more data augmentation, especially for the MLP and CNN. They had less to work with and I think more variation in the training images would have helped.

Overall it was a fun project and comparing four models side by side gave me a much better feel for what actually makes a difference in practice.`,
  },
  {
    number: "06",
    title: "Deployment",
    color: "#a3e635",
    content: `The API is hosted on Hugging Face Spaces using a Docker container. It runs FastAPI with uvicorn on port 7860, which is the default port Hugging Face exposes. All four models are loaded into memory at startup and run inference on CPU. Hugging Face gives 16 GB RAM and 2 vCPUs on the free tier, which is enough to keep all models loaded without issues.

The frontend is deployed on Vercel and connects to the API via an environment variable. The source code is public on GitHub.`,
  },
];

export default function ReflectionPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-16">
        <p className="text-white/40 text-sm tracking-widest uppercase mb-3">Assignment 3</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Reflection</h1>
        <div className="accent-bar w-16 mb-6" />
        <p className="text-white/60 text-lg max-w-2xl">
          A look back at the dataset, modelling decisions, results, and what I would approach differently next time.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {sections.map((s) => (
          <div key={s.number} className="glass p-5 md:p-8">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-white/20 font-mono text-sm">{s.number}</span>
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: s.color }}>{s.title}</h2>
            </div>
            <div className="accent-bar mb-6" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            {s.content.split("\n\n").map((para, i) => (
              <p key={i} className="text-white/70 leading-relaxed mb-4 last:mb-0">{para}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
