import React from "react";
import './Medsidebar.css';
import SearchBar from "./SearchBar";
import drug_placeholder from '../assets/Drug-placeholder.jfif';

const Medsidebar = () => {
    return (
        <>
        <div className="med-sidebar"> 
            <h1>Medicine </h1>

            <SearchBar /> 
        </div> 
        <div className="med-list">
            <ul>
                <li className="med-item">
                    <img src={drug_placeholder} alt="placeholder" />
                    <div className="drug-info">
                        <h3 className="drug-name">Paracetamol</h3>
                        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.</p>
                        <h3 className="drug-price">₱10.00</h3>
                    </div>
                    
                </li>

                <li className="med-item">
                    <img src={drug_placeholder} alt="placeholder" />
                    <div className="drug-info">
                        <h3 className="drug-name">Ibuprofen</h3>
                        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.</p>
                        <h3 className="drug-price">₱12.00</h3>
                    </div>
                    
                </li>

                <li className="med-item">
                    <img src={drug_placeholder} alt="placeholder" />
                    <div className="drug-info">
                        <h3 className="drug-name">Aspirin</h3>
                        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.</p>
                        <h3 className="drug-price">₱16.00</h3>
                    </div>
                    
                </li>

                <li className="med-item">
                    <img src={drug_placeholder} alt="placeholder" />
                    <div className="drug-info">
                        <h3 className="drug-name">Cetirizine</h3>
                        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.</p>
                        <h3 className="drug-price">₱10.00</h3>
                    </div>
                    
                </li>

                <li>Ibuprofen</li>
                <li>Aspirin</li>
                <li>Amoxicillin</li>
                <li>Cetirizine</li>
                <li>Loratadine</li>
            </ul>
        </div>

        <a href="" className="see-more">See more..</a>
        </>
        
        )
}

export default Medsidebar;