import React from "react";
import search_icon from '../assets/search.svg';
import './SearchBar.css';

const SearchBar = ({ variant = 'default'}) => {
    return (
        <div className={`search-bar ${variant}`}>
            {variant === 'large' && <img src={search_icon} alt="Search Icon" className='search-icon' />}
            <input type="text" placeholder="Search.." />
            {variant !== 'large' && <img src={search_icon} alt="Search Icon" className='search-icon' />}
        </div>
    )
}

export default SearchBar;