import React from 'react';
import './medicinebar.css';
import MedCard from './medcard';

const MedicineBar = () => {
    // Sample pharmacy data
    const pharmacies = [
        { id: 1, name: 'Apollo Pharmacy', stock: 'High', distance: '0.5' },
        { id: 2, name: 'MediCare Plus', stock: 'Low', distance: '1.2' },
        { id: 3, name: 'HealthFirst', stock: 'Out of Stock', distance: '0.8' },
        { id: 4, name: 'QuickMeds', stock: 'High', distance: '1.5' },
        { id: 5, name: 'PharmaDirect', stock: 'Low', distance: '0.3' },
        { id: 6, name: 'CarePoint', stock: 'High', distance: '2.0' },
    ];

    const handleContribute = (pharmacy) => {
        console.log('Update stock for:', pharmacy.name);
    };

    return (
        <>
        <div className="medicine-bar">
            <h2 className='med-bar-h2'>Available Pharmacies</h2>
            <div className="medicine-cards-container">
                {pharmacies.map(pharmacy => (
                    <MedCard key={pharmacy.id} pharmacy={pharmacy} onContribute={handleContribute} />
                ))}
            </div>
        </div>
        </>
        
    )
} 

export default MedicineBar;