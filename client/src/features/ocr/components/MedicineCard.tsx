/**
 * MedicineCard Component
 *
 * Individual medicine card in the extraction results.
 * Shows confidence badge, allows selection and editing.
 */

import type { FC } from 'react';
import { useState } from 'react';
import { cn } from '~lib/utils';
import type { ExtractedMedicine, ConfidenceLevel } from '../types';

interface MedicineCardProps {
  /** The extracted medicine data */
  medicine: ExtractedMedicine;
  /** Toggle selection callback */
  onToggleSelect: () => void;
  /** Update medicine callback */
  onUpdate: (updates: Partial<ExtractedMedicine>) => void;
  /** Remove medicine callback */
  onRemove: () => void;
}

const confidenceStyles: Record<ConfidenceLevel, { bg: string; text: string; ring: string; label: string }> = {
  high: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    ring: 'ring-green-500/20',
    label: 'High Match',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    ring: 'ring-yellow-500/20',
    label: 'Medium Match',
  },
  low: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    ring: 'ring-red-500/20',
    label: 'Check Spelling',
  },
};

export const MedicineCard: FC<MedicineCardProps> = ({
  medicine,
  onToggleSelect,
  onUpdate,
  onRemove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(medicine.normalizedName ?? medicine.rawText);

  const styles = confidenceStyles[medicine.confidenceLevel];
  const displayName = medicine.normalizedName ?? medicine.rawText;
  const confidencePercent = Math.round(medicine.confidence * 100);

  const handleSaveEdit = () => {
    onUpdate({ 
      normalizedName: editValue,
      confidenceLevel: 'high', // Manual edit = high confidence
      confidence: 1.0,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(medicine.normalizedName ?? medicine.rawText);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'group relative flex items-stretch gap-3 rounded-xl p-4',
        'bg-surface-dark shadow-md transition-colors',
        'hover:bg-[#203c3a]',
        'border',
        medicine.isSelected ? 'border-primary/30' : 'border-transparent',
        medicine.confidenceLevel === 'low' && 'border-yellow-500/30'
      )}
    >
      {/* Selection Checkbox - now inside the card */}
      <button
        onClick={onToggleSelect}
        className={cn(
          'shrink-0 size-8 rounded-full',
          'flex items-center justify-center',
          'border-2 transition-all',
          medicine.isSelected
            ? 'bg-primary border-primary text-white'
            : 'bg-surface-dark border-white/30 hover:border-primary'
        )}
      >
        {medicine.isSelected && (
          <span className="material-symbols-outlined text-[18px]">check</span>
        )}
      </button>

      {/* Medicine Info */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={cn(
                'flex-1 px-2 py-1 rounded-lg bg-white/10 text-white',
                'border border-primary/50 focus:border-primary focus:outline-none',
                'text-sm font-medium'
              )}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <button
              onClick={handleSaveEdit}
              className="p-1 text-green-400 hover:text-green-300"
            >
              <span className="material-symbols-outlined text-[20px]">check</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 text-red-400 hover:text-red-300"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <h4
              className={cn(
                'text-lg font-bold leading-tight truncate',
                medicine.confidenceLevel === 'low' ? 'text-white/80 italic' : 'text-white'
              )}
            >
              {displayName}
              {medicine.dosage && (
                <span className="ml-2 text-sm font-normal text-white/60">
                  {medicine.dosage}
                </span>
              )}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  'p-1 transition-colors',
                  medicine.confidenceLevel === 'low'
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-white/50 hover:text-primary'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button
                onClick={onRemove}
                className="p-1 text-white/30 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5',
                'text-xs font-medium ring-1 ring-inset',
                styles.bg,
                styles.text,
                styles.ring
              )}
            >
              {confidencePercent}% {styles.label}
            </span>
            {medicine.isEdited && (
              <span className="text-xs text-white/40">Edited</span>
            )}
          </div>
        )}

        {/* Show raw text for low confidence */}
        {medicine.confidenceLevel === 'low' && !isEditing && (
          <p className="text-xs text-white/40 mt-1 truncate">
            Original: "{medicine.rawText}"
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
