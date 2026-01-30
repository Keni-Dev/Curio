/**
 * Alay System Constants
 *
 * Configuration values for the community contribution system.
 */

// =============================================================================
// PROXIMITY CHECK
// =============================================================================

/** Maximum distance (meters) from pharmacy to submit a report */
export const MAX_REPORT_DISTANCE = 500;

/** Distance thresholds for UI feedback */
export const DISTANCE_THRESHOLDS = {
  /** Very close - show verified immediately */
  VERIFIED: 100,
  /** Close enough - show verified with distance */
  ACCEPTABLE: 500,
  /** Too far - show warning */
  TOO_FAR: 500,
} as const;

// =============================================================================
// POINTS SYSTEM
// =============================================================================

export const ALAY_POINTS = {
  /** Base points for submitting a stock report */
  STOCK_REPORT: 10,
  /** Bonus for first report of the day */
  FIRST_REPORT_OF_DAY: 5,
  /** Bonus at 7-day streak milestone */
  WEEK_STREAK_BONUS: 50,
  /** Bonus at 30-day streak milestone */
  MONTH_STREAK_BONUS: 250,
  /** Multiplier per streak day (max 50%) */
  STREAK_MULTIPLIER: 0.1,
  /** Maximum streak bonus percentage */
  MAX_STREAK_BONUS: 0.5,
} as const;

// =============================================================================
// LEVEL THRESHOLDS
// =============================================================================

export const LEVEL_THRESHOLDS = {
  Baguhan: 0,
  Scout: 100,
  Champion: 500,
  Legend: 2000,
} as const;

export const LEVEL_PROGRESS = {
  Baguhan: { min: 0, max: 99 },
  Scout: { min: 100, max: 499 },
  Champion: { min: 500, max: 1999 },
  Legend: { min: 2000, max: Infinity },
} as const;

// =============================================================================
// RATE LIMITING
// =============================================================================

/** Minimum seconds between reports at same pharmacy */
export const MIN_REPORT_INTERVAL_SAME_PHARMACY = 300; // 5 minutes

/** Cooldown between any reports (seconds) */
export const REPORT_COOLDOWN_SECONDS = 30;

/** Maximum reports per day per user */
export const MAX_REPORTS_PER_DAY = 50;

/** Maximum pending reports in offline queue */
export const MAX_PENDING_QUEUE = 20;

/** Report expiry time in hours */
export const REPORT_EXPIRY_HOURS = 4;

/** Duplicate check window in hours */
export const DUPLICATE_CHECK_HOURS = 24;

// =============================================================================
// ANTI-ABUSE CONFIGURATION
// =============================================================================

export const ANTI_ABUSE_CONFIG = {
  /** Trust score confidence weights */
  CONFIDENCE_WEIGHTS: {
    DISTANCE: 0.3,
    USER_TRUST: 0.25,
    VOTES: 0.25,
    FRESHNESS: 0.2,
  },
  /** Confidence level thresholds */
  CONFIDENCE_LEVELS: {
    HIGH: 0.7,
    MEDIUM: 0.4,
    LOW: 0.2,
  },
  /** Trust score adjustments */
  TRUST_ADJUSTMENTS: {
    ACCURATE_REPORT: 0.02,
    INACCURATE_REPORT: -0.05,
  },
  /** Minimum trust score to not be flagged */
  MIN_TRUST_THRESHOLD: 0.2,
  /** Consensus requirement multiplier */
  CONSENSUS_MULTIPLIER: 1.5,
  /** Negative vote ratio to trigger flag */
  NEGATIVE_VOTE_THRESHOLD: 0.66,
  /** Minimum votes before checking negative ratio */
  MIN_VOTES_FOR_FLAG: 3,
} as const;

// =============================================================================
// TRUST WEIGHTS BY LEVEL
// =============================================================================

export const TRUST_WEIGHTS = {
  Baguhan: 1.0,
  Scout: 1.5,
  Champion: 2.0,
  Legend: 3.0,
  Pharmacy: 5.0, // Verified pharmacy owner
} as const;

// =============================================================================
// UI COPY (FILIPINO)
// =============================================================================

export const ALAY_COPY = {
  // Modal
  modalHeader: 'Tumulong sa kapwa mo! 🤝',
  submitButton: 'I-submit ang Report',

  // Proximity
  checkingLocation: 'Kinukuha ang iyong lokasyon...',
  verifiedLocation: 'Verified na malapit ka sa pharmacy',
  tooFar: 'Mukhang malayo ka sa pharmacy na ito',
  locationDenied: 'Hindi namin makuha ang iyong lokasyon',
  enableLocation: 'I-enable ang location services',

  // Status options (legacy 3-button)
  statusInStock: 'May Stock',
  statusLowStock: 'Konti Na Lang',
  statusOutOfStock: 'Wala Na',
  skipOption: 'Hindi ko alam / Skip',

  // Status options (new 2-button layout)
  statusYes: 'OO, MERON',
  statusNo: 'WALA NA',
  statusYesSubtext: 'Available sa pharmacy',
  statusNoSubtext: 'Out of stock',
  lowStockToggle: 'Konti na lang?',
  skipLink: "Di ko alam / Skip this item",

  // Medicine selector
  medicineSearchPlaceholder: 'Hanapin ang gamot...',
  commonMedicinesLabel: 'Karaniwang gamot',
  photoUploadLabel: 'Mag-upload ng litrato',
  photoComingSoon: 'COMING SOON',
  remainingReports: (count: number, max: number) => `${count}/${max} natitira`,

  // Step questions
  statusQuestion: 'Meron ba nito sa pharmacy?',
  medicineQuestion: 'Anong gamot ang ire-report mo?',

  // Success
  successHeadline: 'Salamat, Bayani!',
  successSubtext: (count: number) =>
    `Nakatulong ka sa ${count} na kapwa Pilipino ngayong araw`,
  streakLabel: (days: number) => `🔥 ${days}-day streak!`,
  pointsEarned: (points: number) => `+${points} Alay Points`,

  // Offline
  offlineBanner: 'Offline ka — ise-save namin ito at i-submit mamaya',
  pendingSync: (count: number) =>
    `${count} pending report${count > 1 ? 's' : ''} to sync`,

  // Errors
  submitError: 'May problema sa pag-submit. Subukan ulit.',
  alreadyReported: 'Nag-report ka na para sa gamot na ito kamakailan',
} as const;

// =============================================================================
// ANIMATION DURATIONS
// =============================================================================

export const ALAY_ANIMATIONS = {
  /** Step transition duration in ms */
  STEP_TRANSITION: 300,
  /** Success confetti duration in ms */
  SUCCESS_CELEBRATION: 2000,
  /** Progress bar shimmer duration in ms */
  SHIMMER_DURATION: 2000,
} as const;
