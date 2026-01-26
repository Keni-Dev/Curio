import React from "react";  
import './Hook.css';
import logo from '../assets/CURIO2.png';
import SearchBar from "./SearchBar";


const Hook = () => {
    return (
        <>
        <div className="hook-section">  

            <img src={logo} alt="Curio Logo" />

            <SearchBar variant="large" />

            <div className="hook-text">
                <h1>Discover a New Way to Access Medicines</h1>
                <p>Find nearby pharmacies, explore medicine options, and get the care you need with Curio.</p>
                <a href="#" className="get-started-button">Get Started</a>
            </div>
            
        </div>
        </>
        
    )
}

export default Hook;