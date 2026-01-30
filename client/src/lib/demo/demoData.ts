/**
 * Demo Data Fixtures
 *
 * Static mock data for offline demo mode.
 * Contains pharmacies, medicines, stock, user profiles, and leaderboard data.
 * All data is centered around Malolos area for the demo.
 */

import type {
  PharmacyType,
  StockStatus,
  MedicineForm,
  MedicineCategory,
  UserLevel,
} from '@/types/database';

// =============================================================================
// PHARMACY DATA
// =============================================================================

export interface DemoPharmacy {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  phone: string | null;
  type: PharmacyType;
  chain_name: string | null;
  operating_hours: Record<string, string> | null;
  is_24_hours: boolean;
  is_verified: boolean;
  logo_url: string | null;
  rating: number | null;
  total_reports: number;
  distance_meters: number;
}

/**
 * Demo pharmacies around Malolos area.
 * Realistic coordinates and data for presentation.
 */
export const DEMO_PHARMACIES: DemoPharmacy[] = [
  {
    id: 'demo-pharmacy-001',
    name: 'Mercury Drug Malolos - Paseo',
    slug: 'mercury-drug-malolos-paseo',
    lat: 14.8532,
    lng: 120.8089,
    address: 'Paseo del Congreso, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-1234',
    type: 'Chain',
    chain_name: 'Mercury Drug',
    operating_hours: {
      'Mon-Sat': '8:00 AM - 10:00 PM',
      Sun: '9:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.5,
    total_reports: 47,
    distance_meters: 150,
  },
  {
    id: 'demo-pharmacy-002',
    name: 'TGP Pharmacy Malolos - Capitol',
    slug: 'tgp-pharmacy-malolos-capitol',
    lat: 14.8495,
    lng: 120.8102,
    address: 'J.P. Rizal St, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-5678',
    type: 'Chain',
    chain_name: 'The Generics Pharmacy',
    operating_hours: {
      Daily: '7:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.3,
    total_reports: 32,
    distance_meters: 280,
  },
  {
    id: 'demo-pharmacy-003',
    name: 'Watsons Malolos Bayan',
    slug: 'watsons-malolos-bayan',
    lat: 14.8512,
    lng: 120.8127,
    address: 'Bayan, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-9012',
    type: 'Chain',
    chain_name: 'Watsons',
    operating_hours: {
      Daily: '10:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.6,
    total_reports: 58,
    distance_meters: 420,
  },
  {
    id: 'demo-pharmacy-004',
    name: 'Generika Drugstore Bulihan',
    slug: 'generika-drugstore-bulihan',
    lat: 14.8581,
    lng: 120.8165,
    address: 'Bulihan, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-3456',
    type: 'Chain',
    chain_name: 'Generika',
    operating_hours: {
      'Mon-Sat': '8:00 AM - 8:00 PM',
      Sun: '9:00 AM - 6:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.2,
    total_reports: 21,
    distance_meters: 650,
  },
  {
    id: 'demo-pharmacy-005',
    name: 'South Star Drug Barasoain',
    slug: 'south-star-drug-barasoain',
    lat: 14.8547,
    lng: 120.8133,
    address: 'Barasoain St, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-7890',
    type: 'Chain',
    chain_name: 'South Star Drug',
    operating_hours: {
      Daily: '7:30 AM - 9:30 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.4,
    total_reports: 29,
    distance_meters: 380,
  },
  {
    id: 'demo-pharmacy-006',
    name: 'Rose Pharmacy Sto. Rosario',
    slug: 'rose-pharmacy-sto-rosario',
    lat: 14.8501,
    lng: 120.8145,
    address: 'Sto. Rosario, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-2345',
    type: 'Chain',
    chain_name: 'Rose Pharmacy',
    operating_hours: {
      'Mon-Sat': '8:00 AM - 9:00 PM',
      Sun: '9:00 AM - 7:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.1,
    total_reports: 18,
    distance_meters: 520,
  },
  {
    id: 'demo-pharmacy-007',
    name: 'MedExpress 24/7 Pharmacy - Poblacion',
    slug: 'medexpress-247-pharmacy-poblacion',
    lat: 14.8519,
    lng: 120.8139,
    address: 'Poblacion, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-0000',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: 'Open 24 Hours',
    },
    is_24_hours: true,
    is_verified: true,
    logo_url: null,
    rating: 4.7,
    total_reports: 64,
    distance_meters: 310,
  },
  {
    id: 'demo-pharmacy-008',
    name: 'Farmacia de Malolos',
    slug: 'farmacia-de-malolos',
    lat: 14.8468,
    lng: 120.8169,
    address: 'Bahay Pare, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-4567',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      'Mon-Sat': '7:00 AM - 8:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 4.0,
    total_reports: 12,
    distance_meters: 890,
  },
  {
    id: 'demo-pharmacy-009',
    name: 'Mercury Drug Malolos',
    slug: 'mercury-drug-malolos',
    lat: 14.8527,
    lng: 120.8150,
    address: 'Paseo del Congreso, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-1234',
    type: 'Chain',
    chain_name: 'Mercury Drug',
    operating_hours: {
      'Mon-Sat': '8:00 AM - 10:00 PM',
      Sun: '9:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.5,
    total_reports: 52,
    distance_meters: 2100,
  },
  {
    id: 'demo-pharmacy-010',
    name: 'BulSU Health Center Pharmacy',
    slug: 'bulsu-health-center-pharmacy',
    lat: 14.8584,
    lng: 120.8136,
    address: 'Bulacan State University, Malolos City',
    city: 'Malolos',
    phone: '(044) 919-7800',
    type: 'Hospital',
    chain_name: null,
    operating_hours: {
      'Mon-Fri': '8:00 AM - 5:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.8,
    total_reports: 38,
    distance_meters: 2400,
  },
  {
    id: 'demo-pharmacy-011',
    name: 'Botika ng Barangay Longos',
    slug: 'botika-ng-barangay-longos',
    lat: 14.8433,
    lng: 120.8212,
    address: 'Longos, Malolos City',
    city: 'Malolos',
    phone: null,
    type: 'Generics',
    chain_name: null,
    operating_hours: {
      'Mon-Fri': '8:00 AM - 5:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.9,
    total_reports: 8,
    distance_meters: 1200,
  },
  {
    id: 'demo-pharmacy-012',
    name: 'Generics Plus Pharmacy - Crossing',
    slug: 'generics-plus-pharmacy-crossing',
    lat: 14.8478,
    lng: 120.8142,
    address: 'Crossing, Malolos City',
    city: 'Malolos',
    phone: '(044) 815-8901',
    type: 'Generics',
    chain_name: null,
    operating_hours: {
      Daily: '7:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.3,
    total_reports: 25,
    distance_meters: 750,
  },
  {
    id: 'demo-pharmacy-013',
    name: 'Watsons Robinsons Malolos',
    slug: 'watsons-robinsons-malolos',
    lat: 14.8441,
    lng: 120.8142,
    address: 'Robinsons Place Malolos, MacArthur Highway',
    city: 'Malolos',
    phone: '(044) 796-5678',
    type: 'Chain',
    chain_name: 'Watsons',
    operating_hours: {
      Daily: '10:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.5,
    total_reports: 44,
    distance_meters: 860,
  },
  {
    id: 'demo-pharmacy-014',
    name: 'Rose Pharmacy Barasoain',
    slug: 'rose-pharmacy-barasoain',
    lat: 14.8547,
    lng: 120.8133,
    address: 'Barasoain St, Malolos City',
    city: 'Malolos',
    phone: '(044) 771-1266',
    type: 'Chain',
    chain_name: 'Rose Pharmacy',
    operating_hours: {
      Daily: '8:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.2,
    total_reports: 30,
    distance_meters: 930,
  },
  {
    id: 'demo-pharmacy-015',
    name: 'South Star Drug - Kapitolyo',
    slug: 'south-star-drug-kapitolyo',
    lat: 14.8549,
    lng: 120.8117,
    address: 'Kapitolyo, Malolos City',
    city: 'Malolos',
    phone: '(044) 711-3300',
    type: 'Chain',
    chain_name: 'South Star Drug',
    operating_hours: {
      Daily: '8:00 AM - 9:30 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.3,
    total_reports: 36,
    distance_meters: 980,
  },
  {
    id: 'demo-pharmacy-016',
    name: 'TGP Drugstore - Dakila',
    slug: 'tgp-drugstore-dakila',
    lat: 14.8443,
    lng: 120.8087,
    address: 'Dakila, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-7788',
    type: 'Generics',
    chain_name: 'The Generics Pharmacy',
    operating_hours: {
      Daily: '7:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.0,
    total_reports: 28,
    distance_meters: 1100,
  },
  {
    id: 'demo-pharmacy-017',
    name: 'Generika Drugstore - Longos',
    slug: 'generika-drugstore-longos',
    lat: 14.8430,
    lng: 120.8216,
    address: 'Longos, Malolos City',
    city: 'Malolos',
    phone: '(044) 700-1122',
    type: 'Generics',
    chain_name: 'Generika',
    operating_hours: {
      Daily: '8:00 AM - 8:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.9,
    total_reports: 16,
    distance_meters: 1320,
  },
  {
    id: 'demo-pharmacy-018',
    name: 'Malolos Doctors Hospital Pharmacy',
    slug: 'malolos-doctors-hospital-pharmacy',
    lat: 14.8463,
    lng: 120.8122,
    address: 'MacArthur Highway, Malolos City',
    city: 'Malolos',
    phone: '(044) 796-0001',
    type: 'Hospital',
    chain_name: null,
    operating_hours: {
      Daily: 'Open 24 Hours',
    },
    is_24_hours: true,
    is_verified: true,
    logo_url: null,
    rating: 4.6,
    total_reports: 70,
    distance_meters: 1400,
  },
  {
    id: 'demo-pharmacy-019',
    name: 'Bulacan Medical Center Pharmacy',
    slug: 'bulacan-medical-center-pharmacy',
    lat: 14.8507,
    lng: 120.8068,
    address: 'Guinhawa, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-9000',
    type: 'Hospital',
    chain_name: null,
    operating_hours: {
      Daily: 'Open 24 Hours',
    },
    is_24_hours: true,
    is_verified: true,
    logo_url: null,
    rating: 4.4,
    total_reports: 65,
    distance_meters: 1500,
  },
  {
    id: 'demo-pharmacy-020',
    name: 'Watsons Waltermart Malolos',
    slug: 'watsons-waltermart-malolos',
    lat: 14.8582,
    lng: 120.8168,
    address: 'Waltermart Malolos, Bulihan',
    city: 'Malolos',
    phone: '(044) 741-2202',
    type: 'Chain',
    chain_name: 'Watsons',
    operating_hours: {
      Daily: '10:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.2,
    total_reports: 33,
    distance_meters: 1600,
  },
  {
    id: 'demo-pharmacy-021',
    name: 'Botika ni Juan - Tikay',
    slug: 'botika-ni-juan-tikay',
    lat: 14.8628,
    lng: 120.8038,
    address: 'Tikay, Malolos City',
    city: 'Malolos',
    phone: '0918-555-0909',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 6:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.7,
    total_reports: 10,
    distance_meters: 1750,
  },
  {
    id: 'demo-pharmacy-022',
    name: 'Botika ni Maria - Caliligawan',
    slug: 'botika-ni-maria-caliligawan',
    lat: 14.8614,
    lng: 120.8024,
    address: 'Caliligawan, Malolos City',
    city: 'Malolos',
    phone: '0918-111-2222',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 7:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.8,
    total_reports: 9,
    distance_meters: 1820,
  },
  {
    id: 'demo-pharmacy-023',
    name: 'M.V. Drugstore - Mojon',
    slug: 'mv-drugstore-mojon',
    lat: 14.8404,
    lng: 120.8094,
    address: 'Mojon, Malolos City',
    city: 'Malolos',
    phone: '0917-404-5678',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 7:30 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.9,
    total_reports: 14,
    distance_meters: 1900,
  },
  {
    id: 'demo-pharmacy-024',
    name: 'HealthPlus Pharmacy - Santo Cristo',
    slug: 'healthplus-pharmacy-santo-cristo',
    lat: 14.8556,
    lng: 120.8061,
    address: 'Santo Cristo, Malolos City',
    city: 'Malolos',
    phone: '0917-888-3344',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 8:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 4.0,
    total_reports: 17,
    distance_meters: 2000,
  },
  {
    id: 'demo-pharmacy-025',
    name: 'FamilyCare Pharmacy - Lugam',
    slug: 'familycare-pharmacy-lugam',
    lat: 14.8576,
    lng: 120.8192,
    address: 'Lugam, Malolos City',
    city: 'Malolos',
    phone: '0917-332-1122',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 7:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.8,
    total_reports: 12,
    distance_meters: 2100,
  },
  {
    id: 'demo-pharmacy-026',
    name: 'CareSave Pharmacy - Sumapang Matanda',
    slug: 'caresave-pharmacy-sumapang-matanda',
    lat: 14.8461,
    lng: 120.8221,
    address: 'Sumapang Matanda, Malolos City',
    city: 'Malolos',
    phone: '0917-221-8833',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 7:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.9,
    total_reports: 13,
    distance_meters: 2250,
  },
  {
    id: 'demo-pharmacy-027',
    name: 'St. Jude Pharmacy - Bulihan',
    slug: 'st-jude-pharmacy-bulihan',
    lat: 14.8591,
    lng: 120.8174,
    address: 'Bulihan, Malolos City',
    city: 'Malolos',
    phone: '0917-220-9001',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 7:30 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.9,
    total_reports: 11,
    distance_meters: 2350,
  },
  {
    id: 'demo-pharmacy-028',
    name: 'VitaPlus Pharmacy - Santo Niño',
    slug: 'vitaplus-pharmacy-santo-nino',
    lat: 14.8468,
    lng: 120.8216,
    address: 'Santo Niño, Malolos City',
    city: 'Malolos',
    phone: '0917-775-2233',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 7:00 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.8,
    total_reports: 9,
    distance_meters: 2400,
  },
  {
    id: 'demo-pharmacy-029',
    name: 'TGP Drugstore - Sumapang Bata',
    slug: 'tgp-drugstore-sumapang-bata',
    lat: 14.8456,
    lng: 120.8219,
    address: 'Sumapang Bata, Malolos City',
    city: 'Malolos',
    phone: '(044) 301-9988',
    type: 'Generics',
    chain_name: 'The Generics Pharmacy',
    operating_hours: {
      Daily: '7:00 AM - 9:00 PM',
    },
    is_24_hours: false,
    is_verified: true,
    logo_url: null,
    rating: 4.0,
    total_reports: 21,
    distance_meters: 2500,
  },
  {
    id: 'demo-pharmacy-030',
    name: 'Botika ng Bayan - Atlag',
    slug: 'botika-ng-bayan-atlag',
    lat: 14.8641,
    lng: 120.8124,
    address: 'Atlag, Malolos City',
    city: 'Malolos',
    phone: '0917-123-9900',
    type: 'Independent',
    chain_name: null,
    operating_hours: {
      Daily: '8:00 AM - 6:30 PM',
    },
    is_24_hours: false,
    is_verified: false,
    logo_url: null,
    rating: 3.7,
    total_reports: 8,
    distance_meters: 2600,
  },
];

// =============================================================================
// MEDICINE DATA
// =============================================================================

export interface DemoMedicine {
  id: string;
  brand_name: string | null;
  generic_name: string;
  dosage: string | null;
  form: MedicineForm | null;
  category: MedicineCategory | null;
  tags: string[];
  requires_prescription: boolean;
  description: string | null;
  rank?: number;
}

/**
 * Demo medicines - common medicines in the Philippines.
 */
export const DEMO_MEDICINES: DemoMedicine[] = [
  {
    id: 'demo-medicine-001',
    brand_name: 'Biogesic',
    generic_name: 'Paracetamol',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Pain Relief',
    tags: ['pain', 'fever', 'headache', 'otc'],
    requires_prescription: false,
    description: 'For relief of minor aches and pains, and reduction of fever.',
  },
  {
    id: 'demo-medicine-002',
    brand_name: 'Neozep',
    generic_name: 'Phenylephrine + Chlorphenamine + Paracetamol',
    dosage: null,
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['cold', 'flu', 'cough', 'otc'],
    requires_prescription: false,
    description: 'For relief of clogged nose, runny nose, and headache due to cold.',
  },
  {
    id: 'demo-medicine-003',
    brand_name: 'Bioflu',
    generic_name: 'Phenylephrine + Chlorphenamine + Paracetamol',
    dosage: null,
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['flu', 'cold', 'fever', 'otc'],
    requires_prescription: false,
    description: 'For relief of flu symptoms including fever, body aches, and colds.',
  },
  {
    id: 'demo-medicine-004',
    brand_name: 'Solmux',
    generic_name: 'Carbocisteine',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Respiratory',
    tags: ['cough', 'phlegm', 'mucus', 'otc'],
    requires_prescription: false,
    description: 'For productive cough with phlegm.',
  },
  {
    id: 'demo-medicine-005',
    brand_name: 'Alaxan FR',
    generic_name: 'Ibuprofen + Paracetamol',
    dosage: '200mg/325mg',
    form: 'Tablet',
    category: 'Pain Relief',
    tags: ['pain', 'headache', 'body ache', 'otc'],
    requires_prescription: false,
    description: 'For relief of mild to moderate pain and fever.',
  },
  {
    id: 'demo-medicine-006',
    brand_name: 'Kremil-S',
    generic_name: 'Aluminum Hydroxide + Magnesium Hydroxide + Simethicone',
    dosage: null,
    form: 'Tablet',
    category: 'Gastrointestinal',
    tags: ['antacid', 'heartburn', 'indigestion', 'otc'],
    requires_prescription: false,
    description: 'For relief of hyperacidity, heartburn, and gas.',
  },
  {
    id: 'demo-medicine-007',
    brand_name: 'Diatabs',
    generic_name: 'Loperamide',
    dosage: '2mg',
    form: 'Tablet',
    category: 'Gastrointestinal',
    tags: ['diarrhea', 'lbm', 'otc'],
    requires_prescription: false,
    description: 'For acute and chronic diarrhea.',
  },
  {
    id: 'demo-medicine-008',
    brand_name: 'Medicol Advance',
    generic_name: 'Ibuprofen',
    dosage: '400mg',
    form: 'Capsule',
    category: 'Pain Relief',
    tags: ['pain', 'headache', 'migraine', 'otc'],
    requires_prescription: false,
    description: 'For relief of headache, toothache, and body pain.',
  },
  {
    id: 'demo-medicine-009',
    brand_name: 'Decolgen',
    generic_name: 'Phenylpropanolamine + Chlorphenamine + Paracetamol',
    dosage: null,
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['cold', 'decongestant', 'otc'],
    requires_prescription: false,
    description: 'For relief of colds and nasal congestion.',
  },
  {
    id: 'demo-medicine-010',
    brand_name: 'Ceelin',
    generic_name: 'Ascorbic Acid (Vitamin C)',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Vitamins',
    tags: ['vitamin', 'immunity', 'otc'],
    requires_prescription: false,
    description: 'Vitamin C supplement for immune system support.',
  },
  {
    id: 'demo-medicine-011',
    brand_name: 'Enervon',
    generic_name: 'Multivitamins + Iron',
    dosage: null,
    form: 'Tablet',
    category: 'Vitamins',
    tags: ['vitamin', 'energy', 'supplement', 'otc'],
    requires_prescription: false,
    description: 'Multivitamin supplement for energy and immunity.',
  },
  {
    id: 'demo-medicine-012',
    brand_name: 'Amoxicillin',
    generic_name: 'Amoxicillin',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'Antibiotic for bacterial infections.',
  },
  {
    id: 'demo-medicine-013',
    brand_name: 'Losartan',
    generic_name: 'Losartan Potassium',
    dosage: '50mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['hypertension', 'blood pressure', 'rx'],
    requires_prescription: true,
    description: 'For treatment of high blood pressure.',
  },
  {
    id: 'demo-medicine-014',
    brand_name: 'Metformin',
    generic_name: 'Metformin Hydrochloride',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Diabetes',
    tags: ['diabetes', 'blood sugar', 'rx'],
    requires_prescription: true,
    description: 'For management of type 2 diabetes mellitus.',
  },
  {
    id: 'demo-medicine-015',
    brand_name: 'Amlodipine',
    generic_name: 'Amlodipine Besylate',
    dosage: '5mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['hypertension', 'blood pressure', 'rx'],
    requires_prescription: true,
    description: 'For treatment of hypertension and angina.',
  },
  {
    id: 'demo-medicine-016',
    brand_name: 'Omeprazole',
    generic_name: 'Omeprazole',
    dosage: '20mg',
    form: 'Capsule',
    category: 'Gastrointestinal',
    tags: ['acid', 'ulcer', 'gerd', 'rx'],
    requires_prescription: true,
    description: 'For treatment of GERD and peptic ulcers.',
  },
  {
    id: 'demo-medicine-017',
    brand_name: 'Zyrtec',
    generic_name: 'Cetirizine',
    dosage: '10mg',
    form: 'Tablet',
    category: 'Allergy',
    tags: ['allergy', 'antihistamine', 'otc'],
    requires_prescription: false,
    description: 'For relief of allergy symptoms.',
  },
  {
    id: 'demo-medicine-018',
    brand_name: 'Ventolin',
    generic_name: 'Salbutamol',
    dosage: '2mg',
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['asthma', 'bronchodilator', 'rx'],
    requires_prescription: true,
    description: 'For relief of bronchospasm in asthma.',
  },
  {
    id: 'demo-medicine-019',
    brand_name: 'Flanax',
    generic_name: 'Naproxen Sodium',
    dosage: '550mg',
    form: 'Tablet',
    category: 'Pain Relief',
    tags: ['pain', 'inflammation', 'rx'],
    requires_prescription: true,
    description: 'For pain and inflammation relief.',
  },
  {
    id: 'demo-medicine-020',
    brand_name: 'Ascof',
    generic_name: 'Lagundi Leaf Extract',
    dosage: '600mg',
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['cough', 'herbal', 'otc'],
    requires_prescription: false,
    description: 'Herbal medicine for cough and asthma.',
  },
  {
    id: 'demo-medicine-021',
    brand_name: 'Dolfenal',
    generic_name: 'Mefenamic Acid',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Pain Relief',
    tags: ['pain', 'dysmenorrhea', 'otc'],
    requires_prescription: false,
    description: 'For relief of mild to moderate pain.',
  },
  {
    id: 'demo-medicine-022',
    brand_name: 'Tempra',
    generic_name: 'Paracetamol',
    dosage: '250mg/5ml',
    form: 'Syrup',
    category: 'Pain Relief',
    tags: ['fever', 'pain', 'children', 'otc'],
    requires_prescription: false,
    description: 'Paracetamol syrup for children.',
  },
  {
    id: 'demo-medicine-023',
    brand_name: 'Bonamine',
    generic_name: 'Meclizine',
    dosage: '25mg',
    form: 'Tablet',
    category: 'Other',
    tags: ['motion sickness', 'vertigo', 'otc'],
    requires_prescription: false,
    description: 'For prevention and treatment of motion sickness.',
  },
  {
    id: 'demo-medicine-024',
    brand_name: 'Robitussin DM',
    generic_name: 'Dextromethorphan + Guaifenesin',
    dosage: null,
    form: 'Syrup',
    category: 'Respiratory',
    tags: ['cough', 'expectorant', 'otc'],
    requires_prescription: false,
    description: 'For relief of cough with phlegm.',
  },
  {
    id: 'demo-medicine-025',
    brand_name: 'Propan',
    generic_name: 'Multivitamins + Lysine',
    dosage: null,
    form: 'Syrup',
    category: 'Vitamins',
    tags: ['vitamin', 'appetite', 'children', 'otc'],
    requires_prescription: false,
    description: 'Appetite stimulant with vitamins for children.',
  },
  {
    id: 'demo-medicine-026',
    brand_name: 'Advil',
    generic_name: 'Ibuprofen',
    dosage: '200mg',
    form: 'Tablet',
    category: 'Pain Relief',
    tags: ['pain', 'inflammation', 'otc'],
    requires_prescription: false,
    description: 'NSAID for pain and inflammation.',
  },
  {
    id: 'demo-medicine-027',
    brand_name: 'Medicol Advance',
    generic_name: 'Ibuprofen',
    dosage: '400mg',
    form: 'Capsule',
    category: 'Pain Relief',
    tags: ['pain', 'headache', 'otc'],
    requires_prescription: false,
    description: 'Fast relief for headache and body pain.',
  },
  {
    id: 'demo-medicine-028',
    brand_name: 'Ponstan',
    generic_name: 'Mefenamic Acid',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Pain Relief',
    tags: ['pain', 'dysmenorrhea', 'rx'],
    requires_prescription: true,
    description: 'For pain relief, commonly used for dysmenorrhea.',
  },
  {
    id: 'demo-medicine-029',
    brand_name: 'Aspirin',
    generic_name: 'Acetylsalicylic Acid',
    dosage: '80mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['blood thinning', 'cardio', 'rx'],
    requires_prescription: true,
    description: 'Low-dose aspirin for cardiovascular protection.',
  },
  {
    id: 'demo-medicine-030',
    brand_name: 'Losartan',
    generic_name: 'Losartan',
    dosage: '50mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['hypertension', 'rx'],
    requires_prescription: true,
    description: 'For treatment of hypertension.',
  },
  {
    id: 'demo-medicine-031',
    brand_name: 'Amlodipine',
    generic_name: 'Amlodipine',
    dosage: '5mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['hypertension', 'rx'],
    requires_prescription: true,
    description: 'For hypertension and angina.',
  },
  {
    id: 'demo-medicine-032',
    brand_name: 'Telmisartan',
    generic_name: 'Telmisartan',
    dosage: '40mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['hypertension', 'rx'],
    requires_prescription: true,
    description: 'Angiotensin receptor blocker for hypertension.',
  },
  {
    id: 'demo-medicine-033',
    brand_name: 'Enalapril',
    generic_name: 'Enalapril',
    dosage: '10mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['hypertension', 'rx'],
    requires_prescription: true,
    description: 'ACE inhibitor for hypertension.',
  },
  {
    id: 'demo-medicine-034',
    brand_name: 'Metoprolol',
    generic_name: 'Metoprolol',
    dosage: '50mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['hypertension', 'rx'],
    requires_prescription: true,
    description: 'Beta blocker for hypertension.',
  },
  {
    id: 'demo-medicine-035',
    brand_name: 'Atorvastatin',
    generic_name: 'Atorvastatin',
    dosage: '20mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['cholesterol', 'rx'],
    requires_prescription: true,
    description: 'For high cholesterol management.',
  },
  {
    id: 'demo-medicine-036',
    brand_name: 'Simvastatin',
    generic_name: 'Simvastatin',
    dosage: '20mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    tags: ['cholesterol', 'rx'],
    requires_prescription: true,
    description: 'For high cholesterol.',
  },
  {
    id: 'demo-medicine-037',
    brand_name: 'Metformin',
    generic_name: 'Metformin',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Diabetes',
    tags: ['diabetes', 'rx'],
    requires_prescription: true,
    description: 'First-line therapy for type 2 diabetes.',
  },
  {
    id: 'demo-medicine-038',
    brand_name: 'Glimepiride',
    generic_name: 'Glimepiride',
    dosage: '2mg',
    form: 'Tablet',
    category: 'Diabetes',
    tags: ['diabetes', 'rx'],
    requires_prescription: true,
    description: 'For blood sugar control in diabetes.',
  },
  {
    id: 'demo-medicine-039',
    brand_name: 'Gliclazide',
    generic_name: 'Gliclazide',
    dosage: '80mg',
    form: 'Tablet',
    category: 'Diabetes',
    tags: ['diabetes', 'rx'],
    requires_prescription: true,
    description: 'Sulfonylurea for diabetes management.',
  },
  {
    id: 'demo-medicine-040',
    brand_name: 'Amoxicillin',
    generic_name: 'Amoxicillin',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'Broad-spectrum antibiotic.',
  },
  {
    id: 'demo-medicine-041',
    brand_name: 'Azithromycin',
    generic_name: 'Azithromycin',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'Macrolide antibiotic for infections.',
  },
  {
    id: 'demo-medicine-042',
    brand_name: 'Ciprofloxacin',
    generic_name: 'Ciprofloxacin',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'Fluoroquinolone antibiotic.',
  },
  {
    id: 'demo-medicine-043',
    brand_name: 'Cephalexin',
    generic_name: 'Cephalexin',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'Cephalosporin antibiotic.',
  },
  {
    id: 'demo-medicine-044',
    brand_name: 'Doxycycline',
    generic_name: 'Doxycycline',
    dosage: '100mg',
    form: 'Capsule',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'Tetracycline antibiotic.',
  },
  {
    id: 'demo-medicine-045',
    brand_name: 'Metronidazole',
    generic_name: 'Metronidazole',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'For anaerobic infections.',
  },
  {
    id: 'demo-medicine-046',
    brand_name: 'Co-amoxiclav',
    generic_name: 'Amoxicillin + Clavulanate',
    dosage: '625mg',
    form: 'Tablet',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'Broad-spectrum antibiotic with clavulanate.',
  },
  {
    id: 'demo-medicine-047',
    brand_name: 'Omeprazole',
    generic_name: 'Omeprazole',
    dosage: '20mg',
    form: 'Capsule',
    category: 'Gastrointestinal',
    tags: ['acid', 'gerd', 'rx'],
    requires_prescription: true,
    description: 'For GERD and ulcer management.',
  },
  {
    id: 'demo-medicine-048',
    brand_name: 'Pantoprazole',
    generic_name: 'Pantoprazole',
    dosage: '40mg',
    form: 'Tablet',
    category: 'Gastrointestinal',
    tags: ['acid', 'gerd', 'rx'],
    requires_prescription: true,
    description: 'Proton pump inhibitor for acid disorders.',
  },
  {
    id: 'demo-medicine-049',
    brand_name: 'Gaviscon',
    generic_name: 'Sodium Alginate + Sodium Bicarbonate',
    dosage: null,
    form: 'Suspension',
    category: 'Gastrointestinal',
    tags: ['antacid', 'heartburn', 'otc'],
    requires_prescription: false,
    description: 'Relief of heartburn and indigestion.',
  },
  {
    id: 'demo-medicine-050',
    brand_name: 'Buscopan',
    generic_name: 'Hyoscine Butylbromide',
    dosage: '10mg',
    form: 'Tablet',
    category: 'Gastrointestinal',
    tags: ['cramps', 'spasm', 'rx'],
    requires_prescription: true,
    description: 'For abdominal cramps and spasms.',
  },
  {
    id: 'demo-medicine-051',
    brand_name: 'Domperidone',
    generic_name: 'Domperidone',
    dosage: '10mg',
    form: 'Tablet',
    category: 'Gastrointestinal',
    tags: ['nausea', 'vomiting', 'rx'],
    requires_prescription: true,
    description: 'For nausea and vomiting.',
  },
  {
    id: 'demo-medicine-052',
    brand_name: 'Oral Rehydration Salts',
    generic_name: 'Oral Rehydration Salts',
    dosage: null,
    form: 'Other',
    category: 'Gastrointestinal',
    tags: ['dehydration', 'otc'],
    requires_prescription: false,
    description: 'For dehydration due to diarrhea.',
  },
  {
    id: 'demo-medicine-053',
    brand_name: 'Potencee',
    generic_name: 'Ascorbic Acid',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Vitamins',
    tags: ['vitamin c', 'immunity', 'otc'],
    requires_prescription: false,
    description: 'Non-acidic vitamin C supplement.',
  },
  {
    id: 'demo-medicine-054',
    brand_name: 'Ferrous Sulfate',
    generic_name: 'Ferrous Sulfate',
    dosage: '325mg',
    form: 'Tablet',
    category: 'Vitamins',
    tags: ['iron', 'anemia', 'rx'],
    requires_prescription: true,
    description: 'Iron supplement for anemia.',
  },
  {
    id: 'demo-medicine-055',
    brand_name: 'Folic Acid',
    generic_name: 'Folic Acid',
    dosage: '5mg',
    form: 'Tablet',
    category: 'Vitamins',
    tags: ['folate', 'pregnancy', 'rx'],
    requires_prescription: true,
    description: 'Folate supplement.',
  },
  {
    id: 'demo-medicine-056',
    brand_name: 'Calcium + Vitamin D',
    generic_name: 'Calcium Carbonate + Vitamin D3',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Vitamins',
    tags: ['bones', 'supplement', 'otc'],
    requires_prescription: false,
    description: 'Supports bone health.',
  },
  {
    id: 'demo-medicine-057',
    brand_name: 'Neurobion',
    generic_name: 'Vitamin B Complex',
    dosage: null,
    form: 'Tablet',
    category: 'Vitamins',
    tags: ['vitamin b', 'nerves', 'otc'],
    requires_prescription: false,
    description: 'B-complex vitamins for nerve health.',
  },
  {
    id: 'demo-medicine-058',
    brand_name: 'Hydrocortisone',
    generic_name: 'Hydrocortisone',
    dosage: '1%',
    form: 'Cream',
    category: 'Dermatology',
    tags: ['itch', 'rash', 'otc'],
    requires_prescription: false,
    description: 'For itch and mild inflammation.',
  },
  {
    id: 'demo-medicine-059',
    brand_name: 'Clotrimazole',
    generic_name: 'Clotrimazole',
    dosage: '1%',
    form: 'Cream',
    category: 'Dermatology',
    tags: ['fungal', 'skin', 'otc'],
    requires_prescription: false,
    description: 'For fungal skin infections.',
  },
  {
    id: 'demo-medicine-060',
    brand_name: 'Mupirocin',
    generic_name: 'Mupirocin',
    dosage: '2%',
    form: 'Ointment',
    category: 'Dermatology',
    tags: ['skin', 'antibiotic', 'rx'],
    requires_prescription: true,
    description: 'Topical antibiotic for skin infections.',
  },
  {
    id: 'demo-medicine-061',
    brand_name: 'Salbutamol',
    generic_name: 'Salbutamol',
    dosage: '2mg/5ml',
    form: 'Syrup',
    category: 'Respiratory',
    tags: ['asthma', 'bronchodilator', 'rx'],
    requires_prescription: true,
    description: 'Bronchodilator syrup for children.',
  },
  {
    id: 'demo-medicine-062',
    brand_name: 'Montelukast',
    generic_name: 'Montelukast',
    dosage: '10mg',
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['allergy', 'asthma', 'rx'],
    requires_prescription: true,
    description: 'Maintenance treatment for asthma and allergies.',
  },
  {
    id: 'demo-medicine-063',
    brand_name: 'Loratadine',
    generic_name: 'Loratadine',
    dosage: '10mg',
    form: 'Tablet',
    category: 'Allergy',
    tags: ['allergy', 'antihistamine', 'otc'],
    requires_prescription: false,
    description: 'Non-drowsy allergy relief.',
  },
  {
    id: 'demo-medicine-064',
    brand_name: 'Diphenhydramine',
    generic_name: 'Diphenhydramine',
    dosage: '25mg',
    form: 'Tablet',
    category: 'Allergy',
    tags: ['allergy', 'antihistamine', 'otc'],
    requires_prescription: false,
    description: 'Antihistamine for allergy symptoms.',
  },
  {
    id: 'demo-medicine-065',
    brand_name: 'Insulin Regular',
    generic_name: 'Insulin',
    dosage: '100IU/ml',
    form: 'Injection',
    category: 'Diabetes',
    tags: ['diabetes', 'insulin', 'rx'],
    requires_prescription: true,
    description: 'Insulin for diabetes management.',
  },
];

// =============================================================================
// STOCK DATA (Pharmacy-Medicine Combinations)
// =============================================================================

export interface DemoStock {
  medicine_id: string;
  brand_name: string;
  generic_name: string;
  status: StockStatus;
  price: number | null;
  reported_by: string | null;
  reporter_name: string | null;
  created_at: string;
  expires_at: string;
  helpful_count: number;
  not_helpful_count: number;
}

/**
 * Generate demo stock data for a pharmacy.
 * Returns varied stock status for different medicines.
 */
export function generateDemoStockForPharmacy(pharmacyId: string): DemoStock[] {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  // Use pharmacy ID hash to generate consistent but varied stock
  const hash = pharmacyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Select 8-15 medicines for this pharmacy
  const medicineCount = 8 + (hash % 8);
  const startIndex = hash % 5;

  const stockData: DemoStock[] = [];

  for (let i = 0; i < medicineCount; i++) {
    const medicineIndex = (startIndex + i * 3) % DEMO_MEDICINES.length;
    const medicine = DEMO_MEDICINES[medicineIndex];
    
    // Skip if medicine is undefined (safety check)
    if (!medicine) continue;

    // Generate varied stock status
    const statusHash = (hash + i) % 10;
    let status: StockStatus;
    if (statusHash < 6) {
      status = 'in_stock';
    } else if (statusHash < 9) {
      status = 'low_stock';
    } else {
      status = 'out_of_stock';
    }

    // Generate realistic price (10-500 pesos)
    const basePrice = 15 + ((hash + i * 7) % 485);
    const price = status === 'out_of_stock' ? null : basePrice;

    // Random report time within last 2 hours
    const reportTime = new Date(
      twoHoursAgo.getTime() + Math.random() * 2 * 60 * 60 * 1000
    );

    stockData.push({
      medicine_id: medicine.id,
      brand_name: medicine.brand_name ?? medicine.generic_name,
      generic_name: medicine.generic_name,
      status,
      price,
      reported_by: 'demo-user-001',
      reporter_name: 'Demo Contributor',
      created_at: reportTime.toISOString(),
      expires_at: fourHoursLater.toISOString(),
      helpful_count: Math.floor(Math.random() * 15),
      not_helpful_count: Math.floor(Math.random() * 3),
    });
  }

  return stockData;
}

// =============================================================================
// USER PROFILE DATA
// =============================================================================

export interface DemoProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  alay_points: number;
  streak_days: number;
  contribution_count: number;
  level: UserLevel;
  badges: string[];
}

/**
 * Demo user profile for authenticated demo mode.
 */
export const DEMO_USER_PROFILE: DemoProfile = {
  id: 'demo-user-001',
  display_name: 'Demo User',
  avatar_url: null,
  alay_points: 1250,
  streak_days: 7,
  contribution_count: 42,
  level: 'Scout',
  badges: ['first_report', 'streak_7', 'helpful_10'],
};

/**
 * Demo leaderboard entries.
 */
export const DEMO_LEADERBOARD: DemoProfile[] = [
  {
    id: 'demo-leader-001',
    display_name: 'Maria Santos',
    avatar_url: null,
    alay_points: 5420,
    streak_days: 45,
    contribution_count: 186,
    level: 'Legend',
    badges: ['first_report', 'streak_30', 'helpful_100', 'legend'],
  },
  {
    id: 'demo-leader-002',
    display_name: 'Juan Dela Cruz',
    avatar_url: null,
    alay_points: 4150,
    streak_days: 32,
    contribution_count: 142,
    level: 'Champion',
    badges: ['first_report', 'streak_30', 'helpful_50'],
  },
  {
    id: 'demo-leader-003',
    display_name: 'Ana Reyes',
    avatar_url: null,
    alay_points: 3280,
    streak_days: 21,
    contribution_count: 98,
    level: 'Champion',
    badges: ['first_report', 'streak_14', 'helpful_25'],
  },
  {
    id: 'demo-leader-004',
    display_name: 'Pedro Garcia',
    avatar_url: null,
    alay_points: 2100,
    streak_days: 14,
    contribution_count: 67,
    level: 'Scout',
    badges: ['first_report', 'streak_14'],
  },
  {
    id: 'demo-leader-005',
    display_name: 'Rosa Mendoza',
    avatar_url: null,
    alay_points: 1580,
    streak_days: 9,
    contribution_count: 51,
    level: 'Scout',
    badges: ['first_report', 'streak_7'],
  },
  // Demo user in 6th place
  {
    ...DEMO_USER_PROFILE,
    id: 'demo-user-001',
  },
  {
    id: 'demo-leader-007',
    display_name: 'Carlos Tan',
    avatar_url: null,
    alay_points: 890,
    streak_days: 5,
    contribution_count: 28,
    level: 'Scout',
    badges: ['first_report'],
  },
  {
    id: 'demo-leader-008',
    display_name: 'Elena Cruz',
    avatar_url: null,
    alay_points: 650,
    streak_days: 3,
    contribution_count: 19,
    level: 'Baguhan',
    badges: ['first_report'],
  },
  {
    id: 'demo-leader-009',
    display_name: 'Marco Lim',
    avatar_url: null,
    alay_points: 420,
    streak_days: 2,
    contribution_count: 12,
    level: 'Baguhan',
    badges: ['first_report'],
  },
  {
    id: 'demo-leader-010',
    display_name: 'Sofia Ramos',
    avatar_url: null,
    alay_points: 180,
    streak_days: 1,
    contribution_count: 5,
    level: 'Baguhan',
    badges: [],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate distance between two coordinates in meters.
 * Uses Haversine formula.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get nearby pharmacies from demo data.
 */
export function getDemoNearbyPharmacies(
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000
): DemoPharmacy[] {
  return DEMO_PHARMACIES.map((pharmacy) => ({
    ...pharmacy,
    distance_meters: calculateDistance(userLat, userLng, pharmacy.lat, pharmacy.lng),
  }))
    .filter((pharmacy) => pharmacy.distance_meters <= radiusMeters)
    .sort((a, b) => a.distance_meters - b.distance_meters);
}

/**
 * Search demo medicines by query.
 */
export function searchDemoMedicines(
  query: string,
  limit: number = 20
): DemoMedicine[] {
  const lowerQuery = query.toLowerCase();

  return DEMO_MEDICINES.filter((medicine) => {
    const brandMatch = medicine.brand_name?.toLowerCase().includes(lowerQuery);
    const genericMatch = medicine.generic_name.toLowerCase().includes(lowerQuery);
    const tagMatch = medicine.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
    return brandMatch || genericMatch || tagMatch;
  })
    .slice(0, limit)
    .map((medicine, index) => ({
      ...medicine,
      rank: index + 1,
    }));
}

/**
 * Get pharmacies that have a specific medicine.
 */
export function getDemoPharmaciesWithMedicine(
  medicineId: string,
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000
): Array<DemoPharmacy & { stockStatus: StockStatus; price: number | null; lastReportedAt: string }> {
  const nearbyPharmacies = getDemoNearbyPharmacies(userLat, userLng, radiusMeters);

  return nearbyPharmacies
    .map((pharmacy) => {
      const stock = generateDemoStockForPharmacy(pharmacy.id);
      const medicineStock = stock.find((s) => s.medicine_id === medicineId);

      if (!medicineStock) return null;

      return {
        ...pharmacy,
        stockStatus: medicineStock.status,
        price: medicineStock.price,
        lastReportedAt: medicineStock.created_at,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}
