/**
 * Tagalog (Filipino) Translations
 *
 * Secondary language file for Curio app.
 * Structure must match en.ts exactly.
 *
 * @see prompts/phase_05_polish/02_accessibility.md
 */

import type { TranslationSchema } from './en';

export const tl: TranslationSchema = {
  // ==========================================================================
  // Common
  // ==========================================================================
  common: {
    loading: 'Naglo-load...',
    error: 'May nangyaring mali',
    retry: 'Subukan Muli',
    cancel: 'Kanselahin',
    save: 'I-save',
    close: 'Isara',
    back: 'Bumalik',
    next: 'Susunod',
    search: 'Maghanap',
    clear: 'Burahin',
    submit: 'Ipasa',
    confirm: 'Kumpirmahin',
    delete: 'Burahin',
    edit: 'I-edit',
    view: 'Tingnan',
    share: 'Ibahagi',
    copy: 'Kopyahin',
    copied: 'Nakopya na!',
    offline: 'Wala kang internet',
    online: 'Naka-online na ulit',
  },

  // ==========================================================================
  // Navigation
  // ==========================================================================
  nav: {
    home: 'Home',
    map: 'Mapa',
    search: 'Maghanap',
    profile: 'Profile',
    scanner: 'Scanner',
    chat: 'Chat',
    settings: 'Settings',
    skipToMain: 'Lumaktaw sa pangunahing nilalaman',
  },

  // ==========================================================================
  // Accessibility Settings
  // ==========================================================================
  accessibility: {
    title: 'Accessibility',
    subtitle: 'I-customize ang iyong viewing experience',
    largeText: 'Malaking Teksto',
    largeTextDesc: 'Palakihin ang font ng 25%',
    highContrast: 'High Contrast',
    highContrastDesc: 'Palakasin ang visibility ng teksto',
    reduceMotion: 'Bawasan ang Motion',
    reduceMotionDesc: 'Bawasan ang animations',
    language: 'Wika',
    english: 'Ingles',
    tagalog: 'Tagalog',
    resetSettings: 'I-reset sa Default',
  },

  // ==========================================================================
  // Pharmacy
  // ==========================================================================
  pharmacy: {
    pharmacy: 'Botika',
    pharmacies: 'Mga Botika',
    nearbyPharmacies: 'Mga Botika Malapit',
    distance: '{{distance}} ang layo',
    verified: 'Verified',
    open24Hours: '24 Oras',
    hasGenerics: 'May Generic',
    viewDetails: 'Tingnan ang Detalye',
    getDirections: 'Kumuha ng Direksyon',
    call: 'Tawagan',
    noPharmaciesFound: 'Walang botika na nahanap malapit',
    searchPharmacy: 'Hanapin ang botika...',
  },

  // ==========================================================================
  // Stock Status
  // ==========================================================================
  stock: {
    inStock: 'May Stock',
    lowStock: 'Konti Na Lang',
    outOfStock: 'Ubos Na',
    unknown: 'Hindi Alam',
    lastUpdated: 'Huling na-update {{time}}',
    reportStock: 'Mag-report ng Stock',
    stockUpdated: 'Nai-submit na ang stock report!',
  },

  // ==========================================================================
  // Medicine Search
  // ==========================================================================
  medicine: {
    searchMedicine: 'Hanapin ang gamot...',
    recentSearches: 'Mga Kamakailan Hinanap',
    noResults: 'Walang nahanap na gamot',
    tryDifferent: 'Subukan ang ibang salita',
    genericName: 'Generic Name',
    brandName: 'Brand Name',
    dosage: 'Dosage',
    form: 'Form',
  },

  // ==========================================================================
  // Voice Search
  // ==========================================================================
  voice: {
    startListening: 'Magsimulang magsalita',
    stopListening: 'Itigil ang pakikinig',
    listening: 'Nakikinig...',
    speakNow: 'Magsalita na',
    voiceNotSupported: 'Hindi suportado ang voice search sa browser na ito',
    voiceError: 'Hindi maintindihan. Subukan muli.',
  },

  // ==========================================================================
  // OCR Scanner
  // ==========================================================================
  scanner: {
    title: 'Prescription Scanner',
    instructions: 'Ilagay ang reseta sa loob ng frame',
    capture: 'Kunan',
    retake: 'Kunan Muli',
    processing: 'Binabasa ang reseta...',
    success: 'Matagumpay na na-scan ang reseta!',
    error: 'Hindi mabasa ang reseta. Subukan muli.',
    medicinesFound: '{{count}} na gamot ang nahanap',
    noCamera: 'Kailangan ng camera access',
    allowCamera: 'Payagan ang camera access para ma-scan ang reseta',
  },

  // ==========================================================================
  // Medi-Bot Chat
  // ==========================================================================
  chat: {
    title: 'Medi-Bot',
    subtitle: 'Iyong medicine assistant',
    placeholder: 'Magtanong tungkol sa gamot...',
    send: 'Ipadala',
    thinking: 'Nag-iisip...',
    greeting: 'Kamusta! Ako si Medi-Bot. Paano kita matutulungan?',
    errorMessage: 'Sorry, may error. Subukan muli.',
    disclaimer:
      'General information lang ang ibinibigay ko. Kumonsulta lagi sa healthcare professional.',
  },

  // ==========================================================================
  // Alay (Contribution) System
  // ==========================================================================
  alay: {
    title: 'Alay Points',
    yourPoints: 'Iyong Points',
    level: 'Level {{level}}',
    pointsToNextLevel: '{{points}} points sa susunod na level',
    contribute: 'Mag-contribute',
    thankYou: 'Salamat! Maraming salamat sa pagtulong sa komunidad!',
    leaderboard: 'Leaderboard',
    yourRank: 'Iyong Rank',
    achievements: 'Mga Achievements',
    newAchievement: 'Achievement Unlocked!',
  },

  // ==========================================================================
  // Profile
  // ==========================================================================
  profile: {
    title: 'Profile',
    guest: 'Bisita',
    signIn: 'Mag-sign In',
    signOut: 'Mag-sign Out',
    contributions: 'Mga Contributions',
    settings: 'Settings',
    help: 'Tulong at Support',
    about: 'Tungkol sa Curio',
    version: 'Version {{version}}',
  },

  // ==========================================================================
  // Errors
  // ==========================================================================
  errors: {
    networkError: 'Network error. Tingnan ang iyong connection.',
    locationError: 'Hindi makuha ang iyong lokasyon.',
    permissionDenied: 'Hindi pinapayagan.',
    notFound: 'Hindi nahanap ang page',
    serverError: 'Server error. Subukan muli mamaya.',
  },

  // ==========================================================================
  // ARIA Labels (for screen readers)
  // ==========================================================================
  aria: {
    mainContent: 'Pangunahing nilalaman',
    navigation: 'Pangunahing navigation',
    searchResults: 'Mga resulta ng paghahanap',
    pharmacyCard: '{{name}}, {{distance}} ang layo, {{status}}',
    stockStatus: 'Stock status: {{status}}',
    closeModal: 'Isara ang dialog',
    openMenu: 'Buksan ang menu',
    mapMarker: '{{name}} pharmacy marker',
    loadingContent: 'Naglo-load ang content, maghintay',
    voiceSearchButton: 'Voice search',
    accessibilitySettings: 'Accessibility settings',
  },
} as const;
