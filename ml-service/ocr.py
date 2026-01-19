from fastapi import FastAPI, UploadFile
from PIL import Image

import * from medical-prescription-ocr/app.py

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    # step 1 get the image
    img = Image.open(file.file)
    img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, "JPEG")

    # step 2 extract text from image
    

    # step 3 classify the text

    # step 4 return the result

    return {"message": "Hello World"}