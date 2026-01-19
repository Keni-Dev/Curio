import { useState, useEffect } from 'react'
import './App.css'

function App() {

  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/pharmacies")
      .then(res => res.json())
      .then(data => setPharmacies(data))
      .catch(err => console.log(err))
  }, []
  )

  // GET /api/pharmacies

  // GET /api/pharmacies/nearby 

  // GET /api/search

  // POST /api/report

  // POST /api/ai/ocr

  return (
    <>
      <h1>Curio</h1>
      <div>
        <div>
          Pharmacies
        </div>
        <div>
          List Pharmacies:
          {Array.isArray(pharmacies) && pharmacies.map(pharmacy => (
            <div key={pharmacy.id}>
              <h2>{pharmacy.name}</h2>
              <p>Stock: {pharmacy.stock}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default App
