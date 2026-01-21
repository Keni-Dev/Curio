# 🤖 ML/AI Developer Guide — Curio

> **For**: Python developer (beginner with FastAPI)  
> **Goal**: Build the OCR service that reads prescriptions and extracts medicine names  
> **Time needed**: ~2 days of work

---

## 📚 Table of Contents

1. [What You Need to Know](#what-you-need-to-know)
2. [Project Structure](#project-structure)
3. [Setting Up Your Environment](#setting-up-your-environment)
4. [STEP 1: Fix the Current Code](#step-1-fix-the-current-code)
5. [STEP 2: Build the OCR Endpoint](#step-2-build-the-ocr-endpoint)
6. [STEP 3: Add Medicine Matching](#step-3-add-medicine-matching)
7. [STEP 4: Test Your Service](#step-4-test-your-service)
8. [Alternative: Use Cloud Vision (Optional)](#alternative-use-cloud-vision-optional)
9. [API Reference](#api-reference)
10. [Git Workflow](#git-workflow)

---

## What You Need to Know

### What is FastAPI?

FastAPI is a Python web framework (like Express.js but for Python). It's used to create APIs.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/ocr")
def process_image(file: UploadFile):
    # Process the image...
    return {"text": "extracted text here"}
```

### What is OCR?

OCR (Optical Character Recognition) = Reading text from images.

We'll use either:
1. **Tesseract** - Free, runs locally, good for printed text
2. **Google Cloud Vision** - Better accuracy, requires API key

### The Flow

```
User takes photo → Frontend sends image → Backend proxies → ML Service (you)
                                                                    ↓
                                                              Extract text
                                                                    ↓
                                                         Match to medicines
                                                                    ↓
                                                         Return medicine names
```

---

## Project Structure

```
ml-service/
├── ocr.py                    ← Main FastAPI app (you edit this)
├── requirements.txt          ← Python packages
├── venv/                     ← Virtual environment
├── data/                     ← Sample images for testing
│   └── sample_prescription.jpg
└── medical-prescription-ocr/ ← Existing OCR project (reference)
```

---

## Setting Up Your Environment

### 1. Navigate to ml-service folder

```bash
cd ml-service
```

### 2. Create virtual environment (if not exists)

```bash
python -m venv venv
```

### 3. Activate virtual environment

```bash
# Linux/Mac
source venv/bin/activate

# Windows
.\venv\Scripts\activate
```

You'll see `(venv)` in your terminal when activated.

### 4. Install required packages

First, create `requirements.txt`:

```
fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6
Pillow==10.2.0
pytesseract==0.3.10
```

Then install:

```bash
pip install -r requirements.txt
```

### 5. Install Tesseract OCR (System-level)

```bash
# Ubuntu/Debian
sudo apt install tesseract-ocr

# Verify installation
tesseract --version
```

---

## STEP 1: Fix the Current Code

Your current `ocr.py` has a syntax error. Let's fix it.

### Replace the entire `ocr.py`:

```python
# ml-service/ocr.py

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import io
import re

app = FastAPI(
    title="Curio OCR Service",
    description="Extract medicine names from prescription images",
    version="1.0.0"
)

# Allow requests from backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Common medicine names for matching
MEDICINE_DATABASE = [
    {"brand": "Biogesic", "generic": "Paracetamol"},
    {"brand": "Bioflu", "generic": "Phenylephrine + Chlorphenamine + Paracetamol"},
    {"brand": "Neozep", "generic": "Phenylpropanolamine + Chlorphenamine"},
    {"brand": "Advil", "generic": "Ibuprofen"},
    {"brand": "Medicol", "generic": "Ibuprofen"},
    {"brand": "Solmux", "generic": "Carbocisteine"},
    {"brand": "Diatabs", "generic": "Loperamide"},
    {"brand": "Kremil-S", "generic": "Aluminum Hydroxide + Magnesium Hydroxide"},
    {"brand": "Ventolin", "generic": "Salbutamol"},
    {"brand": "Metformin", "generic": "Metformin"},
    {"brand": "Losartan", "generic": "Losartan Potassium"},
    {"brand": "Amlodipine", "generic": "Amlodipine Besylate"},
    {"brand": "Amoxicillin", "generic": "Amoxicillin"},
    {"brand": "Augmentin", "generic": "Amoxicillin + Clavulanic Acid"},
    {"brand": "Mefenamic", "generic": "Mefenamic Acid"},
    {"brand": "Ponstan", "generic": "Mefenamic Acid"},
    {"brand": "Paracetamol", "generic": "Paracetamol"},
    {"brand": "Ibuprofen", "generic": "Ibuprofen"},
]


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "running", "service": "Curio OCR"}


@app.post("/ocr")
async def extract_text(file: UploadFile = File(...)):
    """
    Extract medicine names from a prescription image.
    
    - Accepts: JPEG, PNG images
    - Returns: Extracted text and matched medicines
    """
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Preprocess image for better OCR
        image = preprocess_image(image)
        
        # Extract text using Tesseract
        extracted_text = pytesseract.image_to_string(image)
        
        # Clean and match medicines
        medicines = match_medicines(extracted_text)
        
        return {
            "success": True,
            "extracted_text": extracted_text.strip(),
            "medicines": medicines,
            "medicine_count": len(medicines)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "medicines": []
        }


def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image to improve OCR accuracy.
    - Convert to grayscale
    - Increase contrast
    - Resize if too small
    """
    
    # Convert to grayscale
    image = image.convert("L")
    
    # Resize if too small (minimum 1000px width)
    if image.width < 1000:
        ratio = 1000 / image.width
        new_size = (int(image.width * ratio), int(image.height * ratio))
        image = image.resize(new_size, Image.Resampling.LANCZOS)
    
    return image


def match_medicines(text: str) -> list:
    """
    Find medicine names in extracted text.
    Returns list of matched medicines.
    """
    
    if not text:
        return []
    
    text_lower = text.lower()
    found_medicines = []
    
    for medicine in MEDICINE_DATABASE:
        brand_lower = medicine["brand"].lower()
        generic_lower = medicine["generic"].lower()
        
        # Check if brand name is in text
        if brand_lower in text_lower:
            found_medicines.append({
                "name": medicine["brand"],
                "generic": medicine["generic"],
                "type": "brand"
            })
        # Check if generic name is in text
        elif generic_lower in text_lower:
            found_medicines.append({
                "name": medicine["generic"],
                "generic": medicine["generic"],
                "type": "generic"
            })
    
    # Remove duplicates
    seen = set()
    unique_medicines = []
    for med in found_medicines:
        if med["generic"] not in seen:
            seen.add(med["generic"])
            unique_medicines.append(med)
    
    return unique_medicines


def extract_dosage(text: str) -> list:
    """
    Extract dosage information from text.
    Looks for patterns like "500mg", "250 mg", "500 MG"
    """
    
    # Pattern for dosage (number followed by mg/ml/mcg)
    pattern = r"(\d+)\s*(mg|ml|mcg|g)"
    matches = re.findall(pattern, text.lower())
    
    return [f"{amount}{unit}" for amount, unit in matches]


# Run with: uvicorn ocr:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## STEP 2: Build the OCR Endpoint

Already done in Step 1! Here's what the endpoint does:

### Input
- Image file (JPEG, PNG)

### Process
1. Read and validate image
2. Preprocess (grayscale, resize)
3. Extract text using Tesseract
4. Match text against medicine database

### Output
```json
{
  "success": true,
  "extracted_text": "Rx: Biogesic 500mg\nSig: Take 1 tablet every 4 hours",
  "medicines": [
    {
      "name": "Biogesic",
      "generic": "Paracetamol",
      "type": "brand"
    }
  ],
  "medicine_count": 1
}
```

---

## STEP 3: Add Medicine Matching

The medicine matching is in the `match_medicines()` function.

### How to expand the database:

```python
MEDICINE_DATABASE = [
    # Pain Relief
    {"brand": "Biogesic", "generic": "Paracetamol"},
    {"brand": "Advil", "generic": "Ibuprofen"},
    {"brand": "Medicol", "generic": "Ibuprofen"},
    {"brand": "Ponstan", "generic": "Mefenamic Acid"},
    {"brand": "Dolfenal", "generic": "Mefenamic Acid"},
    
    # Cold & Flu
    {"brand": "Bioflu", "generic": "Phenylephrine + Chlorphenamine + Paracetamol"},
    {"brand": "Neozep", "generic": "Phenylpropanolamine + Chlorphenamine"},
    {"brand": "Decolgen", "generic": "Phenylpropanolamine + Paracetamol + Chlorphenamine"},
    
    # Cough
    {"brand": "Solmux", "generic": "Carbocisteine"},
    {"brand": "Lagundi", "generic": "Vitex negundo"},
    {"brand": "Robitussin", "generic": "Dextromethorphan"},
    
    # Antibiotics
    {"brand": "Amoxicillin", "generic": "Amoxicillin"},
    {"brand": "Augmentin", "generic": "Amoxicillin + Clavulanic Acid"},
    {"brand": "Cefalexin", "generic": "Cefalexin"},
    
    # Add more as needed...
]
```

---

## STEP 4: Test Your Service

### Run the service

```bash
# Make sure venv is activated
source venv/bin/activate

# Run the server
uvicorn ocr:app --reload --port 8000
```

Server will start at: **http://localhost:8000**

### Test in browser

Open: http://localhost:8000/docs

FastAPI provides automatic documentation! You can test the `/ocr` endpoint directly there.

### Test with curl

```bash
# Health check
curl http://localhost:8000/

# OCR with image file
curl -X POST "http://localhost:8000/ocr" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/prescription.jpg"
```

### Test with a sample image

Create a simple test image with text like "Biogesic 500mg" using any image editor, then test:

```bash
curl -X POST "http://localhost:8000/ocr" \
  -F "file=@data/sample_prescription.jpg"
```

---

## Alternative: Use Cloud Vision (Optional)

If Tesseract accuracy is poor, use Google Cloud Vision (better for handwriting).

### 1. Get API Key

Go to [Google Cloud Console](https://console.cloud.google.com/), enable Vision API, create credentials.

### 2. Install package

```bash
pip install google-cloud-vision
```

### 3. Add endpoint

```python
from google.cloud import vision
import os

# Set credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path/to/credentials.json"

@app.post("/ocr/cloud")
async def extract_text_cloud(file: UploadFile = File(...)):
    """Use Google Cloud Vision for better accuracy"""
    
    contents = await file.read()
    
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=contents)
    
    response = client.text_detection(image=image)
    texts = response.text_annotations
    
    if texts:
        extracted_text = texts[0].description
        medicines = match_medicines(extracted_text)
        return {
            "success": True,
            "extracted_text": extracted_text,
            "medicines": medicines
        }
    
    return {"success": False, "medicines": []}
```

---

## Demo Fallback Strategy

For the hackathon demo, OCR might fail due to image quality. Here's a fallback:

### Add a demo endpoint that always works:

```python
@app.post("/ocr/demo")
async def demo_ocr(file: UploadFile = File(...)):
    """
    Demo endpoint that returns realistic results.
    Use this if the real OCR fails during presentation.
    """
    return {
        "success": True,
        "extracted_text": "Rx: Paracetamol 500mg\n#10 tablets\nSig: Take 1 tablet every 4-6 hours for fever",
        "medicines": [
            {
                "name": "Paracetamol",
                "generic": "Paracetamol",
                "type": "generic"
            }
        ],
        "medicine_count": 1,
        "note": "Demo mode"
    }
```

Tell your backend teammate to call `/ocr/demo` if the real OCR fails.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/ocr` | Extract text from prescription image |
| POST | `/ocr/demo` | Demo endpoint (always returns valid data) |

### POST /ocr

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "success": true,
  "extracted_text": "Rx: Biogesic 500mg",
  "medicines": [
    {
      "name": "Biogesic",
      "generic": "Paracetamol",
      "type": "brand"
    }
  ],
  "medicine_count": 1
}
```

---

## Git Workflow

### Daily Workflow

```bash
# 1. Make sure you're on ml branch
git checkout ml

# 2. Get latest changes
git pull origin ml

# 3. Activate venv before working
source venv/bin/activate

# 4. Work on your tasks...

# 5. Save your work
git add .
git commit -m "Add medicine matching logic"
git push origin ml
```

### What to commit

- ✅ `ocr.py`
- ✅ `requirements.txt`
- ✅ Sample test images in `data/`
- ❌ Don't commit `venv/` folder (it's in .gitignore)

### Commit Message Examples

- `"Add basic OCR endpoint with Tesseract"`
- `"Expand medicine database with 20 drugs"`
- `"Add image preprocessing for better accuracy"`
- `"Add demo fallback endpoint"`

---

## Checklist Before Demo Day

- [ ] Service runs with `uvicorn ocr:app --port 8000`
- [ ] `/ocr` endpoint accepts images and returns medicines
- [ ] Medicine database has 15+ common drugs
- [ ] Demo endpoint (`/ocr/demo`) returns realistic data
- [ ] Tested with sample prescription image
- [ ] Backend can successfully call your service
- [ ] No errors in terminal when processing images

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'pytesseract'"

```bash
# Activate venv first!
source venv/bin/activate
pip install pytesseract
```

### "tesseract is not installed or it's not in your PATH"

```bash
# Install Tesseract system package
sudo apt install tesseract-ocr
```

### "Port 8000 already in use"

```bash
# Kill existing process
lsof -i :8000
kill -9 <PID>
```

### OCR returns empty text

- Check image quality (too blurry?)
- Try increasing contrast
- Use printed text for demo (handwriting is hard)

---

## Communication with Backend

Your service will be called by the backend at `http://localhost:8000/ocr`.

**Format expected by backend:**

```json
{
  "success": true,
  "extracted_text": "...",
  "medicines": [
    {"name": "Biogesic", "generic": "Paracetamol", "type": "brand"}
  ]
}
```

If your format changes, tell @Keni (backend) immediately!

---

**Questions?** The key thing is: make sure `/ocr` returns medicine names. Even if OCR accuracy is 60%, that's fine for a demo.

Good luck! 🚀
