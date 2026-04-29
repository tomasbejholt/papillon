# Papillon – Butterfly Classification Web App

## Vad är det här?
Ett ML-projekt som klassificerar 10 fjärils- och malesarter med fyra modeller tränade på Google Colab (L4 GPU). Projektet består av en FastAPI-backend och en Next.js-frontend.

## Nuläge
Allt fungerar lokalt. **Nästa steg är deployment: API → Render, Frontend → Vercel.**

---

## Stack
- **Backend:** FastAPI (Python), kör med uvicorn
- **Frontend:** Next.js 15 (TypeScript), glassmorphism UI
- **Modeller:** PyTorch CPU-inference (4 modeller laddas vid uppstart)

## Mappstruktur
```
papillon/
├── api/
│   ├── main.py          # FastAPI app med alla endpoints
│   ├── requirements.txt # CPU-only torch
│   └── test_images/     # 50 testbilder (ej sedda av modellerna under träning)
├── frontend/
│   ├── app/             # Next.js app router
│   │   ├── page.tsx         # Home
│   │   ├── models/          # Modellinfo-sida
│   │   ├── comparison/      # Jämförelse med per-klass metrics
│   │   ├── test/            # Testa bilder (upload + testgalleri)
│   │   └── reflection/      # Reflektionssida
│   ├── components/Navbar.tsx
│   └── lib/api.ts       # API-klient
├── models/              # Tränade .pth-filer (ej i git normalt)
│   ├── mlp.pth          (~97 MB)
│   ├── cnn.pth          (~4.5 MB)
│   ├── efficientnet_b0.pth (~16 MB)
│   └── resnet18.pth     (~43 MB)
└── render.yaml          # Render deployment config
```

## Köra lokalt
```bash
# API (från api/-mappen)
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (från frontend/-mappen)
npm install
npx next dev
```

Frontend env: skapa `frontend/.env.local` med:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API-endpoints
| Endpoint | Metod | Beskrivning |
|---|---|---|
| `/health` | GET | Healthcheck |
| `/predict` | POST | Klassificera uppladdad bild |
| `/predict/{filename}` | GET | Klassificera testbild |
| `/test-images` | GET | Lista alla testbilder |
| `/test-image/{filename}` | GET | Hämta testbild |
| `/random-image` | GET | Slumpmässig testbild (header: X-Species) |
| `/results` | GET | Confusion matrices + classification reports |
| `/model-info` | GET | Parametrar, accuracy, träningstid per modell |

## De 10 arterna
MOURNING CLOAK, GREEN HAIRSTREAK, BROWN ARGUS, BROOKES BIRDWING, SLEEPY ORANGE, CHALK HILL BLUE, ATALA, HUMMING BIRD HAWK MOTH, WHITE LINED SPHINX MOTH, ARCIGERA FLOWER MOTH

## Modellresultat (val accuracy)
| Modell | Parametrar | Val Accuracy | Träningstid |
|---|---|---|---|
| MLP | 25.3M | 80% | 0.8 min |
| CNN | 1.2M | 92% | 1.0 min |
| EfficientNet-B0 | 4.0M | 98% | 1.1 min |
| ResNet-18 | 11.2M | 100% | 0.9 min |

---

## Deployment – vad som ska göras

### Hugging Face Spaces (API) ← vald plattform
Valdes över Render pga. generösare gratis-tier (16 GB RAM, 2 vCPUs — ingen risk med 4 laddade modeller).

Vad som behövs:
1. Skapa ett HF Space av typen **Docker** på huggingface.co
2. Lägg till en `Dockerfile` i `api/`-mappen
3. Ladda upp modellfilerna till Spacet (git-lfs eller via HF web-UI — totalt ~160 MB)
4. Pusha `api/`-innehållet till Space-repot

Space-URL:en blir: `https://huggingface.co/spaces/<username>/<spacename>`  
API-URL:en (för frontend) blir: `https://<username>-<spacename>.hf.space`

`Dockerfile` behöver:
- Base image med Python
- `COPY . .`
- `RUN pip install -r requirements.txt`
- `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]`  
  *(HF Spaces exponerar port 7860 som standard)*

**OBS:** Modellsökvägen i `main.py` pekar på `../models/` — i ett Space-repo bör modellerna ligga i `models/` och sökvägen justeras, ELLER så kopieras allt (inklusive models/) in i Spacet.

### Vercel (Frontend)
- Root directory: `frontend/`
- Framework: Next.js (auto-detekteras)
- Environment variable att sätta: `NEXT_PUBLIC_API_URL=https://<username>-<spacename>.hf.space`
- HF Space-URL:en är känd först efter API:et är deployat

### Ordning
1. Skapa HF Space (Docker) → pusha API + modeller → kopiera URL
2. Sätt `NEXT_PUBLIC_API_URL` i Vercel environment variables
3. Deploya frontend till Vercel

---

## Viktiga detaljer
- `main.py` laddar modellerna från `../models/` relativt `api/`-mappen (`Path(__file__).parent.parent / "models"`)
- CORS är öppen (`allow_origins=["*"]`) — OK för ett skolprojekt
- `X-Species`-headern i `/random-image` är exponerad via `Access-Control-Expose-Headers`
- Allt är på engelska (lärarkrav)
