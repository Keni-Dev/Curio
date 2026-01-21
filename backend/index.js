import express, { json } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { isPointWithinRadius } from 'geolib';

import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Middleware to parse JSON requests
app.use(json());

const db = JSON.parse(readFileSync('database/database.json', 'utf8'));

// Helper to save database
const saveDb = () => {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

// Sample route
app.get('/', (req, res) => {
  res.send('Curio Backend is running!');
});



// ============ PHARMACY ROUTES ============

// GET /api/pharmacies
app.get('/api/pharmacies', (req, res) => {
  res.json(db.pharmacies);
});

// GET /api/pharmacies/nearby 
app.get('/api/pharmacies/nearby', (req, res) => {
  // Logic to fetch and return a list of pharmacies

  // step 1 get user location 
  const userLocation = req.query.location;
  if (!userLocation) return res.status(400).json({ message: 'User location is required' });
  const [userLat, userLng] = userLocation.split(',');

  // step 2 get pharmacies
  const pharmacies = db.pharmacies;

  // step 3 check which pharmacies are nearby
  const nearbyPharmacies = pharmacies.filter(pharmacy => {
    return isPointWithinRadius(
      { latitude: parseFloat(userLat), longitude: parseFloat(userLng) },
      { latitude: pharmacy.lat, longitude: pharmacy.lng },
      100
    );
  });


  // return pharmacies
  res.json(nearbyPharmacies);
});

// get specific pharmacy
app.get('/api/pharmacies/:id', (req, res) => {
  const pharmacyId = parseInt(req.params.id);
  const pharmacy = db.pharmacies.find(p => p.id === pharmacyId);

  res.json(pharmacy);
})




// ============ MEDICINE ROUTES ============

// GET /api/medicines - Get all medicines
app.get('/api/medicines', (req, res) => {
  res.json(db.medicines);
})

// GET /api/search - Search medicines and find pharmacies that have them
app.get('/api/search', (req, res) => {
  // Logic to search pharmacies
  const query = req.query.q?.toLowerCase();
  if (!query) return res.json(db.pharmacies);

  const results = db.pharmacies.filter(p =>
    p.name.toLowerCase().includes(query)
  );
  res.json(results);
});

// GET /api/user/:id/points - Get user's Alay Points
app.get('/api/user/:id/points', (req, res) => {
  const userId = req.params.id;
  const user = db.users.find(p => p.id === userId)

  res.json(user);
})


// ============ CONTRIBUTION ROUTES ============

// POST /api/report - Submit a stock report
app.post('/api/report', (req, res) => {
  // Logic to report stock
  res.json({ success: true, message: 'Report submitted' });
});


// GET /api/user/:id/points - Get user's Alay Points


// ============ AI ROUTES (Proxy to ML Service) ============

// POST /api/ai/ocr - OCR prescription image
app.post('/api/ai/ocr', (req, res) => {
  // Logic for OCR
  res.json({ success: true, text: 'Sample OCR text' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
