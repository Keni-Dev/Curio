import { createClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'node:crypto';

type PharmacySeed = {
  name: string;
  address: string;
  city: string;
  phone: string | null;
  type: 'Chain' | 'Independent' | 'Hospital' | 'Generics';
  chain_name: string | null;
  is_24_hours: boolean;
  is_verified: boolean;
  rating: number | null;
  operating_hours: Record<string, string> | null;
  lat_offset: number;
  lng_offset: number;
};

type MedicineSeed = {
  brand_name: string | null;
  generic_name: string;
  dosage: string | null;
  form:
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
    | 'Other'
    | null;
  category:
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
    | 'Other'
    | null;
  tags: string[];
  requires_prescription: boolean;
  description: string | null;
  side_effects?: string[];
  contraindications?: string[];
};

type DemoUserSeed = {
  email: string;
  display_name: string;
  alay_points: number;
  streak_days: number;
  contribution_count: number;
  level: 'Baguhan' | 'Scout' | 'Champion' | 'Legend';
  trust_score: number;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MALLOS_CENTER = { lat: 14.8527, lng: 120.815 };

const PHARMACIES: PharmacySeed[] = [
  {
    name: 'Mercury Drug Malolos - Paseo del Congreso',
    address: 'Paseo del Congreso, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-1234',
    type: 'Chain',
    chain_name: 'Mercury Drug',
    is_24_hours: false,
    is_verified: true,
    rating: 4.6,
    operating_hours: { Daily: '7:00 AM - 10:00 PM' },
    lat_offset: 0.0007,
    lng_offset: -0.0061,
  },
  {
    name: 'Watsons Robinsons Malolos',
    address: 'Robinsons Place Malolos, MacArthur Highway',
    city: 'Malolos',
    phone: '(044) 796-5678',
    type: 'Chain',
    chain_name: 'Watsons',
    is_24_hours: false,
    is_verified: true,
    rating: 4.5,
    operating_hours: { Daily: '10:00 AM - 9:00 PM' },
    lat_offset: -0.0086,
    lng_offset: -0.0008,
  },
  {
    name: 'Rose Pharmacy Malolos',
    address: 'F. Santos St, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-4321',
    type: 'Chain',
    chain_name: 'Rose Pharmacy',
    is_24_hours: false,
    is_verified: true,
    rating: 4.2,
    operating_hours: { Daily: '8:00 AM - 9:00 PM' },
    lat_offset: -0.0024,
    lng_offset: -0.0004,
  },
  {
    name: 'Generika Drugstore Malolos',
    address: 'Paseo del Congreso, Malolos City',
    city: 'Malolos',
    phone: '(044) 662-1111',
    type: 'Generics',
    chain_name: 'Generika',
    is_24_hours: false,
    is_verified: true,
    rating: 4.1,
    operating_hours: { Daily: '8:00 AM - 8:00 PM' },
    lat_offset: -0.0006,
    lng_offset: -0.0038,
  },
  {
    name: 'TGP Drugstore Malolos - Capitol',
    address: 'J.P. Rizal St, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-7890',
    type: 'Generics',
    chain_name: 'The Generics Pharmacy',
    is_24_hours: false,
    is_verified: true,
    rating: 4.0,
    operating_hours: { Daily: '7:00 AM - 9:00 PM' },
    lat_offset: -0.0038,
    lng_offset: -0.0052,
  },
  {
    name: 'South Star Drug Malolos',
    address: 'Barasoain St, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-2468',
    type: 'Chain',
    chain_name: 'South Star Drug',
    is_24_hours: false,
    is_verified: true,
    rating: 4.4,
    operating_hours: { Daily: '8:00 AM - 10:00 PM' },
    lat_offset: 0.0023,
    lng_offset: -0.0022,
  },
  {
    name: 'Botika ng Bayan - Sto. Rosario',
    address: 'Sto. Rosario, Malolos City',
    city: 'Malolos',
    phone: '0917-123-4567',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.9,
    operating_hours: { Daily: '8:00 AM - 7:00 PM' },
    lat_offset: -0.0041,
    lng_offset: -0.0018,
  },
  {
    name: 'MedExpress 24/7 Pharmacy - Poblacion',
    address: 'Poblacion, Malolos City',
    city: 'Malolos',
    phone: '(044) 555-0000',
    type: 'Independent',
    chain_name: null,
    is_24_hours: true,
    is_verified: true,
    rating: 4.7,
    operating_hours: { Daily: 'Open 24 Hours' },
    lat_offset: 0.0011,
    lng_offset: -0.0049,
  },
  {
    name: 'Malolos Doctors Hospital Pharmacy',
    address: 'MacArthur Highway, Malolos City',
    city: 'Malolos',
    phone: '(044) 796-0001',
    type: 'Hospital',
    chain_name: null,
    is_24_hours: true,
    is_verified: true,
    rating: 4.6,
    operating_hours: { Daily: 'Open 24 Hours' },
    lat_offset: -0.0069,
    lng_offset: -0.0032,
  },
  {
    name: 'Bulacan Medical Center Pharmacy',
    address: 'Guinhawa, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-9000',
    type: 'Hospital',
    chain_name: null,
    is_24_hours: true,
    is_verified: true,
    rating: 4.3,
    operating_hours: { Daily: 'Open 24 Hours' },
    lat_offset: -0.0021,
    lng_offset: -0.0086,
  },
  {
    name: 'Watsons Waltermart Malolos',
    address: 'Waltermart Malolos, Bulihan',
    city: 'Malolos',
    phone: '(044) 741-2202',
    type: 'Chain',
    chain_name: 'Watsons',
    is_24_hours: false,
    is_verified: true,
    rating: 4.2,
    operating_hours: { Daily: '10:00 AM - 9:00 PM' },
    lat_offset: 0.0061,
    lng_offset: 0.0005,
  },
  {
    name: 'Mercury Drug Malolos - Capitol View',
    address: 'Capitol View Park, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-3344',
    type: 'Chain',
    chain_name: 'Mercury Drug',
    is_24_hours: false,
    is_verified: true,
    rating: 4.5,
    operating_hours: { Daily: '8:00 AM - 10:00 PM' },
    lat_offset: 0.0044,
    lng_offset: -0.0029,
  },
  {
    name: 'Rose Pharmacy Barasoain',
    address: 'Barasoain, Malolos City',
    city: 'Malolos',
    phone: '(044) 771-1266',
    type: 'Chain',
    chain_name: 'Rose Pharmacy',
    is_24_hours: false,
    is_verified: true,
    rating: 4.1,
    operating_hours: { Daily: '8:00 AM - 9:00 PM' },
    lat_offset: 0.0032,
    lng_offset: -0.0042,
  },
  {
    name: 'TGP Drugstore - Dakila',
    address: 'Dakila, Malolos City',
    city: 'Malolos',
    phone: '(044) 791-7788',
    type: 'Generics',
    chain_name: 'The Generics Pharmacy',
    is_24_hours: false,
    is_verified: true,
    rating: 4.0,
    operating_hours: { Daily: '7:00 AM - 9:00 PM' },
    lat_offset: -0.0091,
    lng_offset: -0.0074,
  },
  {
    name: 'Generika Drugstore - Longos',
    address: 'Longos, Malolos City',
    city: 'Malolos',
    phone: '(044) 700-1122',
    type: 'Generics',
    chain_name: 'Generika',
    is_24_hours: false,
    is_verified: false,
    rating: 3.9,
    operating_hours: { Daily: '8:00 AM - 8:00 PM' },
    lat_offset: -0.0016,
    lng_offset: 0.0069,
  },
  {
    name: 'South Star Drug - Guinhawa',
    address: 'Guinhawa, Malolos City',
    city: 'Malolos',
    phone: '(044) 701-2244',
    type: 'Chain',
    chain_name: 'South Star Drug',
    is_24_hours: false,
    is_verified: true,
    rating: 4.2,
    operating_hours: { Daily: '8:00 AM - 9:30 PM' },
    lat_offset: -0.0031,
    lng_offset: -0.0092,
  },
  {
    name: 'Botika ni Juan - Tikay',
    address: 'Tikay, Malolos City',
    city: 'Malolos',
    phone: '0918-555-0909',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.7,
    operating_hours: { Daily: '8:00 AM - 6:00 PM' },
    lat_offset: 0.0101,
    lng_offset: -0.0114,
  },
  {
    name: 'Botika ni Maria - Caliligawan',
    address: 'Caliligawan, Malolos City',
    city: 'Malolos',
    phone: '0918-111-2222',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.8,
    operating_hours: { Daily: '8:00 AM - 7:00 PM' },
    lat_offset: 0.0068,
    lng_offset: -0.0121,
  },
  {
    name: 'M.V. Drugstore - Mojon',
    address: 'Mojon, Malolos City',
    city: 'Malolos',
    phone: '0917-404-5678',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.9,
    operating_hours: { Daily: '8:00 AM - 7:30 PM' },
    lat_offset: -0.0122,
    lng_offset: -0.0045,
  },
  {
    name: 'HealthPlus Pharmacy - Santo Cristo',
    address: 'Santo Cristo, Malolos City',
    city: 'Malolos',
    phone: '0917-888-3344',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 4.0,
    operating_hours: { Daily: '8:00 AM - 8:00 PM' },
    lat_offset: 0.0028,
    lng_offset: -0.0097,
  },
  {
    name: 'FamilyCare Pharmacy - Lugam',
    address: 'Lugam, Malolos City',
    city: 'Malolos',
    phone: '0917-332-1122',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.8,
    operating_hours: { Daily: '8:00 AM - 7:00 PM' },
    lat_offset: 0.0049,
    lng_offset: 0.0042,
  },
  {
    name: 'CareSave Pharmacy - Sumapang Matanda',
    address: 'Sumapang Matanda, Malolos City',
    city: 'Malolos',
    phone: '0917-221-8833',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.9,
    operating_hours: { Daily: '8:00 AM - 7:00 PM' },
    lat_offset: -0.0067,
    lng_offset: 0.0048,
  },
  {
    name: 'St. Jude Pharmacy - Bulihan',
    address: 'Bulihan, Malolos City',
    city: 'Malolos',
    phone: '0917-220-9001',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.9,
    operating_hours: { Daily: '8:00 AM - 7:30 PM' },
    lat_offset: 0.0077,
    lng_offset: 0.0023,
  },
  {
    name: 'VitaPlus Pharmacy - Santo Niño',
    address: 'Santo Niño, Malolos City',
    city: 'Malolos',
    phone: '0917-775-2233',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.8,
    operating_hours: { Daily: '8:00 AM - 7:00 PM' },
    lat_offset: -0.0033,
    lng_offset: 0.0062,
  },
  {
    name: 'TGP Drugstore - Sumapang Bata',
    address: 'Sumapang Bata, Malolos City',
    city: 'Malolos',
    phone: '(044) 301-9988',
    type: 'Generics',
    chain_name: 'The Generics Pharmacy',
    is_24_hours: false,
    is_verified: true,
    rating: 4.0,
    operating_hours: { Daily: '7:00 AM - 9:00 PM' },
    lat_offset: -0.0058,
    lng_offset: 0.0066,
  },
  {
    name: 'Generika Drugstore - Bagong Bayan',
    address: 'Bagong Bayan, Malolos City',
    city: 'Malolos',
    phone: '(044) 302-1144',
    type: 'Generics',
    chain_name: 'Generika',
    is_24_hours: false,
    is_verified: true,
    rating: 4.0,
    operating_hours: { Daily: '8:00 AM - 8:00 PM' },
    lat_offset: -0.0104,
    lng_offset: -0.0011,
  },
  {
    name: 'Rose Pharmacy - Crossing',
    address: 'Crossing, Malolos City',
    city: 'Malolos',
    phone: '(044) 711-2233',
    type: 'Chain',
    chain_name: 'Rose Pharmacy',
    is_24_hours: false,
    is_verified: true,
    rating: 4.1,
    operating_hours: { Daily: '8:00 AM - 9:00 PM' },
    lat_offset: -0.0079,
    lng_offset: -0.0029,
  },
  {
    name: 'South Star Drug - Kapitolyo',
    address: 'Kapitolyo, Malolos City',
    city: 'Malolos',
    phone: '(044) 711-3300',
    type: 'Chain',
    chain_name: 'South Star Drug',
    is_24_hours: false,
    is_verified: true,
    rating: 4.3,
    operating_hours: { Daily: '8:00 AM - 9:30 PM' },
    lat_offset: 0.0017,
    lng_offset: -0.0071,
  },
  {
    name: 'Watsons Malolos - Bayan',
    address: 'Bayan, Malolos City',
    city: 'Malolos',
    phone: '(044) 711-4500',
    type: 'Chain',
    chain_name: 'Watsons',
    is_24_hours: false,
    is_verified: true,
    rating: 4.2,
    operating_hours: { Daily: '10:00 AM - 9:00 PM' },
    lat_offset: 0.0009,
    lng_offset: -0.0034,
  },
  {
    name: 'Botika ng Bayan - Atlag',
    address: 'Atlag, Malolos City',
    city: 'Malolos',
    phone: '0917-123-9900',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.7,
    operating_hours: { Daily: '8:00 AM - 6:30 PM' },
    lat_offset: 0.0108,
    lng_offset: -0.0024,
  },
  {
    name: 'Botika ng Bayan - Anilao',
    address: 'Anilao, Malolos City',
    city: 'Malolos',
    phone: '0917-333-1111',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.8,
    operating_hours: { Daily: '8:00 AM - 7:00 PM' },
    lat_offset: 0.0116,
    lng_offset: 0.0034,
  },
  {
    name: 'Botika ng Bayan - Catmon',
    address: 'Catmon, Malolos City',
    city: 'Malolos',
    phone: '0917-334-1222',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.6,
    operating_hours: { Daily: '8:00 AM - 6:00 PM' },
    lat_offset: 0.0092,
    lng_offset: 0.0069,
  },
  {
    name: 'Botika ng Bayan - San Pablo',
    address: 'San Pablo, Malolos City',
    city: 'Malolos',
    phone: '0917-221-4400',
    type: 'Independent',
    chain_name: null,
    is_24_hours: false,
    is_verified: false,
    rating: 3.7,
    operating_hours: { Daily: '8:00 AM - 6:30 PM' },
    lat_offset: -0.0129,
    lng_offset: 0.0051,
  },
];

const MEDICINES: MedicineSeed[] = [
  {
    brand_name: 'Biogesic',
    generic_name: 'Paracetamol',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Pain Relief',
    tags: ['pain', 'fever', 'headache', 'otc'],
    requires_prescription: false,
    description: 'Relief of mild to moderate pain and fever.',
  },
  {
    brand_name: 'Tylenol',
    generic_name: 'Paracetamol',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Pain Relief',
    tags: ['pain', 'fever', 'otc'],
    requires_prescription: false,
    description: 'Common pain and fever reducer.',
  },
  {
    brand_name: 'Advil',
    generic_name: 'Ibuprofen',
    dosage: '200mg',
    form: 'Tablet',
    category: 'Pain Relief',
    tags: ['pain', 'inflammation', 'otc'],
    requires_prescription: false,
    description: 'For pain and inflammation.',
  },
  {
    brand_name: 'Medicol Advance',
    generic_name: 'Ibuprofen',
    dosage: '400mg',
    form: 'Capsule',
    category: 'Pain Relief',
    tags: ['pain', 'headache', 'otc'],
    requires_prescription: false,
    description: 'Fast relief from headache and body pain.',
  },
  {
    brand_name: 'Dolfenal',
    generic_name: 'Mefenamic Acid',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Pain Relief',
    tags: ['pain', 'dysmenorrhea', 'rx'],
    requires_prescription: true,
    description: 'For pain relief, commonly used for dysmenorrhea.',
  },
  {
    brand_name: 'Naproxen',
    generic_name: 'Naproxen',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Pain Relief',
    tags: ['pain', 'inflammation', 'rx'],
    requires_prescription: true,
    description: 'NSAID for pain and inflammation.',
  },
  {
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
    brand_name: 'Tramadol',
    generic_name: 'Tramadol',
    dosage: '50mg',
    form: 'Capsule',
    category: 'Pain Relief',
    tags: ['pain', 'opioid', 'rx'],
    requires_prescription: true,
    description: 'For moderate to severe pain.',
  },
  {
    brand_name: 'Neozep',
    generic_name: 'Phenylephrine + Chlorphenamine + Paracetamol',
    dosage: null,
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['cold', 'flu', 'otc'],
    requires_prescription: false,
    description: 'For relief of colds, clogged nose, and headache.',
  },
  {
    brand_name: 'Bioflu',
    generic_name: 'Phenylephrine + Chlorphenamine + Paracetamol',
    dosage: null,
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['flu', 'fever', 'otc'],
    requires_prescription: false,
    description: 'For flu symptoms and body aches.',
  },
  {
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
    brand_name: 'Solmux',
    generic_name: 'Carbocisteine',
    dosage: '500mg',
    form: 'Capsule',
    category: 'Respiratory',
    tags: ['cough', 'phlegm', 'otc'],
    requires_prescription: false,
    description: 'For productive cough with phlegm.',
  },
  {
    brand_name: 'Ambroxol',
    generic_name: 'Ambroxol',
    dosage: '30mg',
    form: 'Tablet',
    category: 'Respiratory',
    tags: ['cough', 'mucolytic', 'rx'],
    requires_prescription: true,
    description: 'Mucolytic for productive cough.',
  },
  {
    brand_name: 'Ventolin',
    generic_name: 'Salbutamol',
    dosage: '100mcg',
    form: 'Inhaler',
    category: 'Respiratory',
    tags: ['asthma', 'bronchodilator', 'rx'],
    requires_prescription: true,
    description: 'Relief for asthma and bronchospasm.',
  },
  {
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
    brand_name: 'Cetirizine',
    generic_name: 'Cetirizine',
    dosage: '10mg',
    form: 'Tablet',
    category: 'Allergy',
    tags: ['allergy', 'antihistamine', 'otc'],
    requires_prescription: false,
    description: 'Relief of allergy symptoms.',
  },
  {
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
    brand_name: 'Azithromycin',
    generic_name: 'Azithromycin',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Antibiotics',
    tags: ['antibiotic', 'infection', 'rx'],
    requires_prescription: true,
    description: 'Macrolide antibiotic for bacterial infections.',
  },
  {
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
    brand_name: 'Pantoprazole',
    generic_name: 'Pantoprazole',
    dosage: '40mg',
    form: 'Tablet',
    category: 'Gastrointestinal',
    tags: ['acid', 'gerd', 'rx'],
    requires_prescription: true,
    description: 'Proton pump inhibitor for acid-related disorders.',
  },
  {
    brand_name: 'Kremil-S',
    generic_name: 'Aluminum Hydroxide + Magnesium Hydroxide + Simethicone',
    dosage: null,
    form: 'Tablet',
    category: 'Gastrointestinal',
    tags: ['antacid', 'heartburn', 'otc'],
    requires_prescription: false,
    description: 'Antacid for hyperacidity and gas.',
  },
  {
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
    brand_name: 'Diatabs',
    generic_name: 'Loperamide',
    dosage: '2mg',
    form: 'Tablet',
    category: 'Gastrointestinal',
    tags: ['diarrhea', 'otc'],
    requires_prescription: false,
    description: 'For acute diarrhea.',
  },
  {
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
    brand_name: 'Ceelin',
    generic_name: 'Ascorbic Acid',
    dosage: '500mg',
    form: 'Tablet',
    category: 'Vitamins',
    tags: ['vitamin c', 'immunity', 'otc'],
    requires_prescription: false,
    description: 'Vitamin C supplement for immune support.',
  },
  {
    brand_name: 'Enervon',
    generic_name: 'Multivitamins + Iron',
    dosage: null,
    form: 'Tablet',
    category: 'Vitamins',
    tags: ['vitamins', 'energy', 'otc'],
    requires_prescription: false,
    description: 'Multivitamin supplement for energy.',
  },
  {
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
    brand_name: 'Insulin Regular',
    generic_name: 'Insulin',
    dosage: '100IU/ml',
    form: 'Injection',
    category: 'Diabetes',
    tags: ['diabetes', 'insulin', 'rx'],
    requires_prescription: true,
    description: 'Insulin for diabetes management.',
  },
  {
    brand_name: 'Sertraline',
    generic_name: 'Sertraline',
    dosage: '50mg',
    form: 'Tablet',
    category: 'Mental Health',
    tags: ['depression', 'anxiety', 'rx'],
    requires_prescription: true,
    description: 'SSRI for depression and anxiety.',
  },
  {
    brand_name: 'Escitalopram',
    generic_name: 'Escitalopram',
    dosage: '10mg',
    form: 'Tablet',
    category: 'Mental Health',
    tags: ['depression', 'anxiety', 'rx'],
    requires_prescription: true,
    description: 'SSRI for anxiety and depression.',
  },
  {
    brand_name: 'Diazepam',
    generic_name: 'Diazepam',
    dosage: '5mg',
    form: 'Tablet',
    category: 'Mental Health',
    tags: ['anxiety', 'sedative', 'rx'],
    requires_prescription: true,
    description: 'For anxiety and muscle spasms.',
  },
  {
    brand_name: 'Betadine',
    generic_name: 'Povidone-Iodine',
    dosage: '10%',
    form: 'Other',
    category: 'Dermatology',
    tags: ['antiseptic', 'wound', 'otc'],
    requires_prescription: false,
    description: 'Antiseptic solution for wounds.',
  },
  {
    brand_name: 'Eye Mo',
    generic_name: 'Naphazoline + Zinc Sulfate',
    dosage: null,
    form: 'Drops',
    category: 'Other',
    tags: ['eye', 'redness', 'otc'],
    requires_prescription: false,
    description: 'Relief for eye redness and irritation.',
  },
  {
    brand_name: 'Lactulose',
    generic_name: 'Lactulose',
    dosage: '10g/15ml',
    form: 'Syrup',
    category: 'Gastrointestinal',
    tags: ['constipation', 'rx'],
    requires_prescription: true,
    description: 'For constipation relief.',
  },
];

const DEMO_USERS: DemoUserSeed[] = [
  {
    email: 'demo.presenter@curio.ph',
    display_name: 'Demo Presenter',
    alay_points: 2150,
    streak_days: 20,
    contribution_count: 128,
    level: 'Legend',
    trust_score: 0.93,
  },
  {
    email: 'maria.santos@demo.curio.ph',
    display_name: 'Maria Santos',
    alay_points: 860,
    streak_days: 12,
    contribution_count: 84,
    level: 'Champion',
    trust_score: 0.9,
  },
  {
    email: 'juan.delacruz@demo.curio.ph',
    display_name: 'Juan Dela Cruz',
    alay_points: 410,
    streak_days: 6,
    contribution_count: 38,
    level: 'Scout',
    trust_score: 0.76,
  },
  {
    email: 'ana.reyes@demo.curio.ph',
    display_name: 'Ana Reyes',
    alay_points: 1250,
    streak_days: 14,
    contribution_count: 96,
    level: 'Champion',
    trust_score: 0.94,
  },
  {
    email: 'paolo.cruz@demo.curio.ph',
    display_name: 'Paolo Cruz',
    alay_points: 320,
    streak_days: 4,
    contribution_count: 27,
    level: 'Scout',
    trust_score: 0.71,
  },
  {
    email: 'joy.dizon@demo.curio.ph',
    display_name: 'Joy Dizon',
    alay_points: 90,
    streak_days: 2,
    contribution_count: 9,
    level: 'Baguhan',
    trust_score: 0.6,
  },
  {
    email: 'angelo.tan@demo.curio.ph',
    display_name: 'Angelo Tan',
    alay_points: 560,
    streak_days: 10,
    contribution_count: 61,
    level: 'Champion',
    trust_score: 0.88,
  },
  {
    email: 'rhea.santos@demo.curio.ph',
    display_name: 'Rhea Santos',
    alay_points: 180,
    streak_days: 3,
    contribution_count: 19,
    level: 'Scout',
    trust_score: 0.7,
  },
  {
    email: 'mark.valdez@demo.curio.ph',
    display_name: 'Mark Valdez',
    alay_points: 740,
    streak_days: 11,
    contribution_count: 73,
    level: 'Champion',
    trust_score: 0.86,
  },
  {
    email: 'lea.pascual@demo.curio.ph',
    display_name: 'Lea Pascual',
    alay_points: 60,
    streak_days: 1,
    contribution_count: 6,
    level: 'Baguhan',
    trust_score: 0.58,
  },
  {
    email: 'nico.ramos@demo.curio.ph',
    display_name: 'Nico Ramos',
    alay_points: 980,
    streak_days: 15,
    contribution_count: 102,
    level: 'Champion',
    trust_score: 0.91,
  },
  {
    email: 'kim.lim@demo.curio.ph',
    display_name: 'Kim Lim',
    alay_points: 250,
    streak_days: 5,
    contribution_count: 25,
    level: 'Scout',
    trust_score: 0.73,
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const makeDeterministicId = (input: string) => {
  const hash = createHash('md5').update(input).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(
    16,
    20
  )}-${hash.slice(20, 32)}`;
};

const makeLocation = (lat: number, lng: number) =>
  `SRID=4326;POINT(${lng} ${lat})`;

const randomFrom = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const randomRecentDate = (hoursBack: number) => {
  const now = new Date();
  const randomMs = Math.random() * hoursBack * 60 * 60 * 1000;
  return new Date(now.getTime() - randomMs);
};

const randomStockStatus = () => {
  const roll = Math.random();
  if (roll < 0.6) return 'in_stock' as const;
  if (roll < 0.85) return 'low_stock' as const;
  return 'out_of_stock' as const;
};

async function upsertPharmacies() {
  console.log('🏪 Seeding pharmacies...');

  const rows = PHARMACIES.map((pharmacy) => {
    const lat = MALLOS_CENTER.lat + pharmacy.lat_offset;
    const lng = MALLOS_CENTER.lng + pharmacy.lng_offset;
    return {
      id: makeDeterministicId(`pharmacy:${pharmacy.name}`),
      name: pharmacy.name,
      slug: slugify(pharmacy.name),
      location: makeLocation(lat, lng),
      address: pharmacy.address,
      city: pharmacy.city,
      phone: pharmacy.phone,
      type: pharmacy.type,
      chain_name: pharmacy.chain_name,
      operating_hours: pharmacy.operating_hours,
      is_24_hours: pharmacy.is_24_hours,
      is_verified: pharmacy.is_verified,
      rating: pharmacy.rating,
      total_reports: 0,
    };
  });

  const { error } = await supabase
    .from('pharmacies')
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: false });

  if (error) {
    console.error('Failed to seed pharmacies:', error);
    throw error;
  }

  const { data } = await supabase
    .from('pharmacies')
    .select('id, slug')
    .in(
      'id',
      rows.map((row) => row.id)
    );

  return data ?? [];
}

async function upsertMedicines() {
  console.log('💊 Seeding medicines...');

  const rows = MEDICINES.map((medicine) => ({
    id: makeDeterministicId(
      `medicine:${medicine.generic_name}:${medicine.brand_name ?? ''}:${medicine.dosage ?? ''}`
    ),
    brand_name: medicine.brand_name,
    generic_name: medicine.generic_name,
    dosage: medicine.dosage,
    form: medicine.form,
    category: medicine.category,
    tags: medicine.tags,
    requires_prescription: medicine.requires_prescription,
    description: medicine.description,
    side_effects: medicine.side_effects ?? null,
    contraindications: medicine.contraindications ?? null,
  }));

  const { error } = await supabase.from('medicines').upsert(rows, {
    onConflict: 'id',
  });

  if (error) {
    console.error('Failed to seed medicines:', error);
    throw error;
  }

  const { data } = await supabase
    .from('medicines')
    .select('id, generic_name, brand_name, dosage')
    .in(
      'id',
      rows.map((row) => row.id)
    );

  return data ?? [];
}

async function upsertDemoUsers() {
  console.log('👤 Seeding demo users...');

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingByEmail = new Map(
    (existingUsers?.users ?? []).map((user) => [user.email, user])
  );

  const createdUsers: { id: string; email: string }[] = [];

  for (const demoUser of DEMO_USERS) {
    let userId = existingByEmail.get(demoUser.email)?.id;

    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demoUser.email,
        password: 'demo123456',
        email_confirm: true,
        user_metadata: { display_name: demoUser.display_name },
      });

      if (error || !data.user) {
        console.error(`Failed to create user ${demoUser.email}:`, error);
        continue;
      }

      userId = data.user.id;
    }

    createdUsers.push({ id: userId, email: demoUser.email });

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: demoUser.display_name,
      alay_points: demoUser.alay_points,
      streak_days: demoUser.streak_days,
      contribution_count: demoUser.contribution_count,
      level: demoUser.level,
      trust_score: demoUser.trust_score,
      last_contribution_at: randomRecentDate(8).toISOString(),
    });

    if (profileError) {
      console.error(`Failed to upsert profile for ${demoUser.email}:`, profileError);
    }
  }

  return createdUsers;
}

async function seedInventoryReports(
  pharmacies: { id: string; slug: string }[],
  medicines: { id: string; generic_name: string; brand_name: string | null }[],
  users: { id: string; email: string }[]
) {
  console.log('📊 Seeding inventory reports...');

  const reports: Array<Record<string, unknown>> = [];
  const medicinePool = medicines.length > 0 ? medicines : [];

  for (const pharmacy of pharmacies) {
    const reportCount = Math.floor(20 + Math.random() * 20); // 20-40 medicines per pharmacy
    const selectedMedicines = medicinePool
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(reportCount, medicinePool.length));

    for (const medicine of selectedMedicines) {
      const createdAt = randomRecentDate(6);
      const expiresAt = new Date(createdAt.getTime() + 4 * 60 * 60 * 1000);
      const status = randomStockStatus();
      const reporter = randomFrom(users);

      reports.push({
        id: randomUUID(),
        pharmacy_id: pharmacy.id,
        medicine_id: medicine.id,
        reported_by: reporter.id,
        status,
        price: status === 'out_of_stock' ? null : Number((10 + Math.random() * 450).toFixed(2)),
        notes: status === 'out_of_stock'
          ? 'Wala raw stock ngayon, balik ulit mamaya.'
          : 'May stock pa, napansin ko sa shelf.',
        distance_from_pharmacy: Number((10 + Math.random() * 250).toFixed(2)),
        helpful_count: Math.floor(Math.random() * 18),
        not_helpful_count: Math.floor(Math.random() * 4),
        created_at: createdAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }
  }

  const chunkSize = 500;
  for (let i = 0; i < reports.length; i += chunkSize) {
    const chunk = reports.slice(i, i + chunkSize);
    const { error } = await supabase.from('inventory_reports').insert(chunk);
    if (error) {
      console.error('Failed to insert inventory reports:', error);
      throw error;
    }
  }

  console.log(`  ✓ Created ${reports.length} inventory reports`);
}

async function verifyData() {
  const { count: pharmacyCount } = await supabase
    .from('pharmacies')
    .select('*', { count: 'exact', head: true });
  const { count: medicineCount } = await supabase
    .from('medicines')
    .select('*', { count: 'exact', head: true });
  const { count: reportCount } = await supabase
    .from('inventory_reports')
    .select('*', { count: 'exact', head: true });

  console.log('✅ Verification summary');
  console.log(`  📍 Pharmacies: ${pharmacyCount}`);
  console.log(`  💊 Medicines: ${medicineCount}`);
  console.log(`  📊 Reports: ${reportCount}`);
}

async function main() {
  console.log('🌱 Starting comprehensive demo seed for Malolos...');

  const pharmacies = await upsertPharmacies();
  const medicines = await upsertMedicines();
  const users = await upsertDemoUsers();

  await seedInventoryReports(pharmacies, medicines, users);
  await verifyData();

  console.log('🎉 Demo seeding complete!');
}

main().catch((error) => {
  console.error('❌ Demo seed failed:', error);
  process.exit(1);
});