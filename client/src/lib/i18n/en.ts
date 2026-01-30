/**
 * English Translations
 *
 * Primary language file for Curio app.
 * All UI strings should be defined here first, then translated to Tagalog.
 *
 * @see prompts/phase_05_polish/02_accessibility.md
 */

export const en = {
  // ==========================================================================
  // Common
  // ==========================================================================
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try Again',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    clear: 'Clear',
    submit: 'Submit',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied!',
    offline: 'You are offline',
    online: 'Back online',
  },

  // ==========================================================================
  // Navigation
  // ==========================================================================
  nav: {
    home: 'Home',
    map: 'Map',
    search: 'Search',
    profile: 'Profile',
    scanner: 'Scanner',
    chat: 'Chat',
    settings: 'Settings',
    skipToMain: 'Skip to main content',
  },

  // ==========================================================================
  // Accessibility Settings
  // ==========================================================================
  accessibility: {
    title: 'Accessibility',
    subtitle: 'Customize your viewing experience',
    largeText: 'Large Text',
    largeTextDesc: 'Increase font size by 25%',
    highContrast: 'High Contrast',
    highContrastDesc: 'Improve text visibility',
    reduceMotion: 'Reduce Motion',
    reduceMotionDesc: 'Minimize animations',
    language: 'Language',
    english: 'English',
    tagalog: 'Tagalog',
    resetSettings: 'Reset to Defaults',
  },

  // ==========================================================================
  // Pharmacy
  // ==========================================================================
  pharmacy: {
    pharmacy: 'Pharmacy',
    pharmacies: 'Pharmacies',
    nearbyPharmacies: 'Nearby Pharmacies',
    distance: '{{distance}} away',
    verified: 'Verified',
    open24Hours: '24 Hours',
    hasGenerics: 'Generic Meds',
    viewDetails: 'View Details',
    getDirections: 'Get Directions',
    call: 'Call',
    noPharmaciesFound: 'No pharmacies found nearby',
    searchPharmacy: 'Search pharmacies...',
  },

  // ==========================================================================
  // Stock Status
  // ==========================================================================
  stock: {
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    unknown: 'Unknown',
    lastUpdated: 'Last updated {{time}}',
    reportStock: 'Report Stock',
    stockUpdated: 'Stock report submitted!',
  },

  // ==========================================================================
  // Medicine Search
  // ==========================================================================
  medicine: {
    searchMedicine: 'Search for medicine...',
    recentSearches: 'Recent Searches',
    noResults: 'No medicines found',
    tryDifferent: 'Try a different search term',
    genericName: 'Generic Name',
    brandName: 'Brand Name',
    dosage: 'Dosage',
    form: 'Form',
  },

  // ==========================================================================
  // Voice Search
  // ==========================================================================
  voice: {
    startListening: 'Start voice search',
    stopListening: 'Stop listening',
    listening: 'Listening...',
    speakNow: 'Speak now',
    voiceNotSupported: 'Voice search not supported in this browser',
    voiceError: 'Could not recognize speech. Please try again.',
  },

  // ==========================================================================
  // OCR Scanner
  // ==========================================================================
  scanner: {
    title: 'Prescription Scanner',
    instructions: 'Position the prescription within the frame',
    capture: 'Capture',
    retake: 'Retake',
    processing: 'Reading prescription...',
    success: 'Prescription scanned successfully!',
    error: 'Could not read prescription. Please try again.',
    medicinesFound: '{{count}} medicine(s) found',
    noCamera: 'Camera access required',
    allowCamera: 'Please allow camera access to scan prescriptions',
  },

  // ==========================================================================
  // Medi-Bot Chat
  // ==========================================================================
  chat: {
    title: 'Medi-Bot',
    subtitle: 'Your medicine assistant',
    placeholder: 'Ask about medicines...',
    send: 'Send',
    thinking: 'Thinking...',
    greeting: "Hello! I'm Medi-Bot. How can I help you today?",
    errorMessage: 'Sorry, I encountered an error. Please try again.',
    disclaimer:
      'I provide general information only. Always consult a healthcare professional.',
  },

  // ==========================================================================
  // Alay (Contribution) System
  // ==========================================================================
  alay: {
    title: 'Alay Points',
    yourPoints: 'Your Points',
    level: 'Level {{level}}',
    pointsToNextLevel: '{{points}} points to next level',
    contribute: 'Contribute',
    thankYou: 'Salamat! Thank you for helping the community!',
    leaderboard: 'Leaderboard',
    yourRank: 'Your Rank',
    achievements: 'Achievements',
    newAchievement: 'Achievement Unlocked!',
  },

  // ==========================================================================
  // Auth
  // ==========================================================================
  auth: {
    welcomeBack: 'Welcome back',
    signInSubtitle: 'Please enter your details to sign in.',
    emailAddress: 'Email Address',
    emailPlaceholder: 'juan@example.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot your password?',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    orContinueWith: 'Or continue with',
    signInWithGoogle: 'Sign in with Google',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    hasAccount: 'Already have an account?',
    bayanihanTitle: 'Bayanihan sa',
    bayanihanSubtitle: 'Kalusugan',
    bayanihanDesc: 'Join a community dedicated to crowdsourced medicine tracking. Together, we make healthcare accessible for everyone.',
    copyright: '© 2023 Curio Health. All rights reserved.',
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email',
    passwordRequired: 'Password is required',
    signInFailed: 'Sign in failed',
  },

  // ==========================================================================
  // Profile
  // ==========================================================================
  profile: {
    title: 'Profile',
    guest: 'Guest User',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    contributions: 'Contributions',
    settings: 'Settings',
    help: 'Help & Support',
    about: 'About Curio',
    version: 'Version {{version}}',
  },

  // ==========================================================================
  // Errors
  // ==========================================================================
  errors: {
    networkError: 'Network error. Please check your connection.',
    locationError: 'Could not get your location.',
    permissionDenied: 'Permission denied.',
    notFound: 'Page not found',
    serverError: 'Server error. Please try again later.',
  },

  // ==========================================================================
  // Onboarding
  // ==========================================================================
  onboarding: {
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get Started',
    enableLocation: 'Enable Location',
    // Slide 1 - Welcome
    welcomeBadge: 'Medicine Finder',
    welcomeTitle: 'Find the Cure, Faster',
    welcomeDescription: 'Curio is like Waze for medicines. Find real-time availability of medicines at pharmacies near you.',
    // Slide 2 - Search
    searchBadge: 'Smart Search',
    searchTitle: 'Tingnan ang Gamot Mo',
    searchDescription: 'Search any medicine and instantly see which nearby pharmacies have it in stock. No more wasted trips.',
    // Slide 3 - Community
    communityBadge: 'Community Power',
    communityTitle: 'Tayo-tayo ang Magkakatulong',
    communityDescription: 'Report stock availability and earn Alay Points. Your contributions help save lives in real-time.',
    // Slide 4 - Get Started
    startBadge: 'Ready to Go',
    startTitle: 'Magsimula Na Tayo',
    startDescription: 'Enable location to see pharmacies near you and start finding medicines faster than ever.',
    locationPermission: 'We need your location to show nearby pharmacies',
  },

  // ==========================================================================
  // ARIA Labels (for screen readers)
  // ==========================================================================
  aria: {
    mainContent: 'Main content',
    navigation: 'Main navigation',
    searchResults: 'Search results',
    pharmacyCard: '{{name}}, {{distance}} away, {{status}}',
    stockStatus: 'Stock status: {{status}}',
    closeModal: 'Close dialog',
    openMenu: 'Open menu',
    mapMarker: '{{name}} pharmacy marker',
    loadingContent: 'Loading content, please wait',
    voiceSearchButton: 'Voice search',
    accessibilitySettings: 'Accessibility settings',
  },
} as const;

// Deeply recursive type to allow any string values while maintaining structure
type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
    ? DeepStringRecord<T[K]>
    : T[K];
};

// The actual type used for validation - allows different string values
export type TranslationSchema = DeepStringRecord<typeof en>;

// For reference to the exact English keys (not for type checking translations)
export type TranslationKeys = typeof en;
