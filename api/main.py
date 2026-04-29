from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import json
import random
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASSES = [
    "MOURNING CLOAK", "GREEN HAIRSTREAK", "BROWN ARGUS", "BROOKES BIRDWING",
    "SLEEPY ORANGE", "CHALK HILL BLUE", "ATALA", "HUMMING BIRD HAWK MOTH",
    "WHITE LINED SPHINX MOTH", "ARCIGERA FLOWER MOTH"
]
NUM_CLASSES = len(CLASSES)
MODELS_DIR     = Path(__file__).parent / "models"
TEST_IMAGES_DIR = Path(__file__).parent / "test_images"
RESULTS_PATH   = Path(__file__).parent / "model_results.json"

with open(RESULTS_PATH) as f:
    MODEL_RESULTS = json.load(f)

TEST_IMAGES = list(TEST_IMAGES_DIR.glob("*.jpg"))

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

transform_128 = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])

transform_224 = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])


class MLP(nn.Module):
    def __init__(self, input_size, num_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(input_size, 512), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(512, 256),        nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(256, 128),        nn.ReLU(),
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        return self.net(x)


def conv_block(in_ch, out_ch, stride=1):
    return nn.Sequential(
        nn.Conv2d(in_ch, out_ch, kernel_size=3, stride=stride, padding=1, bias=False),
        nn.BatchNorm2d(out_ch),
        nn.ReLU(inplace=True),
    )


class CNN(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.features = nn.Sequential(
            conv_block(3, 32),
            conv_block(32, 32, stride=2),
            conv_block(32, 64),
            conv_block(64, 64, stride=2),
            conv_block(64, 128),
            conv_block(128, 128, stride=2),
            conv_block(128, 256),
            conv_block(256, 256, stride=2),
        )
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Dropout(0.4),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        return self.classifier(self.features(x))


def load_models():
    device = torch.device("cpu")

    mlp = MLP(3 * 128 * 128, NUM_CLASSES)
    mlp.load_state_dict(torch.load(MODELS_DIR / "mlp.pth", map_location=device, weights_only=True))
    mlp.eval()

    cnn = CNN(NUM_CLASSES)
    cnn.load_state_dict(torch.load(MODELS_DIR / "cnn.pth", map_location=device, weights_only=True))
    cnn.eval()

    efficientnet = models.efficientnet_b0(weights=None)
    efficientnet.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(efficientnet.classifier[1].in_features, NUM_CLASSES),
    )
    efficientnet.load_state_dict(torch.load(MODELS_DIR / "efficientnet_b0.pth", map_location=device, weights_only=True))
    efficientnet.eval()

    resnet = models.resnet18(weights=None)
    resnet.fc = nn.Linear(resnet.fc.in_features, NUM_CLASSES)
    resnet.load_state_dict(torch.load(MODELS_DIR / "resnet18.pth", map_location=device, weights_only=True))
    resnet.eval()

    return {
        "mlp":          (mlp,         transform_128),
        "cnn":          (cnn,         transform_128),
        "efficientnet": (efficientnet, transform_224),
        "resnet18":     (resnet,       transform_224),
    }


LOADED_MODELS = load_models()

TRAINING_GPU = "NVIDIA L4 (Google Colab Pro)"

MODEL_INFO = {
    "mlp":          {"name": "MLP",            "params": 25_331_850,  "val_accuracy": 0.80, "train_time_min": 0.8},
    "cnn":          {"name": "CNN",             "params": 1_175_786,   "val_accuracy": 0.92, "train_time_min": 1.0},
    "efficientnet": {"name": "EfficientNet-B0", "params": 4_020_358,   "val_accuracy": 0.98, "train_time_min": 1.1},
    "resnet18":     {"name": "ResNet-18",       "params": 11_181_642,  "val_accuracy": 1.00, "train_time_min": 0.9},
}


def predict_single(model, transform, image: Image.Image):
    tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1)[0]
    top_idx  = probs.argmax().item()
    return {
        "predicted_class": CLASSES[top_idx],
        "confidence":      round(probs[top_idx].item(), 4),
        "all_probs":       {cls: round(p.item(), 4) for cls, p in zip(CLASSES, probs)},
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/classes")
def get_classes():
    return {"classes": CLASSES}


@app.get("/model-info")
def get_model_info():
    return {"models": MODEL_INFO, "training_gpu": TRAINING_GPU}


@app.get("/results")
def get_results():
    return MODEL_RESULTS


@app.get("/random-image")
def random_image():
    if not TEST_IMAGES:
        raise HTTPException(status_code=404, detail="No test images found.")
    img_path = random.choice(TEST_IMAGES)
    species = "_".join(img_path.stem.split("_")[:-1]).replace("_", " ")
    return FileResponse(img_path, media_type="image/jpeg", headers={"X-Species": species, "Access-Control-Expose-Headers": "X-Species"})


@app.get("/test-images")
def list_test_images():
    return {"images": [f.name for f in TEST_IMAGES]}


@app.get("/test-image/{filename}")
def get_test_image(filename: str):
    img_path = TEST_IMAGES_DIR / filename
    if not img_path.exists():
        raise HTTPException(status_code=404, detail="Image not found.")
    return FileResponse(img_path, media_type="image/jpeg")


@app.get("/predict/{filename}")
def predict_by_filename(filename: str):
    img_path = TEST_IMAGES_DIR / filename
    if not img_path.exists():
        raise HTTPException(status_code=404, detail="Image not found.")
    image = Image.open(img_path).convert("RGB")
    results = {key: predict_single(model, transform, image) for key, (model, transform) in LOADED_MODELS.items()}
    return {"predictions": results}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the image.")

    results = {}
    for key, (model, transform) in LOADED_MODELS.items():
        results[key] = predict_single(model, transform, image)

    return {"predictions": results}
