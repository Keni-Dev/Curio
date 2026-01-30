/**
 * Demo Mode - Main Entry Point
 *
 * Centralized demo mode configuration and exports.
 * When demo mode is active, all Supabase calls are intercepted
 * and replaced with static demo data for offline presentations.
 */

// Configuration
export * from './demoConfig';

// Data fixtures
export * from './demoData';

// Provider functions
export {
  demoFindNearbyPharmacies,
  demoGetPharmacyBySlug,
  demoGetPharmacyById,
  demoSearchMedicines,
  demoGetAllMedicines,
  demoGetPharmacyStock,
  demoGetPharmaciesWithMedicine,
  demoSubmitReport,
  demoCheckDuplicateReport,
  demoGetUserProfile,
  demoGetLeaderboard,
  demoUpdateUserPoints,
  DEMO_PHARMACIES,
  DEMO_MEDICINES,
  DEMO_LEADERBOARD,
  DEMO_USER_PROFILE,
} from './demoProvider';

// Re-export types for external use
export type { DemoProfile } from './demoData';
export type { PharmacyWithMedicineResult } from './demoProvider';

// Auth functions
export * from './demoAuth';

// AI functions
export {
  demoExtractPrescription,
  demoGenerateBotResponse,
  generateDemoMessageId,
  DEMO_OCR_SCENARIOS,
} from './demoAI';
