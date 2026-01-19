# Curio — Find the Cure, Faster

> **The Waze for Medicines.** A real-time, community-driven web app that helps Filipinos locate scarce medicines in nearby pharmacies—before wasting time and money visiting empty shelves.

---

## 🏷️ Project Identity

| | |
|---|---|
| **Name** | **Curio** |
| **Meaning** | From Latin *cūriō* (one who cares) + "cure" + the concept of *curiosity* in seeking answers. Curio is the caring companion that satisfies your urgent curiosity: *"Where can I find this medicine right now?"* |
| **Tagline** | *Find the Cure, Faster.* |
| **Alternative Taglines** | *Don't hop. Just drop (by the right pharmacy).* / *Your medicine, mapped.* |

### Alternative Name Suggestions

If "Curio" feels incomplete, consider these:

| Name | Meaning | Vibe |
|------|---------|------|
| **Curio** *(current)* | Cure + Curiosity | Elegant, memorable |
| **Gamotap** | Gamot + Tap | Playful, Filipino |
| **MedPin** | Medicine + Pin (on map) | Tech-forward |
| **Botika.ph** | Filipino for pharmacy | Localized trust |
| **Hanapan** | "Hanap" (to search) | Native, action-oriented |

---

## 📋 Competition Details

| | |
|---|---|
| **Event** | Codyssey: WebQuest |
| **Organizer** | College of Science, Bulacan State University |
| **Date** | January 2026 |
| **Deadline** | January 30, 2026 |
| **Team Size** | 3 members |
| **Theme** | Societal Development (Healthcare Access) |

### Judging Criteria Alignment

| Criteria | Weight | Curio's Strength |
|----------|--------|------------------|
| **Relevance to Societal Development** | 30% | ✅ Directly addresses UN SDG #3 (Good Health & Well-being) and medicine accessibility gap |
| **Creativity and Innovation** | 20% | ✅ First crowdsourced medicine availability platform in PH; Waze-inspired model |
| **User Experience** | 20% | ✅ Mobile-first, one-thumb navigation, location-aware |
| **Functionality & Technical Execution** | 20% | ✅ Real-time geospatial queries, AI-powered OCR and chatbot |
| **Overall Presentation** | 10% | ✅ Compelling narrative: healthcare equity for Filipinos |

---

## 🔴 The Problem

### The Scenario

> *"My lola needs Metformin tonight. I visited Mercury—wala. Tried Watsons—out of stock. Rose Pharmacy—closed. Three hours wasted. Finally found it at a small generics pharmacy 2km away that I didn't even know existed."*

This is the reality for millions of Filipinos searching for medicines, especially:
- **Rare/specialty medications** (not stocked everywhere)
- **High-demand seasonal medicines** (flu meds during rainy season)
- **Maintenance medications** (insulin, hypertension drugs)

### The Numbers

| Statistic | Source |
|-----------|--------|
| **30%** of the global population lacks regular access to essential medicines | WHO/PhilStar 2024 |
| **66%** of Philippine pharmaceuticals are imported, creating supply vulnerabilities | DOH |
| **Only 34%** of PH medicines are locally manufactured | BusinessWorld 2024 |
| PhilHealth GAMOT covers up to **₱20,000/year**—but only if you can *find* the medicine | PhilHealth |

---

## 🔍 The Gap (Our Opportunity)

| Current Solution | What They Do | The Problem | Curio's Solution |
|------------------|--------------|-------------|------------------|
| **Mercury Drug App** | Store locator, promos | **No ordering, no stock visibility** | Real-time stock status via crowdsourcing |
| **Watsons App** | Express delivery (3hrs) | **Only shows Watsons stock; poor real-time accuracy** | Aggregates ALL pharmacies |
| **MedGrocer** | Medicine delivery | **24-48 hour delivery**—useless for urgent needs | Guides users to walk-in pickup |
| **GrabMart Pharmacy** | 1-hour delivery | **Limited to partner pharmacies; delivery fees** | Free to search; no middleman |
| **DOH EDPMS** | Price & inventory monitoring | **Data not publicly accessible; updated quarterly, not real-time** | Real-time community updates |

> [!IMPORTANT]
> **The Core Insight**: No existing platform in the Philippines aggregates stock availability across *all* pharmacy chains in real-time. Curio fills this gap using community intelligence—the same model that made Waze successful for traffic.

---

## ✅ The Solution: Curio

### How It Works

```
1. USER searches "Metformin" (or scans prescription)
           ↓
2. MAP displays nearby pharmacies with stock status
   🟢 High Stock | 🟡 Low Stock | 🔴 Out of Stock
           ↓
3. USER taps pharmacy → sees distance, price, last updated
           ↓
4. USER navigates to pharmacy & picks up medicine
           ↓
5. USER confirms stock status → earns "Alay Points"
           ↓
6. COMMUNITY data stays fresh for the next searcher
```

### Core Features (MVP)

#### 1. 🔍 Smart Search Bar
- Auto-complete for brand names (Biogesic) AND generic names (Paracetamol)
- Fuzzy matching for misspellings
- Recent searches saved locally

#### 2. 🗺️ Real-Time Availability Map
- **Geolocation-aware**: Centers on user's current location
- **Custom markers**: Green/Yellow/Red pill icons for stock status
- **Bottom sheet drawer**: Pharmacy details without leaving map view

#### 3. 🤝 Community Stock Updates ("Alay" System)
- When near a pharmacy, users get a prompt: *"You're at Mercury Drug Malolos. Is Biogesic available?"*
- Simple Yes/No toggle
- Contributions earn **Alay Points** (see Gamification)

#### 4. 💊 Generic Hero Toggle
- If brand (Augmentin) is unavailable, toggle to see generic (Co-Amoxiclav) options
- Shows potential savings (often 50%+ cheaper)

---

## 🤖 AI & Machine Learning Features

### A. Reseta-Reader (Prescription OCR)

| | |
|---|---|
| **Problem** | Elderly users struggle to type complex drug names like "Metformin Hydrochloride" |
| **Solution** | Take a photo of a printed prescription → AI extracts drug names → Auto-fills search |
| **Tech** | Tesseract.js (client-side OCR) |
| **Limitation** | Works best with **printed/typed** prescriptions; handwriting recognition is limited |
| **Demo Strategy** | Use sample printed prescription images that reliably work |

> [!NOTE]
> **Accessibility Pitch**: "We use Computer Vision to make healthcare accessible to Lolo and Lola who struggle with small text on smartphones."

### B. Medi-Bot (Generic Name Assistant)

| | |
|---|---|
| **Problem** | Users don't know the generic name of their medicine |
| **Solution** | Chatbot asks: "What symptoms? Headache? Fever?" → Suggests generic name to search |
| **Tech** | Gemini API with constrained prompts |
| **Safety** | Only suggests OTC generics; always displays: *"This is not medical advice. Consult a pharmacist."* |

> [!CAUTION]
> **Regulatory Compliance**: Philippine FDA has regulations on medical software. Medi-Bot is positioned as an *informational tool*, not diagnostic. It only maps symptoms → generic drug names for OTC medicines.

### C. StockCast (Demand Predictor) — *If Time Permits*

| | |
|---|---|
| **Problem** | Flu medicines run out instantly during rainy season |
| **Solution** | Heuristic-based alerts: "Bioflu is HIGH DEMAND this week. Buy before it runs out." |
| **Tech** | Rule-based logic (not ML): rainy season + flu tag = high risk |

```javascript
function getStockRisk(medicine, date) {
  const month = new Date(date).getMonth();
  const isRainySeason = month >= 5 && month <= 10; // June-Nov
  
  if (isRainySeason && medicine.tags.includes('Flu')) {
    return { level: 'HIGH', message: 'Likely to run out soon!' };
  }
  return { level: 'NORMAL', message: 'Stock is stable' };
}
```

---

## 🎮 Gamification: Alay Points

> **"Alay"** (Filipino: *to offer/dedicate*) — Users offer their time to help the community. Better than "Health Points" because it emphasizes **contribution to others**.

### Point System

| Action | Points Earned |
|--------|---------------|
| Verify stock at a pharmacy | +10 Alay |
| First report of the day for a pharmacy | +20 Alay |
| Report marked as "helpful" by 5+ users | +50 Alay |
| Streak: 7 consecutive days of contributions | +100 Alay |

### Redemption (Simulated for Demo)

| Reward | Cost |
|--------|------|
| ₱10 off at partner pharmacy | 100 Alay |
| ₱25 off | 200 Alay |
| ₱50 off | 400 Alay |
| Free generic paracetamol (demo) | 500 Alay |

> [!NOTE]
> For the hackathon demo, partnerships are **simulated**. The redemption flow is fully functional but uses mock voucher codes.

---

## 🛠️ Technical Architecture

### Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **Frontend** | React.js (Vite) | Fast, component-based, great DX |
| **Styling** | Tailwind CSS | Rapid prototyping, mobile-first utilities |
| **Maps** | Leaflet.js + OpenStreetMap | Free, no credit card required |
| **Backend** | Node.js + Express | JavaScript full-stack consistency |
| **Database** | Supabase (PostgreSQL + PostGIS) | Real-time subscriptions, geospatial queries |
| **AI/OCR** | Tesseract.js (client) + Gemini API | Browser-based OCR, powerful LLM |
| **Hosting** | Vercel (frontend) + Render (backend) | Free tier, easy deployment |

### Database Schema

```sql
-- Pharmacies table
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  type TEXT CHECK (type IN ('Chain', 'Independent', 'Hospital')),
  address TEXT,
  operating_hours TEXT
);

-- Medicines table  
CREATE TABLE medicines (
  id UUID PRIMARY KEY,
  brand_name TEXT,
  generic_name TEXT NOT NULL,
  category TEXT,
  tags TEXT[] -- ['Flu', 'Pain', 'Maintenance']
);

-- Crowdsourced inventory reports
CREATE TABLE inventory_reports (
  id UUID PRIMARY KEY,
  pharmacy_id UUID REFERENCES pharmacies(id),
  medicine_id UUID REFERENCES medicines(id),
  status TEXT CHECK (status IN ('In Stock', 'Low', 'Out of Stock')),
  reported_by TEXT, -- anonymous user ID
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  helpful_count INT DEFAULT 0
);

-- User points
CREATE TABLE users (
  id UUID PRIMARY KEY,
  alay_points INT DEFAULT 0,
  streak_days INT DEFAULT 0
);
```

### Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/pharmacies/nearby?lat=X&lng=Y&radius=5000` | Find pharmacies within 5km |
| GET | `/api/search?q=biogesic` | Search medicines by name |
| GET | `/api/pharmacy/:id/stock` | Get stock reports for a pharmacy |
| POST | `/api/report` | Submit stock availability report |
| GET | `/api/user/points` | Get user's Alay Points |
| POST | `/api/ai/scan-prescription` | OCR prescription image |
| POST | `/api/ai/suggest-generic` | Medi-Bot chat endpoint |

---

## 🎨 Design System

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Teal | `#0F766E` | Trust, healing, medical |
| **Secondary** | Soft Mint | `#D1FAE5` | Backgrounds, cards |
| **Accent** | Coral | `#F97316` | CTAs, "Navigate Now" |
| **Success** | Emerald | `#10B981` | In Stock markers |
| **Warning** | Amber | `#F59E0B` | Low Stock markers |
| **Danger** | Rose | `#F43F5E` | Out of Stock markers |
| **Neutral** | Slate | `#64748B` | Text, borders |

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Headings | Inter | Bold (700) |
| Body | Roboto | Regular (400) |
| Labels | Roboto | Medium (500) |

### Mobile-First Principles

- Minimum tap target: 44x44px
- One-thumb navigation zone
- Bottom sheet drawers instead of full page navigations
- Large search bar as primary UI element

---

## 🗺️ MVP Scope

### Geographic Focus

**Bulacan Province** (initial launch area)
- Pre-seed database with 50+ pharmacies around BulSU Main Campus
- Include mix of: Mercury Drug, Watsons, Generika, TGP, independent pharmacies

### Feature Prioritization

| Priority | Feature | Status |
|----------|---------|--------|
| 🟢 P0 | Search + Map | Must have |
| 🟢 P0 | Stock status markers | Must have |
| 🟢 P0 | Pharmacy details drawer | Must have |
| 🟡 P1 | Contribution system (Alay) | Should have |
| 🟡 P1 | Medi-Bot chatbot | Should have |
| 🟡 P1 | Generic Hero toggle |  should have |
| 🟠 P2 | Prescription OCR | Nice to have |
| 🟠 P2 | StockCast predictions | Nice to have |
| 🟠 P2 | Voucher redemption | Nice to have |

---

## 🎤 Pitch Script (3 Minutes)

### 0:00 - 0:30 | The Hook

*"Last month, my cousin had an asthma attack at 11 PM. We visited four pharmacies. All closed or out of stock. We lost 45 critical minutes searching. This is the reality for millions of Filipinos. Delivery apps take hours—sometimes days. We need a solution for RIGHT NOW."*

### 0:30 - 1:30 | The Demo

1. Open Curio on phone (mirrored to screen)
2. "I need Salbutamol." *Type in search bar*
3. Map fills with pins. *Click green pin*
4. "Mercury Drug Malolos—500 meters away. High stock. Reported 10 minutes ago."
5. *Show OCR*: "My lola has this prescription." *Scan → auto-fills*
6. *Show contribution*: "I'm at the pharmacy. Let me update the community." *Tap Yes*
7. "I just earned 10 Alay Points. 90 more and I get ₱10 off my next purchase."

### 1:30 - 2:30 | The Tech & Impact

*"Under the hood, we use PostGIS for lightning-fast 'nearby' queries. Tesseract for prescription OCR. And Google Gemini for our Medi-Bot that helps users find generics—which can cost 50% less than branded."*

*"Curio addresses UN Sustainable Development Goal #3: Good Health and Well-being. Unlike Mercury or Watsons apps that only show their own inventory, Curio aggregates ALL pharmacies—from big chains to your neighborhood generics store."*

### 2:30 - 3:00 | The Close

*"Rich people can wait for delivery. The working class needs medicine NOW. Curio is for them. *Find the cure, faster.* Thank you."*

---

## 🏆 Demo Day Checklist

- [ ] Pre-seed 50+ pharmacies in Bulacan area
- [ ] Pre-seed 100+ common medicines with brand/generic names
- [ ] Test OCR with 3 reliable sample prescriptions
- [ ] Prepare "happy path" demo flow
- [ ] Change browser tab title to "Curio"
- [ ] Add custom favicon (pill icon)
- [ ] Test on slow network (Chrome DevTools → Slow 3G)
- [ ] Prepare backup: if OCR fails, have manual input ready
- [ ] Practice pitch timing (strictly under 3 minutes)

---

## 👥 Team Roles

| Role | Focus Areas |
|------|-------------|
| **Frontend Developer** | React components, Leaflet map, Tailwind styling, UX polish |
| **Backend Developer** | Express API, Supabase schema, geospatial queries, auth |
| **AI/ML Developer** | Tesseract.js integration, Gemini API prompts, StockCast logic |

---

## 📚 References

- Republic Act 9502 (Universally Accessible Cheaper and Quality Medicines Act)
- DOH EDPMS (Electronic Drug Price Monitoring System)
- UN SDG #3: Good Health and Well-being
- PhilHealth GAMOT Program
- Waze crowdsourcing model

---

*Last updated: January 19, 2026*
