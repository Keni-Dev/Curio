# ⚙️ Backend Developer Guide — Curio

> **For**: Developer comfortable with Express.js  
> **Goal**: Build APIs that serve pharmacy/medicine data, handle stock reports, and connect to ML service  
> **Time needed**: ~2-3 days of work

---

## 📚 Table of Contents

1. [Current Codebase Overview](#current-codebase-overview)
2. [How to Run the Backend](#how-to-run-the-backend)
3. [STEP 1: Expand the Database](#step-1-expand-the-database)
4. [STEP 2: Add Medicine Search](#step-2-add-medicine-search)
5. [STEP 3: Improve Nearby Pharmacies](#step-3-improve-nearby-pharmacies)
6. [STEP 4: Handle Stock Reports](#step-4-handle-stock-reports)
7. [STEP 5: Connect to ML Service (OCR)](#step-5-connect-to-ml-service-ocr)
8. [STEP 6: Add Alay Points System](#step-6-add-alay-points-system)
9. [API Reference](#api-reference)
10. [Testing Your APIs](#testing-your-apis)
11. [Git Workflow](#git-workflow)

---

## Current Codebase Overview

```
backend/
├── index.js              ← Main Express server
├── database/
│   └── database.json     ← Mock database (pharmacies, medicines)
├── package.json
└── node_modules/
```

### What's Already Done

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/pharmacies` | ✅ Works | Returns all pharmacies |
| `GET /api/pharmacies/nearby` | ✅ Works | Filters by distance |
| `GET /api/search` | 🟡 Basic | Currently searches pharmacy names only |
| `POST /api/report` | 🔴 Stub | Returns success but doesn't save |
| `POST /api/ai/ocr` | 🔴 Stub | Returns mock text |

---

## How to Run the Backend

```bash
# Go to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start with auto-reload (nodemon)
npm run dev
```

Server runs at: **http://localhost:3000**

Test it:
```bash
curl http://localhost:3000/api/pharmacies
```

---

## STEP 1: Expand the Database

The current database only has 3 pharmacies. Let's add more data for a proper demo.

### 1.1 Update database.json

Replace `backend/database/database.json`:

```json
{
  "pharmacies": [
    {
      "id": 1,
      "name": "Mercury Drug Malolos",
      "address": "Gov. F. Halili Ave, Malolos, Bulacan",
      "lat": 14.8433,
      "lng": 120.8114,
      "type": "Chain",
      "operatingHours": "24/7"
    },
    {
      "id": 2,
      "name": "Watsons SM City Malolos",
      "address": "SM City Malolos, McArthur Highway",
      "lat": 14.8502,
      "lng": 120.8147,
      "type": "Chain",
      "operatingHours": "10:00 AM - 9:00 PM"
    },
    {
      "id": 3,
      "name": "Generika Drugstore Malolos",
      "address": "Paseo del Congreso, Malolos",
      "lat": 14.8468,
      "lng": 120.8089,
      "type": "Chain",
      "operatingHours": "8:00 AM - 10:00 PM"
    },
    {
      "id": 4,
      "name": "TGP (The Generics Pharmacy) Malolos",
      "address": "F. Estrella St., Malolos",
      "lat": 14.8445,
      "lng": 120.8135,
      "type": "Chain",
      "operatingHours": "8:00 AM - 9:00 PM"
    },
    {
      "id": 5,
      "name": "Rose Pharmacy Malolos",
      "address": "Evangelista St., Malolos",
      "lat": 14.8421,
      "lng": 120.8098,
      "type": "Chain",
      "operatingHours": "8:00 AM - 10:00 PM"
    },
    {
      "id": 6,
      "name": "St. Mary Pharmacy",
      "address": "Sto. Nino, Malolos",
      "lat": 14.8570,
      "lng": 120.8200,
      "type": "Independent",
      "operatingHours": "7:00 AM - 8:00 PM"
    },
    {
      "id": 7,
      "name": "MedExpress Bulacan",
      "address": "Plaridel, Bulacan",
      "lat": 14.8865,
      "lng": 120.8577,
      "type": "Chain",
      "operatingHours": "8:00 AM - 8:00 PM"
    },
    {
      "id": 8,
      "name": "SouthStar Drug Malolos",
      "address": "Tikay, Malolos",
      "lat": 14.8312,
      "lng": 120.7989,
      "type": "Chain",
      "operatingHours": "7:00 AM - 10:00 PM"
    }
  ],
  "medicines": [
    {
      "id": 1,
      "brandName": "Biogesic",
      "genericName": "Paracetamol",
      "category": "Pain Relief",
      "tags": ["Fever", "Headache", "Pain"],
      "dosage": "500mg"
    },
    {
      "id": 2,
      "brandName": "Bioflu",
      "genericName": "Phenylephrine + Chlorphenamine + Paracetamol",
      "category": "Cold & Flu",
      "tags": ["Flu", "Cold", "Cough"],
      "dosage": "10mg/2mg/500mg"
    },
    {
      "id": 3,
      "brandName": "Neozep",
      "genericName": "Phenylpropanolamine + Chlorphenamine + Paracetamol",
      "category": "Cold & Flu",
      "tags": ["Flu", "Cold", "Nasal Congestion"],
      "dosage": "25mg/2mg/500mg"
    },
    {
      "id": 4,
      "brandName": "Advil",
      "genericName": "Ibuprofen",
      "category": "Pain Relief",
      "tags": ["Pain", "Inflammation", "Fever"],
      "dosage": "200mg"
    },
    {
      "id": 5,
      "brandName": "Solmux",
      "genericName": "Carbocisteine",
      "category": "Respiratory",
      "tags": ["Cough", "Phlegm", "Mucus"],
      "dosage": "500mg"
    },
    {
      "id": 6,
      "brandName": "Diatabs",
      "genericName": "Loperamide",
      "category": "Digestive",
      "tags": ["Diarrhea", "Stomach"],
      "dosage": "2mg"
    },
    {
      "id": 7,
      "brandName": "Kremil-S",
      "genericName": "Aluminum/Magnesium Hydroxide + Simethicone",
      "category": "Digestive",
      "tags": ["Acidity", "Heartburn", "Bloating"],
      "dosage": "178mg/233mg/30mg"
    },
    {
      "id": 8,
      "brandName": "Ventolin",
      "genericName": "Salbutamol",
      "category": "Respiratory",
      "tags": ["Asthma", "Bronchospasm"],
      "dosage": "2mg"
    },
    {
      "id": 9,
      "brandName": "Metformin",
      "genericName": "Metformin",
      "category": "Diabetes",
      "tags": ["Diabetes", "Blood Sugar", "Maintenance"],
      "dosage": "500mg"
    },
    {
      "id": 10,
      "brandName": "Losartan",
      "genericName": "Losartan Potassium",
      "category": "Cardiovascular",
      "tags": ["Hypertension", "Blood Pressure", "Maintenance"],
      "dosage": "50mg"
    }
  ],
  "inventory": [
    { "pharmacyId": 1, "medicineId": 1, "status": "High", "lastUpdated": "2026-01-21T10:00:00Z" },
    { "pharmacyId": 1, "medicineId": 2, "status": "Low", "lastUpdated": "2026-01-21T09:30:00Z" },
    { "pharmacyId": 1, "medicineId": 3, "status": "High", "lastUpdated": "2026-01-21T10:00:00Z" },
    { "pharmacyId": 2, "medicineId": 1, "status": "High", "lastUpdated": "2026-01-21T08:00:00Z" },
    { "pharmacyId": 2, "medicineId": 2, "status": "Out of Stock", "lastUpdated": "2026-01-21T07:00:00Z" },
    { "pharmacyId": 3, "medicineId": 1, "status": "High", "lastUpdated": "2026-01-21T11:00:00Z" },
    { "pharmacyId": 3, "medicineId": 4, "status": "High", "lastUpdated": "2026-01-21T11:00:00Z" },
    { "pharmacyId": 4, "medicineId": 1, "status": "Low", "lastUpdated": "2026-01-21T10:30:00Z" },
    { "pharmacyId": 4, "medicineId": 5, "status": "High", "lastUpdated": "2026-01-21T10:30:00Z" },
    { "pharmacyId": 5, "medicineId": 6, "status": "High", "lastUpdated": "2026-01-21T09:00:00Z" },
    { "pharmacyId": 5, "medicineId": 7, "status": "Low", "lastUpdated": "2026-01-21T09:00:00Z" },
    { "pharmacyId": 6, "medicineId": 8, "status": "Out of Stock", "lastUpdated": "2026-01-20T18:00:00Z" },
    { "pharmacyId": 7, "medicineId": 9, "status": "High", "lastUpdated": "2026-01-21T08:00:00Z" },
    { "pharmacyId": 8, "medicineId": 10, "status": "High", "lastUpdated": "2026-01-21T07:30:00Z" }
  ],
  "stockReports": [],
  "users": [
    { "id": "user-1", "alayPoints": 50, "contributionCount": 5 }
  ]
}
```

### 1.2 Update index.js to read new structure

```javascript
// backend/index.js
import express, { json } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { isPointWithinRadius, getDistance } from 'geolib';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(json());

// Load database
const DB_PATH = 'database/database.json';
let db = JSON.parse(readFileSync(DB_PATH, 'utf8'));

// Helper to save database
const saveDb = () => {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Curio API is running!', version: '1.0.0' });
});

// ============ PHARMACY ROUTES ============

// GET /api/pharmacies - Get all pharmacies
app.get('/api/pharmacies', (req, res) => {
  const pharmaciesWithStock = db.pharmacies.map(pharmacy => {
    const inventoryItems = db.inventory.filter(inv => inv.pharmacyId === pharmacy.id);
    return {
      ...pharmacy,
      medicineCount: inventoryItems.length,
      // General stock status (simplified for map view)
      stock: inventoryItems.length > 0 
        ? inventoryItems.some(i => i.status === 'Out of Stock') 
          ? 'Low' 
          : 'High'
        : 'Unknown'
    };
  });
  res.json(pharmaciesWithStock);
});

// GET /api/pharmacies/nearby - Get pharmacies within radius
app.get('/api/pharmacies/nearby', (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const searchRadius = parseInt(radius);

  const nearbyPharmacies = db.pharmacies
    .map(pharmacy => {
      const distance = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: pharmacy.lat, longitude: pharmacy.lng }
      );
      return { ...pharmacy, distance };
    })
    .filter(pharmacy => pharmacy.distance <= searchRadius)
    .sort((a, b) => a.distance - b.distance);

  res.json(nearbyPharmacies);
});

// GET /api/pharmacy/:id - Get single pharmacy with full inventory
app.get('/api/pharmacy/:id', (req, res) => {
  const pharmacyId = parseInt(req.params.id);
  const pharmacy = db.pharmacies.find(p => p.id === pharmacyId);
  
  if (!pharmacy) {
    return res.status(404).json({ error: 'Pharmacy not found' });
  }

  // Get inventory for this pharmacy
  const inventory = db.inventory
    .filter(inv => inv.pharmacyId === pharmacyId)
    .map(inv => {
      const medicine = db.medicines.find(m => m.id === inv.medicineId);
      return {
        ...inv,
        medicine: medicine
      };
    });

  res.json({ ...pharmacy, inventory });
});

// ============ MEDICINE ROUTES ============

// GET /api/medicines - Get all medicines
app.get('/api/medicines', (req, res) => {
  res.json(db.medicines);
});

// GET /api/search - Search medicines and find pharmacies that have them
app.get('/api/search', (req, res) => {
  const { q, lat, lng } = req.query;
  
  if (!q) {
    return res.json(db.medicines);
  }

  const query = q.toLowerCase().trim();
  
  // Search medicines by brand name, generic name, or tags
  const matchingMedicines = db.medicines.filter(medicine => 
    medicine.brandName.toLowerCase().includes(query) ||
    medicine.genericName.toLowerCase().includes(query) ||
    medicine.tags.some(tag => tag.toLowerCase().includes(query))
  );

  if (matchingMedicines.length === 0) {
    return res.json({ medicines: [], pharmacies: [] });
  }

  // Find pharmacies that have these medicines
  const medicineIds = matchingMedicines.map(m => m.id);
  const relevantInventory = db.inventory.filter(inv => 
    medicineIds.includes(inv.medicineId)
  );

  // Get unique pharmacy IDs
  const pharmacyIds = [...new Set(relevantInventory.map(inv => inv.pharmacyId))];
  
  // Get pharmacies with their stock status for the searched medicine
  let pharmaciesWithStock = pharmacyIds.map(pharmId => {
    const pharmacy = db.pharmacies.find(p => p.id === pharmId);
    const stockItem = relevantInventory.find(inv => inv.pharmacyId === pharmId);
    
    let result = {
      ...pharmacy,
      medicineStatus: stockItem?.status || 'Unknown',
      lastUpdated: stockItem?.lastUpdated
    };

    // Calculate distance if user location provided
    if (lat && lng) {
      result.distance = getDistance(
        { latitude: parseFloat(lat), longitude: parseFloat(lng) },
        { latitude: pharmacy.lat, longitude: pharmacy.lng }
      );
    }

    return result;
  });

  // Sort by distance if available
  if (lat && lng) {
    pharmaciesWithStock.sort((a, b) => a.distance - b.distance);
  }

  res.json({
    medicines: matchingMedicines,
    pharmacies: pharmaciesWithStock
  });
});

// ============ CONTRIBUTION ROUTES ============

// POST /api/report - Submit a stock report
app.post('/api/report', (req, res) => {
  const { pharmacyId, medicineId, status, userId = 'anonymous' } = req.body;

  if (!pharmacyId || !status) {
    return res.status(400).json({ error: 'pharmacyId and status are required' });
  }

  // Create new report
  const report = {
    id: Date.now(),
    pharmacyId: parseInt(pharmacyId),
    medicineId: medicineId ? parseInt(medicineId) : null,
    status,
    userId,
    reportedAt: new Date().toISOString()
  };

  // Add to reports
  db.stockReports.push(report);

  // Update inventory if medicineId provided
  if (medicineId) {
    const invIndex = db.inventory.findIndex(
      inv => inv.pharmacyId === parseInt(pharmacyId) && inv.medicineId === parseInt(medicineId)
    );
    
    if (invIndex >= 0) {
      db.inventory[invIndex].status = status;
      db.inventory[invIndex].lastUpdated = new Date().toISOString();
    } else {
      db.inventory.push({
        pharmacyId: parseInt(pharmacyId),
        medicineId: parseInt(medicineId),
        status,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  // Award Alay Points
  let pointsEarned = 10;
  let userPoints = 0;
  
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex >= 0) {
    db.users[userIndex].alayPoints += pointsEarned;
    db.users[userIndex].contributionCount += 1;
    userPoints = db.users[userIndex].alayPoints;
  } else {
    userPoints = pointsEarned;
    db.users.push({
      id: userId,
      alayPoints: pointsEarned,
      contributionCount: 1
    });
  }

  // Save to file
  saveDb();

  res.json({
    success: true,
    message: 'Report submitted successfully',
    pointsEarned,
    totalPoints: userPoints
  });
});

// GET /api/user/:id/points - Get user's Alay Points
app.get('/api/user/:id/points', (req, res) => {
  const userId = req.params.id;
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.json({ alayPoints: 0, contributionCount: 0 });
  }

  res.json({
    alayPoints: user.alayPoints,
    contributionCount: user.contributionCount
  });
});

// ============ AI ROUTES (Proxy to ML Service) ============

// POST /api/ai/ocr - OCR prescription image
app.post('/api/ai/ocr', async (req, res) => {
  try {
    // Proxy to ML service
    const mlResponse = await fetch('http://localhost:8000/ocr', {
      method: 'POST',
      body: req.body,
      headers: { 'Content-Type': req.headers['content-type'] }
    });
    
    const result = await mlResponse.json();
    res.json(result);
  } catch (error) {
    console.error('ML Service error:', error);
    // Return mock response if ML service is down
    res.json({ 
      success: true, 
      extractedText: 'Paracetamol 500mg',
      medicines: ['Paracetamol']
    });
  }
});

// ============ START SERVER ============

app.listen(port, () => {
  console.log(`🚀 Curio Backend running at http://localhost:${port}`);
  console.log(`📊 Database loaded: ${db.pharmacies.length} pharmacies, ${db.medicines.length} medicines`);
});
```

---

## STEP 2: Add Medicine Search

Already implemented in the code above! The `/api/search` endpoint now:

1. Searches by brand name, generic name, OR tags
2. Returns matching medicines
3. Returns pharmacies that stock those medicines
4. Includes stock status for each pharmacy
5. Calculates distance if user location is provided

**Test it:**
```bash
# Search for Biogesic
curl "http://localhost:3000/api/search?q=biogesic"

# Search with user location
curl "http://localhost:3000/api/search?q=biogesic&lat=14.843&lng=120.811"

# Search by symptom tag
curl "http://localhost:3000/api/search?q=headache"
```

---

## STEP 3: Improve Nearby Pharmacies

Also implemented above! The `/api/pharmacies/nearby` now:

1. Takes `lat`, `lng`, and optional `radius` (default 5km)
2. Uses `geolib` to calculate actual distance
3. Returns pharmacies sorted by distance
4. Shows distance in meters

**Test it:**
```bash
curl "http://localhost:3000/api/pharmacies/nearby?lat=14.843&lng=120.811&radius=3000"
```

---

## STEP 4: Handle Stock Reports

The `/api/report` endpoint now:

1. Accepts stock status updates
2. Updates the inventory database
3. Awards Alay Points to users
4. Saves to JSON file (persists across restarts)

**Test it:**
```bash
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{"pharmacyId": 1, "medicineId": 1, "status": "High", "userId": "user-1"}'
```

---

## STEP 5: Connect to ML Service (OCR)

The backend proxies OCR requests to the ML service.

### How it works:

```
Frontend → Backend (port 3000) → ML Service (port 8000)
                ↓
        /api/ai/ocr              /ocr
```

### Current Implementation:

```javascript
// POST /api/ai/ocr - OCR prescription image
app.post('/api/ai/ocr', async (req, res) => {
  try {
    // Forward to ML service
    const mlResponse = await fetch('http://localhost:8000/ocr', {
      method: 'POST',
      body: req.body,
      headers: { 'Content-Type': req.headers['content-type'] }
    });
    
    const result = await mlResponse.json();
    res.json(result);
  } catch (error) {
    // Fallback if ML service is down
    res.json({ 
      success: true, 
      extractedText: 'Paracetamol 500mg',
      medicines: ['Paracetamol'],
      note: 'ML service unavailable, returning mock data'
    });
  }
});
```

### For Multipart Form Data (file uploads):

If frontend sends files, install `multer`:

```bash
npm install multer
```

Then add this to index.js:

```javascript
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// Updated OCR endpoint for file uploads
app.post('/api/ai/ocr', upload.single('file'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer]), req.file.originalname);
    
    const mlResponse = await fetch('http://localhost:8000/ocr', {
      method: 'POST',
      body: formData
    });
    
    const result = await mlResponse.json();
    res.json(result);
  } catch (error) {
    res.json({ 
      success: true, 
      extractedText: 'Paracetamol 500mg',
      medicines: ['Paracetamol']
    });
  }
});
```

---

## STEP 6: Add Alay Points System

Already implemented in the report endpoint! Here's a summary:

| Action | Points |
|--------|--------|
| Submit stock report | +10 |

### Get User Points:

```bash
curl http://localhost:3000/api/user/user-1/points
```

Response:
```json
{
  "alayPoints": 60,
  "contributionCount": 6
}
```

---

## API Reference

### Pharmacy Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pharmacies` | Get all pharmacies |
| GET | `/api/pharmacies/nearby?lat=X&lng=Y&radius=5000` | Get nearby pharmacies |
| GET | `/api/pharmacy/:id` | Get single pharmacy with inventory |

### Medicine Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | Get all medicines |
| GET | `/api/search?q=biogesic&lat=X&lng=Y` | Search medicines & pharmacies |

### Contribution Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/report` | Submit stock report |
| GET | `/api/user/:id/points` | Get user's Alay Points |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/ocr` | OCR prescription (proxies to ML) |

---

## Testing Your APIs

### Using curl (Terminal)

```bash
# Test all pharmacies
curl http://localhost:3000/api/pharmacies

# Test medicine search
curl "http://localhost:3000/api/search?q=paracetamol"

# Test stock report
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{"pharmacyId": 1, "status": "High"}'
```

### Using Browser

Just open these URLs:
- http://localhost:3000/api/pharmacies
- http://localhost:3000/api/search?q=biogesic
- http://localhost:3000/api/pharmacy/1

### Using Postman / Thunder Client

1. Install "Thunder Client" extension in VS Code
2. Create requests for each endpoint
3. Save them for testing during development

---

## Git Workflow

### Daily Workflow

```bash
# 1. Make sure you're on backend branch
git checkout backend

# 2. Get latest changes
git pull origin backend

# 3. Work on your tasks...

# 4. Save your work
git add .
git commit -m "Add medicine search with tags"
git push origin backend
```

### Commit Message Examples

- `"Expand database with 10 medicines and 8 pharmacies"`
- `"Add stock report endpoint with Alay Points"`
- `"Connect to ML service for OCR"`
- `"Fix CORS issue for frontend"`

---

## Checklist Before Demo Day

- [ ] 8+ pharmacies in database (around BulSU area)
- [ ] 10+ medicines with brand/generic names
- [ ] `/api/search` works with medicine names
- [ ] `/api/pharmacies/nearby` returns sorted by distance
- [ ] `/api/report` saves to database
- [ ] `/api/ai/ocr` returns medicine names (mock fallback works)
- [ ] No CORS errors when frontend calls APIs
- [ ] Server doesn't crash on bad input

---

## Troubleshooting

### "Cannot find module 'geolib'"

```bash
npm install geolib
```

### "Port 3000 already in use"

```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### "CORS error" from frontend

Make sure `cors()` middleware is before routes:

```javascript
app.use(cors());
app.use(json());
// ... routes come after
```

### Database not saving

Check file permissions:
```bash
chmod 666 database/database.json
```

---

**Questions?** Coordinate with Frontend (for fetch calls) and ML (for OCR format).

Good luck! 🚀
