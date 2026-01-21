# 🔗 Integration Guide — Curio

> **For**: All team members  
> **Goal**: How to connect Frontend, Backend, and ML Service together  
> **When to use**: After individual parts are working, combine them

---

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Port Assignments](#port-assignments)
3. [How to Run Everything](#how-to-run-everything)
4. [Integration Steps](#integration-steps)
5. [Data Flow Examples](#data-flow-examples)
6. [Git Workflow for Team](#git-workflow-for-team)
7. [Demo Day Checklist](#demo-day-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER'S BROWSER                             │
│                        http://localhost:5173                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ fetch() requests
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express.js)                          │
│                        http://localhost:3000                         │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ /api/pharmacies  │  │ /api/search      │  │ /api/report      │   │
│  │ /api/nearby      │  │ /api/medicines   │  │ /api/user/points │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                      │
│                         ┌──────────────┐                             │
│                         │ /api/ai/ocr  │ ──── Proxies to ML ────┐   │
│                         └──────────────┘                         │   │
└─────────────────────────────────────────────────────────────────│───┘
                                                                   │
                                                                   ▼
                          ┌─────────────────────────────────────────────┐
                          │              ML SERVICE (FastAPI)            │
                          │              http://localhost:8000           │
                          │                                              │
                          │  ┌──────────────┐  ┌──────────────────────┐ │
                          │  │    /ocr      │  │    /ocr/demo         │ │
                          │  └──────────────┘  └──────────────────────┘ │
                          └─────────────────────────────────────────────┘
```

---

## Port Assignments

| Service | Port | URL | Developer |
|---------|------|-----|-----------|
| **Frontend** | 5173 | http://localhost:5173 | Frontend Dev |
| **Backend** | 3000 | http://localhost:3000 | Backend Dev (Keni) |
| **ML Service** | 8000 | http://localhost:8000 | ML Dev |

**Important**: Everyone must use these exact ports! Don't change them.

---

## How to Run Everything

### Option A: Three Separate Terminals

Open three terminals in VS Code (Ctrl + Shift + `):

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - ML Service:**
```bash
cd ml-service
source venv/bin/activate
uvicorn ocr:app --reload --port 8000
```

### Option B: One Script (Create this file)

Create `start-all.sh` in project root:

```bash
#!/bin/bash

echo "🚀 Starting Curio Services..."

# Start Backend
echo "Starting Backend..."
cd backend && npm run dev &
BACKEND_PID=$!

# Start ML Service
echo "Starting ML Service..."
cd ../ml-service && source venv/bin/activate && uvicorn ocr:app --port 8000 &
ML_PID=$!

# Start Frontend
echo "Starting Frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo "   ML:       http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

wait
```

Run with:
```bash
chmod +x start-all.sh
./start-all.sh
```

---

## Integration Steps

### Step 1: Backend ↔ Database (Already Done)

Backend reads from `database/database.json`.

**Test:**
```bash
curl http://localhost:3000/api/pharmacies
```

### Step 2: Frontend → Backend

Frontend fetches data from Backend.

**Frontend code:**
```javascript
// In App.jsx
useEffect(() => {
  fetch("http://localhost:3000/api/pharmacies")
    .then(res => res.json())
    .then(data => setPharmacies(data))
    .catch(err => console.error(err));
}, []);
```

**Test:**
1. Open http://localhost:5173
2. Open DevTools (F12) → Network tab
3. Refresh page
4. You should see a request to `http://localhost:3000/api/pharmacies`

### Step 3: Backend ↔ ML Service

Backend proxies OCR requests to ML Service.

**Backend code (already in GUIDE_BACKEND.md):**
```javascript
app.post('/api/ai/ocr', async (req, res) => {
  try {
    const mlResponse = await fetch('http://localhost:8000/ocr', {
      method: 'POST',
      body: req.body
    });
    const result = await mlResponse.json();
    res.json(result);
  } catch (error) {
    // Fallback if ML is down
    res.json({ success: true, medicines: ['Paracetamol'] });
  }
});
```

**Test:**
```bash
# Make sure ML service is running first
curl http://localhost:8000/

# Then test through backend
curl -X POST http://localhost:3000/api/ai/ocr
```

### Step 4: Frontend → Backend → ML (Full Chain)

**Frontend code for OCR:**
```javascript
// In a component
const handleScanPrescription = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  try {
    const response = await fetch('http://localhost:3000/api/ai/ocr', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    
    if (result.success && result.medicines.length > 0) {
      // Auto-fill search with first medicine
      setSearchQuery(result.medicines[0].name);
    }
  } catch (error) {
    console.error('OCR failed:', error);
  }
};
```

---

## Data Flow Examples

### Example 1: User Searches for Medicine

```
1. User types "Biogesic" in Frontend
                    ↓
2. Frontend calls GET /api/search?q=biogesic
                    ↓
3. Backend searches database.json
                    ↓
4. Backend returns:
   {
     "medicines": [{"brandName": "Biogesic", "genericName": "Paracetamol"}],
     "pharmacies": [
       {"id": 1, "name": "Mercury Drug", "medicineStatus": "High"},
       {"id": 2, "name": "Watsons", "medicineStatus": "Low"}
     ]
   }
                    ↓
5. Frontend displays results on map
```

### Example 2: User Reports Stock

```
1. User clicks "Update Stock" button
                    ↓
2. User selects "High" in modal
                    ↓
3. Frontend calls POST /api/report
   Body: {"pharmacyId": 1, "medicineId": 1, "status": "High", "userId": "user-1"}
                    ↓
4. Backend saves to database.json
                    ↓
5. Backend returns:
   {"success": true, "pointsEarned": 10, "totalPoints": 60}
                    ↓
6. Frontend shows "+10 Alay Points!" animation
```

### Example 3: User Scans Prescription

```
1. User takes photo of prescription
                    ↓
2. Frontend sends image to POST /api/ai/ocr
                    ↓
3. Backend forwards to ML Service (port 8000)
                    ↓
4. ML Service extracts text using Tesseract
                    ↓
5. ML Service matches medicines:
   {"success": true, "medicines": [{"name": "Biogesic", "generic": "Paracetamol"}]}
                    ↓
6. Backend returns same response to Frontend
                    ↓
7. Frontend auto-fills search bar with "Biogesic"
```

---

## Git Workflow for Team

### Branch Structure

```
main
├── frontend ← Frontend dev pushes here
├── backend  ← Backend dev pushes here
└── ml       ← ML dev pushes here
```

### Weekly Merge Schedule

| Day | Action |
|-----|--------|
| **Daily** | Push to your own branch |
| **Every 2 days** | Keni merges all branches to `main` |
| **Day before demo** | Final merge, everyone tests together |

### How to Merge (Keni's Job)

```bash
# 1. Go to main branch
git checkout main

# 2. Merge backend
git merge backend

# 3. Merge frontend
git merge frontend

# 4. Merge ml
git merge ml

# 5. Push to remote
git push origin main
```

### How to Get Latest Code (Everyone)

```bash
# Switch to your branch
git checkout frontend  # or backend, or ml

# Get latest from main
git pull origin main
```

---

## Demo Day Checklist

### Before Demo Day (Day Before)

- [ ] All branches merged to `main`
- [ ] Everyone pulls latest `main`
- [ ] Test on Keni's laptop (the demo machine)
- [ ] Pre-load database with 8+ pharmacies near demo location
- [ ] Test each feature:
  - [ ] Search works
  - [ ] Map shows pins
  - [ ] Click pin shows details
  - [ ] Stock colors work (green/yellow/red)
  - [ ] Contribution modal works
  - [ ] OCR works (or fallback works)
  - [ ] Alay Points display updates

### Demo Day Setup (15 mins before)

```bash
# 1. Open project folder
cd Curio

# 2. Start all services (3 terminals)

# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev

# Terminal 3
cd ml-service && source venv/bin/activate && uvicorn ocr:app --port 8000

# 3. Open browser to http://localhost:5173

# 4. Test one search to make sure everything works
```

### Demo Flow (3 minutes)

1. **0:00-0:30**: Open app, show map with pre-loaded pharmacies
2. **0:30-1:00**: Search for "Biogesic" → show results on map
3. **1:00-1:30**: Click pharmacy → show details
4. **1:30-2:00**: Click "Update Stock" → show contribution modal
5. **2:00-2:30**: (If OCR works) Scan prescription → auto-fill search
6. **2:30-3:00**: Show Alay Points earned

### Backup Plans

| If This Fails | Do This Instead |
|---------------|-----------------|
| Backend won't start | Use pre-recorded demo video |
| Frontend shows blank | Refresh, check console errors |
| Map doesn't load | Show list view instead |
| OCR fails | Type medicine name manually, skip OCR demo |
| ML service down | Backend has fallback, it will still work |

---

## Troubleshooting

### "CORS error" in browser console

**Cause:** Frontend can't access Backend.

**Fix:** Make sure Backend has CORS enabled:
```javascript
// backend/index.js
import cors from 'cors';
app.use(cors());
```

### "Failed to fetch" in Frontend

**Cause:** Backend is not running.

**Fix:**
1. Check if backend is running: `curl http://localhost:3000`
2. If not, start it: `cd backend && npm run dev`

### Frontend shows but no data

**Cause:** Wrong API URL.

**Fix:** Check the fetch URL in Frontend:
```javascript
// Should be:
fetch("http://localhost:3000/api/pharmacies")

// NOT:
fetch("/api/pharmacies")  // Wrong!
```

### ML Service not responding

**Cause:** Virtual environment not activated.

**Fix:**
```bash
cd ml-service
source venv/bin/activate
uvicorn ocr:app --port 8000
```

### "Port already in use"

**Fix:**
```bash
# Kill process on that port
lsof -i :3000  # or 5173, or 8000
kill -9 <PID>
```

### Map shows wrong location

**Fix:** Update the center coordinates in Map.jsx:
```javascript
const center = [14.843, 120.811]; // Malolos, Bulacan
```

---

## Communication Checklist

| When | What | Who Talks to Who |
|------|------|------------------|
| API format changes | Tell team immediately | Backend ↔ Everyone |
| New endpoint added | Share endpoint details | Backend → Frontend |
| OCR response format changes | Update backend proxy | ML → Backend |
| CSS/UI changes | Just push, no blocker | Frontend only |
| Database structure changes | Share new schema | Backend → Everyone |

---

## File Ownership

| File/Folder | Owner | Others Can Edit? |
|-------------|-------|------------------|
| `frontend/src/` | Frontend Dev | No |
| `frontend/src/components/` | Frontend Dev | No |
| `backend/index.js` | Backend Dev (Keni) | No |
| `backend/database/database.json` | Backend Dev | No (tell Keni to add data) |
| `ml-service/ocr.py` | ML Dev | No |
| `PROJECT_DESCRIPTION.md` | Keni | Yes (for review) |
| `GUIDE_*.md` | Shared | Yes |

---

## Emergency Contacts

If something breaks during development:

1. **Check the browser console** (F12) for errors
2. **Check terminal** for server errors
3. **Ask in group chat** with screenshot of error
4. **Try restarting** the service that's broken

---

**Remember**: It's okay if not everything is perfect. For the demo, focus on:
1. ✅ Search + Map working
2. ✅ Stock colors visible
3. ✅ Contribution modal works
4. ⭐ OCR nice-to-have (use fallback if needed)

Good luck team! 🚀
