# Curio — Project Specifications

> **Version:** 1.0  
> **Last Updated:** January 27, 2026  
> **Status:** MVP Development for Codyssey: WebQuest Hackathon  
> **Deadline:** January 30, 2026

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | **Canonical visual reference** — colors, typography, components |
| `/references/` folder | HTML prototypes for visual inspiration |

---

## Platform

| Aspect | Specification |
|--------|---------------|
| **Type** | Progressive Web App (PWA) |
| **Platform** | **Web-only** — No native mobile apps (no Expo, no React Native) |
| **Responsive** | Mobile-first design that scales to tablet and desktop |
| **Browser Support** | Chrome 90+, Safari 14+, Firefox 90+, Edge 90+ |
| **Mobile Access** | Via mobile browser (Chrome/Safari) — installable as PWA |
| **Offline** | Service worker caching for basic offline functionality |

> ⚠️ **Important**: This is a **web application**, not a native mobile app. Users access Curio through their mobile or desktop browser. The UI is responsive and optimized for mobile screens, but it runs in the browser.

---

## Executive Summary

**Curio** is a real-time, community-driven web application that helps Filipino patients and caregivers locate scarce medicines in nearby pharmacies. Using a crowdsourced "Waze for medicines" model, users can search for medications, view stock availability on an interactive map, and contribute stock reports to help others—earning **Alay Points** for their contributions.

The MVP focuses on **Malolos, Bulacan** (near Bulacan State University) with ~50 pre-seeded pharmacies and 100+ common medicines.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Target Users](#target-users)
3. [Core Features (MVP)](#core-features-mvp)
4. [Technical Architecture](#technical-architecture)
5. [AI/ML Integration](#aiml-integration)
6. [Design System](#design-system)
7. [User Flows](#user-flows)
8. [Data Models](#data-models)
9. [API Specifications](#api-specifications)
10. [Anti-Abuse & Verification System](#anti-abuse--verification-system)
11. [Accessibility Features](#accessibility-features)
12. [Offline Support](#offline-support)
13. [Success Metrics](#success-metrics)
14. [Risks & Mitigations](#risks--mitigations)
15. [Timeline & Milestones](#timeline--milestones)
16. [Post-Hackathon Plans](#post-hackathon-plans)

---

## Problem Statement

### The Pain Point

Millions of Filipino patients and caregivers waste hours visiting multiple pharmacies searching for medicines—especially:
- **Maintenance medications** (Metformin, Losartan, insulin)
- **Seasonal high-demand medicines** (flu, cough, fever meds)
- **Rare/specialty drugs** (not stocked everywhere)

### The Gap

| Existing Solution | Problem |
|-------------------|---------|
| Mercury Drug App | No real-time stock visibility |
| Watsons App | Only shows Watsons inventory |
| MedGrocer | 24-48 hour delivery—useless for urgent needs |
| GrabMart Pharmacy | Limited partners, delivery fees |

**No platform aggregates stock availability across ALL pharmacies in real-time.**

### Our Solution

Curio uses **community intelligence** (like Waze for traffic) to crowdsource medicine availability data. Users contribute stock reports when visiting pharmacies, earning Alay Points as rewards.

---

## Target Users

### Primary User: Patients & Caregivers

| Attribute | Description |
|-----------|-------------|
| **Who** | Filipino patients, family caregivers (esp. for elderly/children) |
| **Age Range** | 25-60 years old |
| **Tech Savviness** | Moderate—comfortable with Facebook, GCash, basic apps |
| **Devices** | 90% Android, 10% iOS; majority on mobile data (not WiFi) |
| **Location** | Malolos, Bulacan (MVP scope) |
| **Pain Point** | Wasting time/money visiting pharmacies with no stock |

### Secondary Users

| User Type | Interaction |
|-----------|-------------|
| **Pharmacies** | Can claim their listing, update their own stock, attract customers |
| **Community Contributors** | Power users who frequently report stock to earn Alay Points |

### User Personas

#### Persona 1: Ate Mila (Primary)
- **Age:** 45, works as an office clerk
- **Scenario:** Needs to buy maintenance meds for her diabetic mother after work
- **Frustration:** Visited 3 pharmacies last week, all out of Metformin
- **Goal:** Find the nearest pharmacy with stock in one search

#### Persona 2: Kuya Jun (Contributor)
- **Age:** 32, pharmacy assistant
- **Scenario:** Wants to help his community while earning rewards
- **Behavior:** Reports stock at his pharmacy daily
- **Goal:** Reach "Platinum Contributor" status, redeem vouchers

---

## Core Features (MVP)

### Priority Matrix

| Priority | Feature | Description | Status |
|----------|---------|-------------|--------|
| 🟢 **P0** | Smart Search | Search by brand or generic name with fuzzy matching | Must Have |
| 🟢 **P0** | Real-Time Map | Interactive map with stock status markers (🟢🟡🔴) | Must Have |
| 🟢 **P0** | Pharmacy Details | Bottom sheet with distance, hours, contact, last updated | Must Have |
| 🟢 **P0** | Stock Reporting (Alay) | Users confirm/deny stock availability | Must Have |
| 🟡 **P1** | Medi-Bot Chatbot | AI assistant for symptom → generic name suggestions | Should Have |
| 🟡 **P1** | Generic Hero Toggle | Show generic alternatives when brand unavailable | Should Have |
| 🟡 **P1** | User Profile & Points | View Alay Points, contribution history, streaks | Should Have |
| 🟠 **P2** | Prescription OCR | Scan prescription to extract medicine names | Nice to Have |
| 🟠 **P2** | Voice Search | Tagalog voice input ("Hanapin ang Biogesic") | Nice to Have |
| 🟠 **P2** | Offline Mode | Cache pharmacy/medicine data for offline viewing | Nice to Have |

---

### Feature Specifications

#### 1. Smart Search Bar

```
┌─────────────────────────────────────────────┐
│ 🔍  Maghanap ng gamot...            [🎤] [⚙️] │
└─────────────────────────────────────────────┘
```

| Requirement | Specification |
|-------------|---------------|
| Auto-complete | Suggest as user types (brand + generic names) |
| Fuzzy Matching | Handle misspellings (e.g., "Biogisic" → "Biogesic") |
| Recent Searches | Store last 10 searches in localStorage |
| Voice Input | Web Speech API for Tagalog voice search |
| Keyboard | Show "Search" button on mobile keyboard |

#### 2. Real-Time Availability Map

| Requirement | Specification |
|-------------|---------------|
| Map Library | Leaflet.js + OpenStreetMap (free, no API key) |
| Initial View | Center on user's geolocation (or Malolos default) |
| Markers | Custom pill icons: 🟢 In Stock, 🟡 Low Stock, 🔴 Out of Stock |
| Clustering | Cluster markers when zoomed out (Leaflet.markercluster) |
| Real-time Updates | Supabase Realtime subscriptions for instant marker updates |
| Interaction | Tap marker → show pharmacy bottom sheet |

#### 3. Pharmacy Details (Bottom Sheet)

```
┌─────────────────────────────────────────────┐
│  ━━━  (drag handle)                         │
│                                             │
│  [Logo]  Mercury Drug - Malolos             │
│          📍 0.5 km • Open 24 Hours          │
│          🕐 Updated 10 mins ago by 3 users  │
│                                             │
│  Looking for: Biogesic 500mg                │
│  ┌───────────────────────────────────────┐  │
│  │  🟢 MAY STOCK                         │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │  📞 Tawagan │  │  🧭 I-Navigate      │   │
│  └─────────────┘  └─────────────────────┘   │
│                                             │
│  ─────── Community Verification ───────     │
│  Is Biogesic available?                     │
│  ┌──────────┐  ┌──────────────────────┐     │
│  │ ❌ WALA  │  │  ✅ OO, MERON        │     │
│  └──────────┘  └──────────────────────┘     │
└─────────────────────────────────────────────┘
```

#### 4. Stock Reporting System (Alay)

| Action | Points Earned |
|--------|---------------|
| Verify stock at a pharmacy | +10 Alay |
| First report of the day for a pharmacy | +20 Alay |
| Report marked as "helpful" by 5+ users | +50 Alay |
| 7-day contribution streak | +100 Alay |

**Redemption (Simulated for Demo):**

| Reward | Cost |
|--------|------|
| ₱10 off at partner pharmacy | 100 Alay |
| ₱25 off | 200 Alay |
| ₱50 off | 400 Alay |

#### 5. Medi-Bot (AI Chatbot)

```
┌─────────────────────────────────────────────┐
│ ⚠️ Disclaimer: Medi-Bot is an AI assistant. │
│    In emergencies, call 911 immediately.    │
├─────────────────────────────────────────────┤
│                                             │
│  🤖 Kamusta! I am Medi-Bot.                 │
│     What are you feeling today?             │
│                                             │
│  ┌──────────────────┐ ┌─────────────────┐   │
│  │ Sumasakit ulo 🤕 │ │ Ubo at sipon 🤧 │   │
│  └──────────────────┘ └─────────────────┘   │
│                                             │
│  👤 Sumasakit ulo ko                        │
│                                             │
│  🤖 ┌────────────────────────────────────┐  │
│     │ 💊 Paracetamol                     │  │
│     │ Common Brands: Biogesic, Tempra    │  │
│     │ Dosage: 500mg every 4-6 hours      │  │
│     │                                    │  │
│     │ [🗺️ Hanapin sa mapa]               │  │
│     └────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Type your symptoms...          [📤] │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

| Constraint | Implementation |
|------------|----------------|
| Safety | Only suggests OTC medicines; always shows disclaimer |
| Scope | Maps symptoms → generic drug names only |
| API | OpenRouter API (free tier) with Llama 3.1 or Gemma 2 models |

#### 6. Prescription OCR (Reseta Reader)

| Specification | Details |
|---------------|---------|
| Model | **NAVER Clova Donut** (transformer-based OCR) |
| Location | `ml-service/medical-prescription-ocr/` |
| Accuracy | 84% word-level, 71% character-level |
| Capability | Handles **handwritten** prescriptions |
| Output | Extracts medicine names only (MVP scope) |
| API Endpoint | `POST /api/ai/scan-prescription` |

**User Flow:**
1. User taps "Scan Prescription" button
2. Camera opens with scanning frame
3. User captures or uploads image
4. OCR extracts medicine names
5. User reviews/edits extracted items
6. Tap "Hanapin Lahat" to search all medicines on map

---

## Technical Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + Vite | Fast HMR, modern patterns |
| **Styling** | Tailwind CSS | Rapid prototyping, mobile-first |
| **Maps** | Leaflet.js + OpenStreetMap | Free, no credit card |
| **State** | Zustand | Simple, lightweight |
| **Data Fetching** | TanStack Query | Caching, real-time sync |
| **Backend** | Node.js + Express | JS full-stack consistency |
| **Database** | Supabase (PostgreSQL + PostGIS) | Real-time, geospatial queries |
| **Auth** | Supabase Auth | Optional sign-up flow |
| **AI/OCR** | Python FastAPI + Donut Model | Handwritten prescription OCR |
| **AI/Chat** | OpenRouter API (FREE) | Medi-Bot assistant (Llama 3.1 / Gemma 2) |
| **Hosting** | Vercel (FE) + Render (BE) + Railway (ML) | Free tiers |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   React     │  │   Leaflet   │  │  PWA/Cache  │                 │
│  │   + Vite    │  │   Map       │  │  (Offline)  │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
└─────────┼────────────────┼────────────────┼────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Express.js Server                         │   │
│  │  /api/search  /api/pharmacies  /api/report  /api/user       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Supabase     │  │   ML Service    │  │  OpenRouter API │
│  ┌───────────┐  │  │  ┌───────────┐  │  │  (Medi-Bot)     │
│  │ PostgreSQL│  │  │  │ Donut OCR │  │  │  Llama/Gemma    │
│  │ + PostGIS │  │  │  │ (FastAPI) │  │  │  FREE tier      │
│  └───────────┘  │  │  └───────────┘  │  │                 │
│  ┌───────────┐  │  └─────────────────┘  └─────────────────┘
│  │ Realtime  │  │
│  │ Websocket │  │
│  └───────────┘  │
└─────────────────┘
```

### Folder Structure

```
curio/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/             # Base components (Button, Input, Card)
│   │   │   ├── map/            # MapView, Marker, BottomSheet
│   │   │   ├── search/         # SearchBar, SearchResults
│   │   │   └── layout/         # Header, Navigation, Footer
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/           # Login, Register, Profile
│   │   │   ├── search/         # Medicine search logic
│   │   │   ├── pharmacy/       # Pharmacy details, stock
│   │   │   ├── alay/           # Contribution system
│   │   │   ├── medi-bot/       # AI chatbot
│   │   │   └── ocr/            # Prescription scanner
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities, API client
│   │   ├── stores/             # Zustand stores
│   │   ├── types/              # TypeScript types
│   │   └── App.tsx
│   ├── public/
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── controllers/        # Business logic
│   │   ├── services/           # External service integrations
│   │   ├── middleware/         # Auth, validation, rate limiting
│   │   ├── utils/              # Helpers
│   │   └── index.ts
│   └── package.json
│
├── ml-service/                 # Python ML Service
│   └── medical-prescription-ocr/
│       ├── app.py              # FastAPI server
│       ├── model/              # Donut model files
│       └── requirements.txt
│
├── database/                   # Database scripts
│   ├── migrations/
│   ├── seeds/                  # Initial data (pharmacies, medicines)
│   └── schema.sql
│
└── docs/                       # Documentation
    └── api.md
```

---

## AI/ML Integration

### 1. Prescription OCR (Reseta Reader)

**Model:** NAVER Clova Donut (Vision Encoder-Decoder Transformer)

**Location:** `ml-service/medical-prescription-ocr/`

**Performance:**
| Metric | Score |
|--------|-------|
| Character-level accuracy | 71% |
| Word-level accuracy | 84% |
| Processing speed | ~2s/image (CPU) |

**API Contract:**

```typescript
// Request
POST /api/ai/scan-prescription
Content-Type: multipart/form-data

{
  image: File  // JPEG/PNG, max 5MB
}

// Response
{
  success: true,
  data: {
    extracted_text: "Metformin 500mg\nLosartan 50mg",
    medicines: [
      { name: "Metformin 500mg", confidence: 0.98 },
      { name: "Losartan 50mg", confidence: 0.95 }
    ],
    is_prescription: true,
    classification_confidence: 0.92
  }
}
```

### 2. Medi-Bot (Generic Name Assistant)

**API:** OpenRouter (FREE tier)  
**Recommended Models:**
- `meta-llama/llama-3.1-8b-instruct:free` (best quality)
- `google/gemma-2-9b-it:free` (alternative)
- `mistralai/mistral-7b-instruct:free` (fallback)

**Rate Limits:** ~20 requests/minute on free tier

**System Prompt:**
```
You are Medi-Bot, a Filipino pharmacy assistant helping users find generic medicine names.

RULES:
1. Only suggest OTC (over-the-counter) medicines
2. Always respond in Taglish (Tagalog + English mix)
3. Never diagnose conditions—only map symptoms to common OTC generic names
4. Always include: "Hindi ito medical advice. Kumonsulta sa pharmacist o doktor."
5. For prescription medicines, say: "Kailangan mo ng reseta para dito. Kumonsulta sa doktor."

RESPONSE FORMAT:
- Generic Name: [name]
- Common Brands: [brand1, brand2]
- Typical Use: [description]
- Suggested Action: [search on Curio / consult doctor]
```

---

## Design System

> 📖 **Full Design System**: See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for the complete canonical reference including all colors, typography, components, and Tailwind configuration.

### Color Palette (Summary)

| Role | Light Mode | Dark Mode | Hex |
|------|------------|-----------|-----|
| **Primary** | Teal | Teal | `#0F766E` |
| **Primary Light** | Mint | Mint | `#13ECDA` |
| **Accent/CTA** | Coral | Coral | `#F97316` / `#FF7F50` |
| **Success (In Stock)** | Emerald | Emerald | `#10B981` |
| **Warning (Low Stock)** | Amber | Amber | `#F59E0B` |
| **Danger (Out of Stock)** | Rose | Rose | `#F43F5E` |
| **Background** | Off-white | Dark Teal | `#F6F8F8` / `#112120` |
| **Surface** | White | Dark Surface | `#FFFFFF` / `#1A2C2A` |
| **Text Primary** | Slate 900 | White | `#0E1B1A` / `#FFFFFF` |
| **Text Muted** | Slate 500 | Slate 400 | `#64748B` / `#94A3B8` |

### Typography (Summary)

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Display/Headings | Plus Jakarta Sans | 700-800 | 24-48px |
| Body | Noto Sans | 400-500 | 14-16px |
| Labels | Plus Jakarta Sans | 600 | 12-14px |
| Mono (points) | Space Mono | 400-700 | 14-24px |

### Visual References

The `/references/` folder contains HTML prototypes for each screen:

| Reference | Use For |
|-----------|---------|
| `home_map_view_-_live_tracking/` | Map view, navigation, pharmacy cards |
| `medicine_search_results/` | Search results layout |
| `alay_stock_report_contribution/` | Stock reporting modal |
| `prescription_ocr_scanner/` | OCR scanner interface |
| `medi-bot_ai_assistant/` | Chat interface |
| `pharmacy_detail_&_verification/` | Pharmacy detail page |
| `user_profile_&_alay_dashboard/` | Profile, gamification |
| `onboarding_-_bayanihan_spirit/` | Onboarding flow |

**Minimum Touch Target:** 44x44px for all interactive elements

---

## User Flows

### Flow 1: Search & Find Medicine

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Home      │ ──▶ │   Search    │ ──▶ │   Results   │
│   (Map)     │     │   "Biogesic"│     │   Map View  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │   Navigate  │ ◀── │   Pharmacy  │
                    │   to Store  │     │   Details   │
                    └─────────────┘     └─────────────┘
```

### Flow 2: Contribute Stock Report

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Near      │ ──▶ │   Prompt:   │ ──▶ │   Confirm   │
│   Pharmacy  │     │   "May stock│     │   Yes/No    │
│   (GPS)     │     │   ba?"      │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │   View      │ ◀── │   +10 Alay  │
                    │   Profile   │     │   Points!   │
                    └─────────────┘     └─────────────┘
```

### Flow 3: Scan Prescription (OCR)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Tap Scan  │ ──▶ │   Camera    │ ──▶ │   Review    │
│   Button    │     │   Capture   │     │   Extracted │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │   Results   │ ◀── │   Search    │
                    │   Map View  │     │   All Meds  │
                    └─────────────┘     └─────────────┘
```

---

## Data Models

### Database Schema (PostgreSQL + PostGIS)

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- PHARMACIES TABLE
-- ============================================
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  city VARCHAR(100) DEFAULT 'Malolos',
  province VARCHAR(100) DEFAULT 'Bulacan',
  phone VARCHAR(20),
  type VARCHAR(50) CHECK (type IN ('Chain', 'Independent', 'Hospital', 'Generics')),
  chain_name VARCHAR(100), -- Mercury Drug, Watsons, etc.
  operating_hours JSONB, -- {"mon": "08:00-22:00", "tue": "08:00-22:00", ...}
  is_24_hours BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geospatial index for fast nearby queries
CREATE INDEX idx_pharmacies_location ON pharmacies USING GIST(location);

-- ============================================
-- MEDICINES TABLE
-- ============================================
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(255),
  generic_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100), -- "500mg", "250mg/5ml"
  form VARCHAR(50), -- "Tablet", "Capsule", "Syrup"
  category VARCHAR(100), -- "Pain Relief", "Antibiotic", "Maintenance"
  tags TEXT[], -- ['Flu', 'Fever', 'OTC', 'Prescription']
  requires_prescription BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_medicines_search ON medicines 
USING GIN(to_tsvector('english', brand_name || ' ' || generic_name));

-- ============================================
-- INVENTORY REPORTS (Crowdsourced)
-- ============================================
CREATE TABLE inventory_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  helpful_count INT DEFAULT 0,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index for finding latest reports
CREATE INDEX idx_reports_pharmacy_medicine ON inventory_reports(pharmacy_id, medicine_id, reported_at DESC);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  alay_points INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_contribution_date DATE,
  contribution_count INT DEFAULT 0,
  helpful_votes_received INT DEFAULT 0,
  level VARCHAR(50) DEFAULT 'Baguhan', -- Baguhan, Scout, Champion, Legend
  is_pharmacy_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REPORT VOTES (Helpful/Not Helpful)
-- ============================================
CREATE TABLE report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES inventory_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

-- ============================================
-- PHARMACY CLAIMS (For pharmacy owners)
-- ============================================
CREATE TABLE pharmacy_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
```

### TypeScript Types

```typescript
// types/pharmacy.ts
export interface Pharmacy {
  id: string;
  name: string;
  slug: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  city: string;
  phone?: string;
  type: 'Chain' | 'Independent' | 'Hospital' | 'Generics';
  chainName?: string;
  operatingHours?: Record<string, string>;
  is24Hours: boolean;
  isVerified: boolean;
  logoUrl?: string;
  distance?: number; // Calculated field
}

// types/medicine.ts
export interface Medicine {
  id: string;
  brandName?: string;
  genericName: string;
  dosage?: string;
  form?: string;
  category?: string;
  tags: string[];
  requiresPrescription: boolean;
}

// types/inventory.ts
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryReport {
  id: string;
  pharmacyId: string;
  medicineId: string;
  status: StockStatus;
  reportedBy?: string;
  isAnonymous: boolean;
  helpfulCount: number;
  reportedAt: string;
  expiresAt: string;
}

// types/user.ts
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  alayPoints: number;
  streakDays: number;
  contributionCount: number;
  level: 'Baguhan' | 'Scout' | 'Champion' | 'Legend';
}
```

---

## API Specifications

### Base URL
- **Development:** `http://localhost:3001/api`
- **Production:** `https://api.curio.ph/api`

### Endpoints

#### Search

```typescript
// Search medicines
GET /api/search?q={query}&limit={limit}

Response: {
  success: true,
  data: Medicine[],
  meta: { total: number, query: string }
}
```

#### Pharmacies

```typescript
// Get nearby pharmacies with stock status
GET /api/pharmacies/nearby?lat={lat}&lng={lng}&radius={meters}&medicine_id={id}

Response: {
  success: true,
  data: Array<{
    pharmacy: Pharmacy,
    stockStatus: StockStatus | null,
    lastUpdated: string | null,
    reportCount: number
  }>
}

// Get pharmacy details
GET /api/pharmacies/:id

// Get pharmacy stock reports
GET /api/pharmacies/:id/stock?medicine_id={id}
```

#### Stock Reports

```typescript
// Submit stock report
POST /api/reports
Body: {
  pharmacy_id: string,
  medicine_id: string,
  status: StockStatus
}

Response: {
  success: true,
  data: {
    report: InventoryReport,
    points_earned: number,
    new_total: number
  }
}

// Vote on report
POST /api/reports/:id/vote
Body: { vote_type: 'helpful' | 'not_helpful' }
```

#### User

```typescript
// Get current user profile
GET /api/user/me

// Get user's Alay Points and stats
GET /api/user/points

Response: {
  success: true,
  data: {
    total_points: number,
    streak_days: number,
    contribution_count: number,
    level: string,
    next_level_points: number
  }
}
```

#### AI Services

```typescript
// OCR - Scan prescription
POST /api/ai/scan-prescription
Content-Type: multipart/form-data
Body: { image: File }

// Medi-Bot - Chat
POST /api/ai/medi-bot
Body: { message: string, conversation_id?: string }

Response: {
  success: true,
  data: {
    reply: string,
    suggested_medicines: Array<{ generic_name: string, brands: string[] }>,
    conversation_id: string
  }
}
```

---

## Anti-Abuse & Verification System

### Problem: Preventing Malicious Stock Reports

Bad actors could:
1. Mark competitors as "Out of Stock" to sabotage
2. Spam false "In Stock" reports for rewards
3. Create fake accounts to farm Alay Points

### Solution: Multi-Layer Trust System

#### Layer 1: Proximity Verification
```typescript
// User must be within 100m of pharmacy to report
const MAX_REPORT_DISTANCE = 100; // meters

async function verifyProximity(userId: string, pharmacyId: string): Promise<boolean> {
  const userLocation = await getUserLocation(userId);
  const pharmacy = await getPharmacy(pharmacyId);
  const distance = calculateDistance(userLocation, pharmacy.location);
  return distance <= MAX_REPORT_DISTANCE;
}
```

#### Layer 2: Rate Limiting
| Limit | Value |
|-------|-------|
| Reports per user per pharmacy | 1 per 4 hours |
| Reports per user per day | 20 max |
| Reports per pharmacy per hour | 50 max (to prevent coordinated attacks) |

#### Layer 3: Reputation-Weighted Reports
```typescript
// Reports from higher-level users carry more weight
const TRUST_WEIGHTS = {
  'Baguhan': 1.0,    // New user
  'Scout': 1.5,      // 10+ contributions
  'Champion': 2.0,   // 50+ contributions
  'Legend': 3.0,     // 200+ contributions
  'Pharmacy': 5.0    // Verified pharmacy owner
};

function calculateStockStatus(reports: InventoryReport[]): StockStatus {
  // Weighted voting based on user trust level
  let inStockWeight = 0;
  let outOfStockWeight = 0;
  
  for (const report of reports) {
    const weight = TRUST_WEIGHTS[report.userLevel];
    if (report.status === 'in_stock') inStockWeight += weight;
    else if (report.status === 'out_of_stock') outOfStockWeight += weight;
  }
  
  // Require significant agreement for status change
  if (inStockWeight > outOfStockWeight * 1.5) return 'in_stock';
  if (outOfStockWeight > inStockWeight * 1.5) return 'out_of_stock';
  return 'low_stock'; // Uncertain
}
```

#### Layer 4: Community Verification
- Users can mark reports as "Helpful" or "Not Helpful"
- Reports with >3 "Not Helpful" votes are flagged for review
- Consistently unhelpful reporters lose trust level

#### Layer 5: Pharmacy Self-Reporting
- Verified pharmacies can update their own stock (highest trust)
- Pharmacy reports override crowdsourced data
- Marked with "Verified by Pharmacy" badge

#### Layer 6: Anomaly Detection (Future)
- Flag unusual patterns (e.g., all reports from one user saying "out of stock")
- Time-based decay: older reports carry less weight
- Geographic clustering analysis

---

## Accessibility Features

### A. Voice Search (Tagalog)
```typescript
// Using Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'fil-PH'; // Filipino/Tagalog
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // e.g., "Hanapin ang Biogesic" → search for "Biogesic"
  performSearch(extractMedicineName(transcript));
};
```

### B. Large Text Mode
```typescript
// Tailwind classes for accessibility
const textSizes = {
  normal: 'text-base',
  large: 'text-lg',
  extraLarge: 'text-xl'
};

// User preference stored in localStorage
const [textSize, setTextSize] = useLocalStorage('textSize', 'normal');
```

### C. Taglish Interface
- All UI text available in Taglish (Tagalog + English mix)
- Natural Filipino phrasing: "Hanapin ang gamot", "May stock ba?", "Wala na"

### D. Minimum Touch Targets
- All buttons: minimum 44x44px
- Adequate spacing between interactive elements
- Large hit areas for map markers

---

## Offline Support

### Strategy: Cache-First with Network Update

```typescript
// Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Cache pharmacies and medicines for offline access
const CACHE_NAME = 'curio-v1';
const OFFLINE_URLS = [
  '/',
  '/offline.html',
  '/api/pharmacies/cached', // Pre-fetched pharmacy list
  '/api/medicines/cached'   // Pre-fetched medicine list
];
```

### Cached Data
| Data | Cache Duration | Update Strategy |
|------|----------------|-----------------|
| Pharmacy list | 24 hours | Background sync |
| Medicine list | 7 days | Manual refresh |
| User's recent searches | Persistent | Add on search |
| Map tiles | 24 hours | Cache-first |

### Offline Behavior
- Show cached pharmacy locations (but no real-time stock status)
- Display banner: "You're offline. Stock data may be outdated."
- Queue stock reports for submission when back online

---

## Success Metrics

### MVP Launch (Hackathon Demo)

| Metric | Target |
|--------|--------|
| Pre-seeded pharmacies | 50+ in Malolos |
| Pre-seeded medicines | 100+ common drugs |
| Demo flow completion | < 2 minutes |
| OCR accuracy (demo samples) | 80%+ |
| Page load time | < 3 seconds |

### Post-Launch (If Continued)

| Metric | 1 Month | 3 Months | 6 Months |
|--------|---------|----------|----------|
| Registered users | 100 | 500 | 2,000 |
| Daily Active Users | 20 | 100 | 400 |
| Stock reports/day | 10 | 50 | 200 |
| Pharmacies covered | 50 | 100 | 300 |
| Average search-to-find time | < 5 min | < 3 min | < 2 min |

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **OCR fails on demo** | High | Medium | Have manual input ready; use pre-tested sample prescriptions |
| **Map doesn't load** | High | Low | Fallback to list view; cache map tiles |
| **Supabase downtime** | High | Low | Implement local caching; show cached data |
| **Low initial data quality** | Medium | High | Pre-seed realistic data; simulate some reports |
| **Abuse/spam reports** | Medium | Medium | Rate limiting + proximity check |
| **OpenRouter rate limit** | Low | Medium | Cache common responses; use multiple free models as fallback |
| **Slow mobile network** | Medium | High | Optimize bundle size; lazy load features |

---

## Timeline & Milestones

### Development Schedule (January 20-30, 2026)

| Day | Date | Focus | Deliverables |
|-----|------|-------|--------------|
| 1-2 | Jan 20-21 | Setup & Core | Project scaffold, DB schema, basic UI |
| 3-4 | Jan 22-23 | Map & Search | Leaflet map, search API, pharmacy markers |
| 5-6 | Jan 24-25 | Alay System | Stock reporting, points system, user profile |
| 7 | Jan 26 | AI Features | Medi-Bot integration, OCR service connection |
| 8 | Jan 27 | Polish | UI refinement, accessibility, dark mode |
| 9 | Jan 28 | Testing | End-to-end testing, bug fixes |
| 10 | Jan 29 | Demo Prep | Seed data, practice pitch, backup plans |
| 11 | Jan 30 | **DEADLINE** | Final submission |

### Demo Day Checklist

- [ ] Pre-seed 50+ pharmacies in Malolos area
- [ ] Pre-seed 100+ common medicines with brand/generic names
- [ ] Test OCR with 3 reliable sample prescriptions
- [ ] Prepare "happy path" demo flow
- [ ] Browser tab title: "Curio - Find the Cure, Faster"
- [ ] Custom favicon (pill icon)
- [ ] Test on slow network (Chrome DevTools → Slow 3G)
- [ ] Backup: if OCR fails, have manual input ready
- [ ] Practice pitch timing (strictly under 3 minutes)
- [ ] Mobile demo device charged and ready

---

## Post-Hackathon Plans

### Decision: Archive as Portfolio Piece

After the January 30 deadline, Curio will be:
1. **Open-sourced** on GitHub with MIT license
2. **Documented** with README and contribution guide
3. **Archived** as a portfolio project demonstrating:
   - Real-time geospatial applications
   - Crowdsourcing/community features
   - AI/ML integration (OCR, chatbot)
   - Mobile-first Progressive Web App

### Future Vision (If Revived)

| Phase | Timeline | Features |
|-------|----------|----------|
| **V2** | +3 months | Metro Manila expansion, pharmacy partnerships |
| **V3** | +6 months | Price comparison, generic savings calculator |
| **V4** | +12 months | Delivery integration, PhilHealth coverage info |

### Monetization Model (Freemium)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | ₱0 | Search, map, contribute reports |
| **Premium** | ₱99/month | No ads, priority support, advanced filters |
| **Pharmacy** | ₱499/month | Claimed listing, analytics, promoted placement |

---

## Appendix

### A. Reference UI Designs

Located in `/references/` folder:
- `home_map_view_-_live_tracking/` - Main map interface
- `medicine_search_results/` - Search results page
- `pharmacy_detail_&_verification/` - Pharmacy bottom sheet
- `alay_stock_report_contribution/` - Stock reporting modal
- `medi-bot_ai_assistant/` - Chatbot interface
- `prescription_ocr_scanner/` - OCR scanner UI
- `user_profile_&_alay_dashboard/` - User profile page
- `onboarding_-_bayanihan_spirit/` - Onboarding screens

### B. Sample Data Files

To be created in `/database/seeds/`:
- `pharmacies.json` - 50+ Malolos pharmacies
- `medicines.json` - 100+ common medicines
- `sample_reports.json` - Simulated stock reports

### C. Environment Variables

```env
# .env.example
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_MAP_DEFAULT_LAT=14.8527
VITE_MAP_DEFAULT_LNG=120.8150
VITE_MAP_DEFAULT_ZOOM=14

# Server
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ML_SERVICE_URL=http://localhost:8000
OPENROUTER_API_KEY=your_openrouter_key  # Free at openrouter.ai
```

---

*Document prepared for Codyssey: WebQuest Hackathon*  
*Bulacan State University, January 2026*
