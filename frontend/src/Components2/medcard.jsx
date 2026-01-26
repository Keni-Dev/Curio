// frontend/src/components/PharmacyCard.jsx
import './medcard.css';

function MedCard({ pharmacy, onContribute }) {
  // Get color class based on stock
  const getStockClass = (stock) => {
    if (stock === 'High') return 'stock-high';
    if (stock === 'Low') return 'stock-low';
    return 'stock-out';
  };

  return (
    <div className="med-card">
      <div className="med-info">
        <h3>{pharmacy.name}</h3>
        <span className={`stock-badge ${getStockClass(pharmacy.stock)}`}>
          {pharmacy.stock === 'High' && '🟢'}
          {pharmacy.stock === 'Low' && '🟡'}
          {pharmacy.stock === 'Out of Stock' && '🔴'}
          {pharmacy.stock}
        </span>
      </div>
      
      <p className="med-distance">
        📍 {pharmacy.distance || '0.5'} km away
      </p>
      
      <div className="med-actions">
        <button className="btn-navigate">
          🧭 Navigate
        </button>
        <button className="btn-contribute" onClick={() => onContribute(pharmacy)}>
          ✋ Update Stock
        </button>
      </div>
    </div>
  );
}

export default MedCard;