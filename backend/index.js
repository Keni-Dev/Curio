import express, { json } from 'express';
import { readFileSync } from 'fs';
import { isPointWithinRadius } from 'geolib';

const app = express();
const port = process.env.PORT || 3000;

const DATA_FILE = JSON.parse(readFileSync('database/database.json', 'utf8'));


// Middleware to parse JSON requests
app.use(json());

// Sample route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// GET /api/pharmacies
app.get('/api/pharmacies', (req, res) => {
  // Logic to fetch and return a list of pharmacies

  res.json({ message: DATA_FILE });
});

// GET /api/pharmacies/nearby 
app.get('/api/pharmacies/nearby', (req, res) => {
  // Logic to fetch and return a list of pharmacies

  // step 1 get user location J
  const userLocation = req.query.location;
  if (!userLocation) return res.status(400).json({ message: 'User location is required' });
  const [userLat, userLng] = userLocation.split(',');

  // step 2 get pharmacies
  const pharmacies = DATA_FILE.pharmacies;

  // step 3 check which pharmacies are nearby
  const nearbyPharmacies = pharmacies.filter(pharmacy => {
    return isPointWithinRadius(
      { latitude: parseFloat(userLat), longitude: parseFloat(userLng) },
      { latitude: pharmacy.lat, longitude: pharmacy.lng },
      100
    );
  });


  // return pharmacies

  res.json({ message: DATA_FILE, nearbyPharmacies: nearbyPharmacies });
});


// GET /api/search
app.get('/api/search', (req, res) => {
  // Logic to fetch and return a list of pharmacies

  res.json({ message: DATA_FILE });
});

// POST /api/report
app.post('/api/report', (req, res) => {
  // Logic to fetch and return a list of pharmacies

  res.json({ message: DATA_FILE });
});

// POST /api/ai/ocr
app.post('/api/ai/ocr', (req, res) => {
  // Logic to fetch and return a list of pharmacies

  res.json({ message: DATA_FILE });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
