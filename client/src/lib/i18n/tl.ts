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
  // Auth
  // ==========================================================================
  auth: {
    welcomeBack: 'Maligayang pagbabalik',
    signInSubtitle: 'Ilagay ang iyong mga detalye para mag-sign in.',
    emailAddress: 'Email Address',
    emailPlaceholder: 'juan@example.com',
    password: 'Password',
    passwordPlaceholder: 'Ilagay ang iyong password',
    forgotPassword: 'Nakalimutan ang password?',
    signIn: 'Mag-sign in',
    signingIn: 'Nagsa-sign in...',
    orContinueWith: 'O magpatuloy gamit ang',
    signInWithGoogle: 'Mag-sign in gamit ang Google',
    noAccount: 'Wala pang account?',
    signUp: 'Mag-sign up',
    hasAccount: 'May account na?',
    bayanihanTitle: 'Bayanihan sa',
    bayanihanSubtitle: 'Kalusugan',
    bayanihanDesc: 'Sumali sa komunidad na nakatuon sa crowdsourced medicine tracking. Sama-sama, ginagawa nating accessible ang healthcare para sa lahat.',
    copyright: '© 2023 Curio Health. Lahat ng karapatan ay nakalaan.',
    emailRequired: 'Kinakailangan ang email',
    emailInvalid: 'Maglagay ng valid na email',
    passwordRequired: 'Kinakailangan ang password',
    signInFailed: 'Hindi matagumpay ang pag-sign in',
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
  // Onboarding
  // ==========================================================================
  onboarding: {
    skip: 'Laktawan',
    next: 'Susunod',
    getStarted: 'Magsimula Na',
    enableLocation: 'I-enable ang Lokasyon',
    // Slide 1 - Welcome
    welcomeBadge: 'Medicine Finder',
    welcomeTitle: 'Hanapin ang Gamot, Mas Mabilis',
    welcomeDescription: 'Ang Curio ay parang Waze para sa gamot. Makita ang real-time availability ng gamot sa mga botika malapit sa iyo.',
    // Slide 2 - Search
    searchBadge: 'Smart Search',
    searchTitle: 'Tingnan ang Gamot Mo',
    searchDescription: 'Maghanap ng kahit anong gamot at agad makita kung aling mga botika malapit ang may stock. Wala nang sayang na biyahe.',
    // Slide 3 - Community
    communityBadge: 'Community Power',
    communityTitle: 'Tayo-tayo ang Magkakatulong',
    communityDescription: 'Mag-report ng stock at kumita ng Alay Points. Ang iyong kontribusyon ay nakakatulong magligtas ng buhay sa real-time.',
    // Slide 4 - Get Started
    startBadge: 'Ready Na',
    startTitle: 'Magsimula Na Tayo',
    startDescription: 'I-enable ang lokasyon para makita ang mga botika malapit sa iyo at magsimulang maghanap ng gamot nang mas mabilis.',
    locationPermission: 'Kailangan namin ang iyong lokasyon para ipakita ang mga botika malapit sa iyo',
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
