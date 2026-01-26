import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './Components/navbar';
import Medsidebar from './Components/Medsidebar';
import Map from './Components/Map';
import Hook from './Components/Hook';
import MedicineBar from './Components2/medicinebar';

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
    <>
          <Navbar />

      <div className='Hook'> 
          <Hook />
      </div>
        <MedicineBar />
      
          <div className='container3'>
            <h2>Pharmacies Near You</h2>
            {loading && <p className="loading">Loading pharmacies...</p>}
            {Array.isArray(pharmacies) && pharmacies.map(pharmacy => (
              <div key={pharmacy.id} className="pharmacy-item">
                <h3>{pharmacy.name}</h3>
                <p>Stock: {pharmacy.stock}</p>
                <p>Distance: {pharmacy.distance ? pharmacy.distance + ' km' : 'N/A'}</p>
                <button className="btn-navigate">Navigate</button>
                <button className="btn-update">Update Stock</button>
              </div>
            ))}
          </div>

      <div className='container2'>
            <Medsidebar />
          </div>
      
      
      <div className='About-homepage'>
        <h2>About Curio</h2>
        <p>Curio is dedicated to revolutionizing the way you access medicines. Our platform connects you with nearby pharmacies, provides comprehensive medicine information, and ensures you get the care you need quickly and efficiently. Whether you're searching for a specific medication or exploring your options, Curio is here to help you every step of the way.</p>
      </div>

      <div style={{display: 'none'}}>
        <div>
          Old List
        </div>
      </div>
    </>
  )
}

export default App
