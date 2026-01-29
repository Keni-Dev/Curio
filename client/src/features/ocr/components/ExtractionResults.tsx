/**
 * ExtractionResults Component
 *
 * Sidebar/panel showing extracted medicines from OCR.
 * Allows selection, editing, and searching for medicines.
 */

import type { FC } from 'react';
import { useState } from 'react';
import { cn } from '~lib/utils';
import type { ExtractedMedicine, OCRResult } from '../types';
import { MedicineCard } from './MedicineCard';

interface ExtractionResultsProps {
  /** OCR extraction result */
  result: OCRResult;
  /** Toggle medicine selection */
  onToggleSelect: (id: string) => void;
  /** Update a medicine */
  onUpdateMedicine: (id: string, updates: Partial<ExtractedMedicine>) => void;
  /** Remove a medicine */
  onRemoveMedicine: (id: string) => void;
  /** Add manual medicine entry */
  onAddManual: (name: string, dosage?: string) => void;
  /** Search for selected medicines */
  onSearchMedicines: (medicines: ExtractedMedicine[]) => void;
  /** Go back to capture mode */
  onRetake: () => void;
  /** Additional class names */
  className?: string;
}

export const ExtractionResults: FC<ExtractionResultsProps> = ({
  result,
  onToggleSelect,
  onUpdateMedicine,
  onRemoveMedicine,
  onAddManual,
  onSearchMedicines,
  onRetake,
  className,
}) => {
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualDosage, setManualDosage] = useState('');

  const selectedMedicines = result.medicines.filter((m) => m.isSelected);
  const hasSelectedMedicines = selectedMedicines.length > 0;

  const handleAddManual = () => {
    if (manualName.trim()) {
      onAddManual(manualName.trim(), manualDosage.trim() || undefined);
      setManualName('');
      setManualDosage('');
      setIsAddingManual(false);
    }
  };

  const handleSearch = () => {
    if (hasSelectedMedicines) {
      onSearchMedicines(selectedMedicines);
    }
  };

  return (
    <aside
      className={cn(
        'w-full md:w-[400px] lg:w-[450px]',
        'bg-[#162927] border-t md:border-t-0 md:border-l border-[#254643]',
        'flex flex-col shadow-2xl',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[#254643] bg-background-dark">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-xl font-bold">Detected Items</h3>
          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            {result.medicines.length} Found
          </span>
        </div>
        <p className="text-[#94c7c2] text-sm">
          Review extracted medicines before searching.
        </p>
        {/* Processing time */}
        <p className="text-white/40 text-xs mt-1 font-mono">
          Processed in {result.processingTimeMs}ms
        </p>
      </div>

      {/* Warning if not a prescription */}
      {!result.isMedicalPrescription && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-[20px]">
              warning
            </span>
            <div>
              <p className="text-yellow-400 text-sm font-medium">
                Not detected as a prescription
              </p>
              <p className="text-yellow-400/70 text-xs mt-0.5">
                The image may not be a medical prescription. Results may be inaccurate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medicine List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background-dark">
        {result.medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
              medication
            </span>
            <p className="text-white/60 font-medium">No medicines detected</p>
            <p className="text-white/40 text-sm mt-1">
              Try adding items manually or retake the photo
            </p>
          </div>
        ) : (
          result.medicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onToggleSelect={() => onToggleSelect(medicine.id)}
              onUpdate={(updates) => onUpdateMedicine(medicine.id, updates)}
              onRemove={() => onRemoveMedicine(medicine.id)}
            />
          ))
        )}

        {/* Add Manual Entry */}
        {isAddingManual ? (
          <div className="rounded-xl border border-primary/30 bg-surface-dark p-4">
            <input
              type="text"
              placeholder="Medicine name"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className={cn(
                'w-full px-3 py-2 rounded-lg bg-white/10 text-white',
                'border border-white/10 focus:border-primary focus:outline-none',
                'placeholder:text-white/40 mb-2'
              )}
              autoFocus
            />
            <input
              type="text"
              placeholder="Dosage (optional, e.g., 500mg)"
              value={manualDosage}
              onChange={(e) => setManualDosage(e.target.value)}
              className={cn(
                'w-full px-3 py-2 rounded-lg bg-white/10 text-white',
                'border border-white/10 focus:border-primary focus:outline-none',
                'placeholder:text-white/40 mb-3'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddManual();
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddManual}
                disabled={!manualName.trim()}
                className={cn(
                  'flex-1 py-2 rounded-lg bg-primary text-white font-medium',
                  'hover:bg-primary-hover transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingManual(false)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingManual(true)}
            className={cn(
              'flex w-full items-center justify-center gap-2',
              'rounded-xl border border-dashed border-[#254643] p-4',
              'text-[#94c7c2] hover:bg-surface-dark hover:text-white transition-colors'
            )}
          >
            <span className="material-symbols-outlined">add</span>
            <span className="text-sm font-medium">Add another item manually</span>
          </button>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 md:p-6 bg-[#162927] border-t border-[#254643]">
        <div className="flex gap-3">
          <button
            onClick={onRetake}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
              'bg-white/10 text-white font-medium',
              'hover:bg-white/20 transition-colors'
            )}
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>

          <button
            onClick={handleSearch}
            disabled={!hasSelectedMedicines}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'rounded-xl h-14 px-5',
              'bg-accent text-white text-lg font-bold',
              'shadow-lg hover:bg-accent-hover transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <span className="material-symbols-outlined">search</span>
            <span className="truncate">
              Hanapin {hasSelectedMedicines ? `(${selectedMedicines.length})` : 'Lahat'}
            </span>
          </button>
        </div>

        <p className="text-center text-xs text-[#94c7c2] mt-3">
          Using crowdsourced inventory data
        </p>
      </div>
    </aside>
  );
};

export default ExtractionResults;
