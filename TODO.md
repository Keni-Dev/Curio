================================================================================
PROJECT Curio - HACKATHON MASTER TASK LIST
================================================================================
Goal: A functional "Waze for Medicines" demo running on Localhost.
Deadline: Demo Day Presentation.

--------------------------------------------------------------------------------
👨‍💻 FRONTEND DEVELOPER (React + Vite + Leaflet)
--------------------------------------------------------------------------------

PHASE 1: SETUP & BASICS
[ ] Run `npm install` and ensure `npm run dev` works.
[ ] Install Libraries:
    - npm install react-router-dom (Navigation)
    - npm install react-leaflet leaflet (Maps)
    - npm install axios (API requests)
    - npm install lucide-react (Icons)
[ ] Clean up `App.css` (Remove default Vite styling).
[ ] Create Folder Structure:
    - /src/components (Navbar, Modal, Cards)
    - /src/pages (Home, MapView, Camera)
    - /src/assets (Images, Icons)
[ ] Create the dashboard layout


PHASE 2: THE MAP (CORE FEATURE)
[ ] Implement `react-leaflet` in `MapView.jsx`.
[ ] Set default view to "Malolos" (or your specific venue coordinates).
[ ] Fetch Pharmacy Data:
    - Use `useEffect` to call `http://localhost:3000/api/pharmacies`.
    - Console log the data to verify connection.
[ ] Render Markers:
    - Map through the data array.
    - Create a custom Icon (Green for High Stock, Red for None).
    - Add `<Marker>` for each pharmacy.
[ ] Create Popup/Drawer:
    - When a marker is clicked, show a "PharmacyCard" at the bottom of the screen.
    - Display: Name, Distance, Stock Status.

PHASE 3: UI & INTERACTION
[ ] Build the "Search Bar" overlay on top of the map.
[ ] Connect Search Input to the API (pass query param to backend).
[ ] Build the "Report Stock" Button:
    - Create a simple Modal/Popup: "Is Biogesic in stock? [YES] [NO]".
    - On click, send POST request to `http://localhost:3000/api/report`.
    - Show a "Success" toast/alert.

PHASE 4: INTEGRATION
[ ] Integrate the OCR Component (Receive code from ML Developer).
    - Create a "Scan Prescription" button that opens the camera.
[ ] Test on Mobile view (Inspect Element -> Dimensions: iPhone SE).

--------------------------------------------------------------------------------
⚙️ BACKEND DEVELOPER (Node.js + Express + Local JSON)
--------------------------------------------------------------------------------

PHASE 1: SETUP & SERVER
[ ] Run `npm init -y` inside /backend folder.
[ ] Install: `npm install express cors body-parser`.
[ ] Create `server.js` and set up basic Express server on Port 3000.
[ ] Enable CORS (`app.use(cors())`) so Frontend can talk to Backend.

PHASE 2: THE DATABASE (JSON FILE)
[ ] Create `database.json`.
[ ] SEED DATA (CRITICAL):
    - Write a JSON array with 20-50 fake pharmacies.
    - Use coordinates CLOSE to your actual Hackathon location (Google Maps -> Right Click -> copy Lat/Lng).
    - Vary the stock statuses ("High", "Low", "None").
[ ] Create "Helper Function" to read/write to this JSON file using `fs` module.

PHASE 3: API ENDPOINTS
[ ] GET `/api/pharmacies`:
    - Return the full list from JSON.
    - Feature: Add a simple search filter (e.g., `?q=mercury`) to filter results by name.
[ ] POST `/api/report`:
    - Accept `{ id, status }`.
    - Find the pharmacy in the array.
    - Update its status.
    - Save the file.
    - Return success message.
[ ] GET `/api/predict`:
    - Accept `{ medicine_name }`.
    - Integrate the logic from ML Developer (StockCast).
    - Return `{ risk_level: "High" }`.

PHASE 4: STABILITY 
[ ] Add `try-catch` blocks to prevent server crashing on bad requests.
[ ] Test all endpoints using Thunder Client / Postman.

--------------------------------------------------------------------------------
🤖 ML/AI SERVICE (Tesseract.js + Logic Scripts)
--------------------------------------------------------------------------------

PHASE 1: OCR PROTOTYPE (Browser-based)
[ ] Create a standalone `test.html` file to test Tesseract.js.
[ ] Write the "Pre-processing" logic:
    - Function to take an image input.
    - Function to run Tesseract.
    - **CRITICAL:** Write the `CleanText()` function using Regex to remove garbage characters.
    - Input: "Rx: Biogesic 500mg... sig tab..."
    - Output: "Biogesic"
[ ] Package this logic into a React Component (`CameraScanner.jsx`) and give it to Frontend Dev.

PHASE 2: STOCK PREDICTION LOGIC (Heuristic)
[ ] Write a JavaScript function `calculateStockRisk(medicineName, currentDate)`.
[ ] Logic Rules:
    - If Month = June-Nov AND Medicine = "Bioflu" -> Return "Risk: High (Rainy Season)".
    - If Medicine = "Insulin" -> Return "Risk: Constant Demand".
    - Else -> Return "Risk: Normal".
[ ] Give this function to the Backend Dev to put in the API.

PHASE 3: DATA PREPARATION
[ ] Help the Backend Dev fill the `database.json`.
    - Create realistic names ("St. Mary's Generic Pharmacy").
    - Ensure coordinates are accurate so they appear correctly on the map.

================================================================================
FINAL CHECKLIST (DEMO DAY)
================================================================================
[ ] Backend Server is running (`node server.js`).
[ ] Frontend is running (`npm run dev`).
[ ] Both are connected (Map shows pins).
[ ] "Report Stock" button updates the `database.json` file instantly.
[ ] Camera OCR works on a clean sample image.
[ ] "Offline Mode" check (Does it crash if you turn off wifi? It shouldn't on localhost).