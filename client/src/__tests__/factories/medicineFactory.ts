/**
 * Mock Factory: Medicines
 *
 * Creates mock medicine data for testing.
 */

import type {
  Medicine,
  MedicineWithAvailability,
  MedicineSearchResult,
  MedicineForm,
  MedicineCategory,
} from '@/types/medicine';

let idCounter = 1;

/**
 * Create a mock medicine with default values
 */
export function createMockMedicine(overrides: Partial<Medicine> = {}): Medicine {
  const id = `medicine-${idCounter++}`;
  return {
    id,
    brandName: 'Biogesic',
    genericName: 'Paracetamol',
    dosage: '500mg',
    form: 'Tablet' as MedicineForm,
    category: 'Pain Relief' as MedicineCategory,
    tags: ['fever', 'pain', 'headache'],
    requiresPrescription: false,
    description: 'For fever and mild pain relief',
    sideEffects: ['Nausea', 'Allergic reactions (rare)'],
    contraindications: ['Liver disease', 'Alcohol consumption'],
    ...overrides,
  };
}

/**
 * Create a mock medicine with availability info
 */
export function createMockMedicineWithAvailability(
  overrides: Partial<MedicineWithAvailability> = {}
): MedicineWithAvailability {
  return {
    ...createMockMedicine(overrides),
    availableAt: 15,
    nearestPharmacy: {
      id: 'pharmacy-1',
      name: 'Mercury Drug',
      distance: 250,
    },
    priceRange: {
      min: 5.0,
      max: 12.5,
    },
    ...overrides,
  };
}

/**
 * Create a mock medicine search result
 */
export function createMockSearchResult(
  overrides: Partial<MedicineSearchResult> = {}
): MedicineSearchResult {
  return {
    ...createMockMedicine(overrides),
    matchScore: 0.95,
    matchedField: 'brandName',
    ...overrides,
  };
}

/**
 * Create multiple mock medicines
 */
export function createMockMedicines(count: number): Medicine[] {
  const medicines = [
    { brandName: 'Biogesic', genericName: 'Paracetamol', category: 'Pain Relief' as MedicineCategory },
    { brandName: 'Neozep', genericName: 'Phenylephrine', category: 'Respiratory' as MedicineCategory },
    { brandName: 'Bioflu', genericName: 'Phenylpropanolamine', category: 'Respiratory' as MedicineCategory },
    { brandName: 'Dolfenal', genericName: 'Mefenamic Acid', category: 'Pain Relief' as MedicineCategory },
    { brandName: 'Alaxan', genericName: 'Ibuprofen + Paracetamol', category: 'Pain Relief' as MedicineCategory },
    { brandName: 'Amoxicillin', genericName: 'Amoxicillin', category: 'Antibiotics' as MedicineCategory },
    { brandName: 'Losartan', genericName: 'Losartan Potassium', category: 'Cardiovascular' as MedicineCategory },
    { brandName: 'Metformin', genericName: 'Metformin', category: 'Diabetes' as MedicineCategory },
    { brandName: 'Cetirizine', genericName: 'Cetirizine', category: 'Allergy' as MedicineCategory },
    { brandName: 'Omeprazole', genericName: 'Omeprazole', category: 'Gastrointestinal' as MedicineCategory },
  ];

  return Array.from({ length: count }, (_, i) =>
    createMockMedicine({
      ...(medicines[i % medicines.length] || {}),
    })
  );
}

/**
 * Create a prescription medicine
 */
export function createMockPrescriptionMedicine(
  overrides: Partial<Medicine> = {}
): Medicine {
  return createMockMedicine({
    brandName: 'Amoxicillin',
    genericName: 'Amoxicillin',
    dosage: '500mg',
    category: 'Antibiotics',
    requiresPrescription: true,
    tags: ['antibiotic', 'infection'],
    ...overrides,
  });
}

/**
 * Reset the ID counter (useful between tests)
 */
export function resetMedicineIdCounter() {
  idCounter = 1;
}
