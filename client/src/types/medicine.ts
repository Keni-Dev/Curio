/**
 * Medicine-related type definitions
 */

export type MedicineForm =
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Suspension'
  | 'Injection'
  | 'Cream'
  | 'Ointment'
  | 'Drops'
  | 'Inhaler'
  | 'Patch'
  | 'Suppository'
  | 'Other';

export type MedicineCategory =
  | 'Pain Relief'
  | 'Antibiotics'
  | 'Cardiovascular'
  | 'Diabetes'
  | 'Respiratory'
  | 'Gastrointestinal'
  | 'Vitamins'
  | 'Dermatology'
  | 'Mental Health'
  | 'Allergy'
  | 'Other';

export interface Medicine {
  id: string;
  brandName?: string;
  genericName: string;
  dosage?: string;
  form?: MedicineForm;
  category?: MedicineCategory;
  tags: string[];
  requiresPrescription: boolean;
  description?: string;
  sideEffects?: string[];
  contraindications?: string[];
}

export interface MedicineSearchResult extends Medicine {
  matchScore: number;
  matchedField: 'brandName' | 'genericName' | 'tags';
}

export interface MedicineSearchFilters {
  query: string;
  category?: MedicineCategory;
  form?: MedicineForm;
  requiresPrescription?: boolean;
  limit?: number;
}

export interface MedicineWithAvailability extends Medicine {
  availableAt: number; // count of pharmacies with stock
  nearestPharmacy?: {
    id: string;
    name: string;
    distance: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}
