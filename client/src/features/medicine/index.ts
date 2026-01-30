/**
 * Medicine Feature
 *
 * Barrel export for medicine-related hooks, components, and utilities.
 */

// Hooks
export { useSearchMedicines, medicineQueryKeys } from './hooks/useSearchMedicines';
export { usePharmaciesWithMedicine, pharmaciesWithMedicineKeys } from './hooks/usePharmaciesWithMedicine';
export type { PharmacyWithMedicineStock, AvailabilityCounts } from './hooks/usePharmaciesWithMedicine';

// Components
export { AvailabilitySummaryBar, MedicineHeroCard } from './components';
