import React from "react";
import logo from '../assets/CURIO.png';
import location_icon from '../assets/location.svg';
import search_icon from '../assets/search.svg';
import './navbar.css';
import SearchBar from "./SearchBar";
import { useEffect, useState } from 'react';



const Navbar = () => {

     const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

    return (
        <div className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <img src={logo} alt="Curio Logo" className='logo' />
            <ul>
                <li>Home</li>
                <li>Pharmacies</li>
                <li>Medicine</li>
                <li>About</li>
            </ul>

            <SearchBar />

            <img src={location_icon} alt="Location Icon" className='location-icon'/>
        </div>  
    )
}

export default Navbar;