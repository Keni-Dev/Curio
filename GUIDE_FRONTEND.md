# 🎨 Frontend Developer Guide — Curio

> **For**: Complete beginner (first time with React)  
> **Goal**: Build the user interface that shows pharmacies on a map and lets users search for medicines  
> **Time needed**: ~3-4 days of work

---

## 📚 Table of Contents

1. [What You Need to Know First](#what-you-need-to-know-first)
2. [Understanding Your Project Structure](#understanding-your-project-structure)
3. [How to Run the Frontend](#how-to-run-the-frontend)
4. [STEP 1: Create Your First Component](#step-1-create-your-first-component)
5. [STEP 2: Build the Search Bar](#step-2-build-the-search-bar)
6. [STEP 3: Add the Map](#step-3-add-the-map)
7. [STEP 4: Show Pharmacy Cards](#step-4-show-pharmacy-cards)
8. [STEP 5: Add Stock Status Colors](#step-5-add-stock-status-colors)
9. [STEP 6: Build the Contribution Modal](#step-6-build-the-contribution-modal)
10. [STEP 7: Alay Points Display](#step-7-alay-points-display)
11. [Styling Tips (CSS)](#styling-tips-css)
12. [Common Errors & Fixes](#common-errors--fixes)
13. [Git Workflow](#git-workflow)

---

## What You Need to Know First

### What is React?

React is a way to build websites using **components**. Think of components like LEGO blocks — you build small pieces and combine them.

```
Your App (the whole page)
├── SearchBar (the search box at the top)
├── Map (the map in the middle)
├── PharmacyCard (one pharmacy's info)
└── ContributionModal (the popup that asks "Is this medicine in stock?")
```

### Key Concepts (Just 3 Things!)

#### 1. Components = Functions that return HTML

```jsx
// This is a component!
function SearchBar() {
  return (
    <div>
      <input type="text" placeholder="Search medicine..." />
    </div>
  );
}
```

#### 2. State = Variables that can change

```jsx
import { useState } from 'react';

function Counter() {
  // searchText is the variable, setSearchText is how you change it
  const [searchText, setSearchText] = useState('');
  
  return (
    <input 
      value={searchText} 
      onChange={(e) => setSearchText(e.target.value)} 
    />
  );
}
```

#### 3. Props = Passing data to components

```jsx
// Parent passes data
<PharmacyCard name="Mercury Drug" stock="High" />

// Child receives it
function PharmacyCard({ name, stock }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Stock: {stock}</p>
    </div>
  );
}
```

---

## Understanding Your Project Structure

```
frontend/
├── src/
│   ├── App.jsx          ← Main component (you edit this)
│   ├── App.css          ← Styles for App.jsx
│   ├── index.css        ← Global styles
│   ├── main.jsx         ← Don't touch this
│   ├── components/      ← Put your components here
│   │   ├── SearchBar.jsx
│   │   ├── SearchBar.css
│   │   ├── Map.jsx
│   │   ├── Map.css
│   │   └── ...
│   └── pages/           ← Full pages (if needed)
├── package.json         ← Don't touch this
└── index.html           ← Don't touch this
```

---

## How to Run the Frontend

Open a terminal in VS Code (Ctrl + `) and run:

```bash
# Go to frontend folder
cd frontend

# Install packages (only first time)
npm install

# Start the development server
npm run dev
```

You'll see:
```
  VITE v7.2.4  ready in 300 ms

  ➜  Local:   http://localhost:5173/
```

**Open http://localhost:5173 in your browser.** The page will auto-refresh when you save files!

---

## STEP 1: Create Your First Component

Let's create a simple SearchBar component.

### 1.1 Create the file

Create a new file: `frontend/src/components/SearchBar.jsx`

```jsx
// frontend/src/components/SearchBar.jsx

function SearchBar() {
  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Search for medicine (e.g., Biogesic, Paracetamol)..."
        className="search-input"
      />
      <button className="search-button">Search</button>
    </div>
  );
}

export default SearchBar;
```

### 1.2 Create the CSS file

Create: `frontend/src/components/SearchBar.css`

```css
/* frontend/src/components/SearchBar.css */

.search-bar {
  display: flex;
  gap: 10px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
}

.search-input:focus {
  border-color: #0F766E;
}

.search-button {
  padding: 12px 24px;
  background-color: #0F766E;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0d5c54;
}
```

### 1.3 Use it in App.jsx

Update `frontend/src/App.jsx`:

```jsx
// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import './App.css';

function App() {
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/pharmacies")
      .then(res => res.json())
      .then(data => setPharmacies(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Curio</h1>
        <p>Find the Cure, Faster.</p>
      </header>
      
      <SearchBar />
      
      <div className="pharmacy-list">
        {Array.isArray(pharmacies) && pharmacies.map(pharmacy => (
          <div key={pharmacy.id} className="pharmacy-card">
            <h2>{pharmacy.name}</h2>
            <p>Stock: {pharmacy.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
```

### 1.4 Add App.css styles

Update `frontend/src/App.css`:

```css
/* frontend/src/App.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 20px;
}

.app-header h1 {
  color: #0F766E;
  font-size: 2.5rem;
}

.app-header p {
  color: #666;
  font-size: 1rem;
}

.pharmacy-list {
  margin-top: 20px;
  display: grid;
  gap: 15px;
}

.pharmacy-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.pharmacy-card h2 {
  color: #333;
  margin-bottom: 10px;
}
```

**Save all files and check your browser!** You should see the search bar.

---

## STEP 2: Build the Search Bar (With Actual Searching)

Now let's make the search actually work!

### 2.1 Update SearchBar.jsx

```jsx
// frontend/src/components/SearchBar.jsx
import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    // Call the parent's onSearch function
    onSearch(searchText);
  };

  // Also search when pressing Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Search for medicine (e.g., Biogesic, Paracetamol)..."
        className="search-input"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
}

export default SearchBar;
```

### 2.2 Update App.jsx to handle search

```jsx
// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import './App.css';

function App() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all pharmacies when page loads
  useEffect(() => {
    fetchPharmacies();
  }, []);

  // Function to fetch pharmacies
  const fetchPharmacies = (searchQuery = '') => {
    setLoading(true);
    
    const url = searchQuery 
      ? `http://localhost:3000/api/search?q=${searchQuery}`
      : 'http://localhost:3000/api/pharmacies';
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPharmacies(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  // Called when user searches
  const handleSearch = (searchText) => {
    fetchPharmacies(searchText);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Curio</h1>
        <p>Find the Cure, Faster.</p>
      </header>
      
      <SearchBar onSearch={handleSearch} />
      
      {loading && <p className="loading">Loading...</p>}
      
      <div className="pharmacy-list">
        {Array.isArray(pharmacies) && pharmacies.map(pharmacy => (
          <div key={pharmacy.id} className="pharmacy-card">
            <h2>{pharmacy.name}</h2>
            <p>Stock: {pharmacy.stock}</p>
          </div>
        ))}
        
        {pharmacies.length === 0 && !loading && (
          <p className="no-results">No pharmacies found</p>
        )}
      </div>
    </div>
  );
}

export default App;
```

---

## STEP 3: Add the Map

This is the most important part! We'll use Leaflet to show a map.

### 3.1 Create Map.jsx

Create: `frontend/src/components/Map.jsx`

```jsx
// frontend/src/components/Map.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default marker icons (Leaflet bug)
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function Map({ pharmacies, onPharmacyClick }) {
  // Center on Malolos, Bulacan
  const center = [14.843, 120.811];

  // Function to get marker color based on stock
  const getMarkerColor = (stock) => {
    if (stock === 'High') return 'green';
    if (stock === 'Low') return 'orange';
    return 'red';
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={center} 
        zoom={14} 
        className="leaflet-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {pharmacies.map(pharmacy => (
          <Marker 
            key={pharmacy.id}
            position={[pharmacy.lat, pharmacy.lng]}
            eventHandlers={{
              click: () => onPharmacyClick(pharmacy)
            }}
          >
            <Popup>
              <strong>{pharmacy.name}</strong>
              <br />
              Stock: {pharmacy.stock}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
```

### 3.2 Create Map.css

Create: `frontend/src/components/Map.css`

```css
/* frontend/src/components/Map.css */

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.leaflet-map {
  width: 100%;
  height: 100%;
}

/* Make the map look nicer */
.leaflet-popup-content-wrapper {
  border-radius: 10px;
}

.leaflet-popup-content {
  margin: 10px 15px;
}
```

### 3.3 Add Map to App.jsx

Update `frontend/src/App.jsx`:

```jsx
// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Map from './components/Map';
import './App.css';

function App() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = (searchQuery = '') => {
    setLoading(true);
    
    const url = searchQuery 
      ? `http://localhost:3000/api/search?q=${searchQuery}`
      : 'http://localhost:3000/api/pharmacies';
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPharmacies(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleSearch = (searchText) => {
    fetchPharmacies(searchText);
  };

  const handlePharmacyClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Curio</h1>
        <p>Find the Cure, Faster.</p>
      </header>
      
      <SearchBar onSearch={handleSearch} />
      
      <Map 
        pharmacies={pharmacies} 
        onPharmacyClick={handlePharmacyClick}
      />
      
      {/* Show selected pharmacy details */}
      {selectedPharmacy && (
        <div className="pharmacy-detail">
          <h2>{selectedPharmacy.name}</h2>
          <p>Stock Status: {selectedPharmacy.stock}</p>
          <button onClick={() => setSelectedPharmacy(null)}>Close</button>
        </div>
      )}
      
      {loading && <p className="loading">Loading...</p>}
    </div>
  );
}

export default App;
```

---

## STEP 4: Show Pharmacy Cards

Let's create a nice card component for pharmacy details.

### 4.1 Create PharmacyCard.jsx

Create: `frontend/src/components/PharmacyCard.jsx`

```jsx
// frontend/src/components/PharmacyCard.jsx
import './PharmacyCard.css';

function PharmacyCard({ pharmacy, onContribute }) {
  // Get color class based on stock
  const getStockClass = (stock) => {
    if (stock === 'High') return 'stock-high';
    if (stock === 'Low') return 'stock-low';
    return 'stock-out';
  };

  return (
    <div className="pharmacy-card">
      <div className="pharmacy-info">
        <h3>{pharmacy.name}</h3>
        <span className={`stock-badge ${getStockClass(pharmacy.stock)}`}>
          {pharmacy.stock === 'High' && '🟢'}
          {pharmacy.stock === 'Low' && '🟡'}
          {pharmacy.stock === 'Out of Stock' && '🔴'}
          {pharmacy.stock}
        </span>
      </div>
      
      <p className="pharmacy-distance">
        📍 {pharmacy.distance || '0.5'} km away
      </p>
      
      <div className="pharmacy-actions">
        <button className="btn-navigate">
          🧭 Navigate
        </button>
        <button className="btn-contribute" onClick={() => onContribute(pharmacy)}>
          ✋ Update Stock
        </button>
      </div>
    </div>
  );
}

export default PharmacyCard;
```

### 4.2 Create PharmacyCard.css

Create: `frontend/src/components/PharmacyCard.css`

```css
/* frontend/src/components/PharmacyCard.css */

.pharmacy-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.pharmacy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.pharmacy-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.pharmacy-info h3 {
  color: #333;
  font-size: 1.1rem;
}

.stock-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stock-high {
  background-color: #D1FAE5;
  color: #065F46;
}

.stock-low {
  background-color: #FEF3C7;
  color: #92400E;
}

.stock-out {
  background-color: #FEE2E2;
  color: #991B1B;
}

.pharmacy-distance {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.pharmacy-actions {
  display: flex;
  gap: 10px;
}

.pharmacy-actions button {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-navigate {
  background-color: #0F766E;
  color: white;
}

.btn-navigate:hover {
  background-color: #0d5c54;
}

.btn-contribute {
  background-color: #F97316;
  color: white;
}

.btn-contribute:hover {
  background-color: #ea580c;
}
```

---

## STEP 5: Add Stock Status Colors

The stock colors are already in PharmacyCard.css above! Here's a summary:

| Stock Status | Color | Emoji |
|--------------|-------|-------|
| High | Green (#10B981) | 🟢 |
| Low | Orange (#F59E0B) | 🟡 |
| Out of Stock | Red (#F43F5E) | 🔴 |

---

## STEP 6: Build the Contribution Modal

This is the "Waze" feature where users report stock status.

### 6.1 Create ContributionModal.jsx

Create: `frontend/src/components/ContributionModal.jsx`

```jsx
// frontend/src/components/ContributionModal.jsx
import { useState } from 'react';
import './ContributionModal.css';

function ContributionModal({ pharmacy, onClose, onSubmit }) {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedStatus) return;
    
    // Call the parent's submit function
    onSubmit(pharmacy.id, selectedStatus);
    
    // Show success message
    setSubmitted(true);
    
    // Close after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="modal-overlay">
        <div className="modal success-modal">
          <div className="success-icon">🎉</div>
          <h2>Thank you!</h2>
          <p>You earned <strong>+10 Alay Points</strong></p>
          <p className="success-message">Your contribution helps the community!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>📍 You're at {pharmacy.name}</h2>
        <p className="modal-question">Is this medicine available here?</p>
        
        <div className="status-options">
          <button 
            className={`status-btn high ${selectedStatus === 'High' ? 'selected' : ''}`}
            onClick={() => setSelectedStatus('High')}
          >
            🟢 Yes, in stock!
          </button>
          
          <button 
            className={`status-btn low ${selectedStatus === 'Low' ? 'selected' : ''}`}
            onClick={() => setSelectedStatus('Low')}
          >
            🟡 Low stock
          </button>
          
          <button 
            className={`status-btn out ${selectedStatus === 'Out of Stock' ? 'selected' : ''}`}
            onClick={() => setSelectedStatus('Out of Stock')}
          >
            🔴 Out of stock
          </button>
        </div>
        
        <button 
          className="submit-btn" 
          onClick={handleSubmit}
          disabled={!selectedStatus}
        >
          Submit Report
        </button>
      </div>
    </div>
  );
}

export default ContributionModal;
```

### 6.2 Create ContributionModal.css

Create: `frontend/src/components/ContributionModal.css`

```css
/* frontend/src/components/ContributionModal.css */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 400px;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal h2 {
  color: #333;
  margin-bottom: 10px;
}

.modal-question {
  color: #666;
  margin-bottom: 20px;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.status-btn {
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.status-btn:hover {
  border-color: #0F766E;
}

.status-btn.selected {
  border-color: #0F766E;
  background-color: #D1FAE5;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background-color: #0F766E;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #0d5c54;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Success modal */
.success-modal {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.success-message {
  color: #0F766E;
  margin-top: 10px;
}
```

### 6.3 Add Modal to App.jsx

Update App.jsx to include the modal:

```jsx
// Add this import at the top
import ContributionModal from './components/ContributionModal';

// Add state for showing modal
const [showModal, setShowModal] = useState(false);
const [modalPharmacy, setModalPharmacy] = useState(null);

// Function to open modal
const openContributionModal = (pharmacy) => {
  setModalPharmacy(pharmacy);
  setShowModal(true);
};

// Function to handle report submission
const handleReportSubmit = (pharmacyId, status) => {
  fetch('http://localhost:3000/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pharmacyId, status })
  })
  .then(res => res.json())
  .then(data => console.log('Report submitted:', data))
  .catch(err => console.log(err));
};

// Add modal at the end of return, before closing </div>
{showModal && modalPharmacy && (
  <ContributionModal 
    pharmacy={modalPharmacy}
    onClose={() => setShowModal(false)}
    onSubmit={handleReportSubmit}
  />
)}
```

---

## STEP 7: Alay Points Display

Create a simple points display in the header.

### 7.1 Create AlayPoints.jsx

Create: `frontend/src/components/AlayPoints.jsx`

```jsx
// frontend/src/components/AlayPoints.jsx
import './AlayPoints.css';

function AlayPoints({ points }) {
  return (
    <div className="alay-points">
      <span className="points-icon">⭐</span>
      <span className="points-count">{points}</span>
      <span className="points-label">Alay Points</span>
    </div>
  );
}

export default AlayPoints;
```

### 7.2 Create AlayPoints.css

```css
/* frontend/src/components/AlayPoints.css */

.alay-points {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #F97316, #ea580c);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
}

.points-icon {
  font-size: 1.2rem;
}

.points-count {
  font-size: 1.3rem;
}

.points-label {
  font-size: 0.8rem;
  opacity: 0.9;
}
```

---

## Styling Tips (CSS)

### Colors to Use (Copy these!)

```css
/* Primary Colors */
--teal: #0F766E;        /* Main brand color */
--teal-light: #D1FAE5;  /* Light backgrounds */
--teal-dark: #0d5c54;   /* Hover states */

/* Accent */
--coral: #F97316;       /* Buttons, highlights */

/* Stock Status */
--green: #10B981;       /* High stock */
--yellow: #F59E0B;      /* Low stock */
--red: #F43F5E;         /* Out of stock */

/* Neutrals */
--white: #FFFFFF;
--gray-light: #F5F5F5;  /* Page background */
--gray: #666666;        /* Text */
--gray-dark: #333333;   /* Headings */
```

### Mobile-Friendly Tips

```css
/* Make buttons big enough to tap */
button {
  min-height: 44px;
  min-width: 44px;
}

/* Make text readable */
body {
  font-size: 16px;
}

/* Stack on mobile */
@media (max-width: 600px) {
  .pharmacy-actions {
    flex-direction: column;
  }
}
```

---

## Common Errors & Fixes

### Error: "Cannot read properties of undefined"

**Cause**: Trying to use `.map()` on undefined data.

**Fix**: Add a check:
```jsx
{Array.isArray(pharmacies) && pharmacies.map(p => ...)}
```

### Error: "Failed to fetch"

**Cause**: Backend is not running.

**Fix**: Open another terminal and run:
```bash
cd backend
npm run dev
```

### Error: Map not showing

**Cause**: Missing Leaflet CSS.

**Fix**: Add this import in Map.jsx:
```jsx
import 'leaflet/dist/leaflet.css';
```

### Error: White page, nothing shows

**Cause**: Probably a syntax error.

**Fix**: Check browser console (F12 → Console tab) for red error messages.

---

## Git Workflow

### Daily Workflow

```bash
# 1. Before you start working, get latest code
git pull origin frontend

# 2. Work on your files...

# 3. When done, save your work
git add .
git commit -m "Add search bar component"
git push origin frontend
```

### Commit Message Examples

- `"Add SearchBar component with CSS"`
- `"Fix map not showing issue"`
- `"Add ContributionModal popup"`
- `"Style pharmacy cards with stock colors"`

---

## Checklist Before Demo Day

- [ ] Search bar works
- [ ] Map shows with pharmacy pins
- [ ] Clicking pin shows pharmacy details
- [ ] Stock status shows green/yellow/red colors
- [ ] Contribution modal opens and submits
- [ ] Alay points display updates
- [ ] No console errors
- [ ] Looks good on mobile (check with F12 → toggle device toolbar)

---

**Need help?** Ask your backend teammate (@Keni) or refer to:
- [React Docs](https://react.dev/learn)
- [Leaflet React Docs](https://react-leaflet.js.org/)

Good luck! 🚀
