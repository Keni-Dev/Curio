<p align="center">
  <img src="client/public/icons/icon-192x192.png" alt="Curio Logo" width="120" />
</p>

<h1 align="center">🩺 Curio — Find the Cure, Faster</h1>

<p align="center">
  <strong>A community-driven medicine finder for Filipinos</strong>
</p>

<p align="center">
  <a href="https://curio-tau.vercel.app/">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a> •
  <a href="#getting-started">🚀 Getting Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Python-ML%20Service-3776AB?style=flat-square&logo=python" alt="Python" />
</p>

---

## 📖 About

**Curio** is a real-time, community-powered Progressive Web App (PWA) that helps Filipino patients and caregivers locate scarce medicines in nearby pharmacies. Think of it as **"Waze for medicines"** — users can search for medications, view stock availability on an interactive map, and contribute stock reports to help others while earning **Alay Points** as rewards.

Built for the **Codyssey: WebQuest Hackathon** at Bulacan State University 🎓

> 💡 **The Problem:** Millions of Filipinos waste hours visiting multiple pharmacies searching for medicines — especially maintenance medications, seasonal drugs, and rare specialty items. No existing platform aggregates real-time stock availability across ALL pharmacies.
>
> 💊 **Our Solution:** Curio uses community intelligence to crowdsource medicine availability data, making the search for medicines faster and less frustrating!

---

## 👨‍💻 Developers

| Name | 
|------|
| **Kenny Ivan Zamora** |
| **Lorenz Gabriel Velasco** |
| **Rodelyn Viray** |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Styling |
| **Leaflet.js** | Interactive Maps |
| **Zustand** | State Management |
| **TanStack Query** | Data Fetching & Caching |
| **React Router** | Navigation |
| **PWA (Vite Plugin)** | Offline Support |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL + PostGIS + Realtime |
| **Supabase Auth** | Authentication |

### AI/ML Service
| Technology | Purpose |
|------------|---------|
| **Python** | ML Runtime |
| **PyTorch** | Deep Learning Framework |
| **NAVER Donut** | Prescription OCR (Handwritten) |
| **Transformers (HuggingFace)** | Model Loading |
| **Gradio** | ML API Interface |
| **OpenRouter API** | Medi-Bot AI Chat (Llama/Gemma) |

### Testing
| Technology | Purpose |
|------------|---------|
| **Vitest** | Unit & Integration Tests |
| **Playwright** | E2E Testing |
| **Testing Library** | Component Testing |
| **MSW** | API Mocking |

### Deployment
| Platform | Service |
|----------|---------|
| **Vercel** | Frontend Hosting |
| **Supabase** | Database & Auth |

---

## ✨ Features

### 🗺️ Real-Time Medicine Map
- Interactive map showing pharmacies with stock status markers (🟢 In Stock, 🟡 Low Stock, 🔴 Out of Stock)
- Geolocation-based nearby pharmacy search
- Real-time updates via Supabase subscriptions

### 🔍 Smart Medicine Search
- Search by brand name or generic name
- Fuzzy matching for misspellings (e.g., "Biogisic" → "Biogesic")
- Recent search history
- Voice search support (Tagalog)

### 🏪 Pharmacy Details
- Distance, operating hours, contact info
- Community-verified stock status
- One-tap call or navigation

### ⭐ Alay Points System (Gamification)
- Earn points for contributing stock reports
- Streak bonuses for daily contributions
- Level progression: Baguhan → Scout → Champion → Legend
- Redeemable rewards (simulated)

### 🤖 Medi-Bot AI Assistant
- Symptom-to-generic-name suggestions
- Taglish (Tagalog + English) responses
- Safe OTC recommendations only
- Powered by OpenRouter (Llama/Gemma models)

### 📷 Prescription OCR Scanner
- Scan handwritten prescriptions
- Extract medicine names automatically
- Powered by NAVER Donut model (84% word accuracy)

### 📱 Progressive Web App
- Installable on mobile devices
- Offline support with cached data
- Push-ready architecture

### ♿ Accessibility
- Large text mode
- Voice search
- 44x44px minimum touch targets
- Dark mode support

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- **Python** 3.10+ (for ML service)
- **Supabase** account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/curio.git
   cd curio
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_MAP_DEFAULT_LAT=14.8527
   VITE_MAP_DEFAULT_LNG=120.8150
   VITE_MAP_DEFAULT_ZOOM=14
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### ML Service Setup (Optional)

1. **Navigate to ML service**
   ```bash
   cd ml-service/medical-prescription-ocr
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download the model**
   ```bash
   python model_download.py
   ```

5. **Run the service**
   ```bash
   python app.py
   ```

---

## 📁 Project Structure

```
curio/
├── client/                     # React Frontend (PWA)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/             # Base components (Button, Input, Card)
│   │   │   ├── map/            # Map-related components
│   │   │   └── layout/         # Header, Navigation, Footer
│   │   ├── features/           # Feature modules
│   │   │   ├── alay/           # Points & gamification system
│   │   │   ├── auth/           # Authentication
│   │   │   ├── medi-bot/       # AI chatbot
│   │   │   ├── medicine/       # Medicine search
│   │   │   ├── ocr/            # Prescription scanner
│   │   │   ├── pharmacy/       # Pharmacy details
│   │   │   └── stock/          # Stock reporting
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities, API client, i18n
│   │   ├── pages/              # Route pages
│   │   ├── stores/             # Zustand state stores
│   │   └── types/              # TypeScript types
│   ├── public/                 # Static assets
│   └── e2e/                    # Playwright E2E tests
│
├── ml-service/                 # Python ML Service
│   └── medical-prescription-ocr/
│       ├── app.py              # Gradio/FastAPI server
│       ├── model/              # Donut model files
│       └── requirements.txt
│
├── supabase/                   # Database
│   └── migrations/             # SQL migrations & seed data
│
├── prompts/                    # AI-assisted development prompts
│   └── phase_01-07/            # Implementation guides
│
└── references/                 # UI/UX design prototypes (HTML)
```

---

## 🧪 Running Tests

### Unit & Integration Tests
```bash
cd client
pnpm test           # Watch mode
pnpm test:run       # Single run
pnpm test:coverage  # With coverage report
```

### End-to-End Tests
```bash
pnpm test:e2e           # Headless
pnpm test:e2e:headed    # With browser UI
pnpm test:e2e:debug     # Debug mode
```

---

## 🌐 API Overview

### Search
```
GET /api/search?q={query}&limit={limit}
```

### Pharmacies
```
GET /api/pharmacies/nearby?lat={lat}&lng={lng}&radius={meters}&medicine_id={id}
GET /api/pharmacies/:id
```

### Stock Reports
```
POST /api/reports
GET /api/pharmacies/:id/stock?medicine_id={id}
```

### AI Services
```
POST /api/ai/scan-prescription  # OCR
POST /api/ai/medi-bot           # Chat
```

---

## 🎯 MVP Scope

- **Location:** Malolos, Bulacan (near Bulacan State University)
- **Pharmacies:** 50+ pre-seeded pharmacies
- **Medicines:** 100+ common medications
- **Focus:** Real-time crowdsourced medicine availability

---

## 📸 Screenshots

> Coming soon! Visit our [live demo](https://curio-tau.vercel.app/) to see Curio in action.

---

## 📄 License

© 2026 Kenny Ivan Zamora, Lorenz Gabriel Velasco, Rodelyn Viray. All rights reserved.

This project was created for the Codyssey: WebQuest Hackathon at Bulacan State University.

---

<p align="center">
  Made with 💚 for Filipino patients and caregivers
</p>
