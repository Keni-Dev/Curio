/**
 * Alay (Contribution) State Store
 *
 * Zustand store for managing stock report state:
 * - Report modal visibility
 * - Report draft (pharmacy, medicine, status)
 * - Pending reports queue (offline support)
 * - Submission state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { StockStatusEnum } from '~types/database';

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = 'curio-alay-pending';

// =============================================================================
// TYPES
// =============================================================================

interface ReportDraft {
  pharmacyId: string;
  pharmacyName: string;
  medicineId: string | null;
  medicineName: string | null;
  status: StockStatusEnum | null;
  notes: string;
  photoUrl: string | null;
}

interface PendingReport {
  id: string;
  draft: ReportDraft;
  userLocation: { lat: number; lng: number } | null;
  distanceFromPharmacy: number | null;
  createdAt: number;
  retryCount: number;
}

type ReportStep = 'proximity' | 'medicine' | 'status' | 'confirmation';

interface AlayState {
  // Modal state
  isReportModalOpen: boolean;
  currentStep: ReportStep;

  // Report draft
  reportDraft: ReportDraft | null;

  // Submission state
  isSubmitting: boolean;
  lastReportTime: number | null;
  lastError: string | null;

  // Offline queue (persisted)
  pendingReports: PendingReport[];

  // User stats (cached for display)
  currentStreak: number;
  todayReportCount: number;
}

interface AlayActions {
  // Modal actions
  openReportModal: (pharmacyId: string, pharmacyName: string) => void;
  closeReportModal: () => void;
  setStep: (step: ReportStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Draft actions
  setMedicine: (medicineId: string, medicineName: string) => void;
  setStatus: (status: StockStatusEnum) => void;
  setNotes: (notes: string) => void;
  setPhotoUrl: (url: string | null) => void;
  resetDraft: () => void;

  // Submission actions
  setIsSubmitting: (isSubmitting: boolean) => void;
  setLastError: (error: string | null) => void;
  markReportSuccess: () => void;

  // Offline queue actions
  queueReport: (
    draft: ReportDraft,
    userLocation: { lat: number; lng: number } | null,
    distanceFromPharmacy: number | null
  ) => void;
  removeFromQueue: (id: string) => void;
  incrementRetryCount: (id: string) => void;
  clearQueue: () => void;

  // Stats actions
  setStreak: (streak: number) => void;
  incrementTodayCount: () => void;
  resetTodayCount: () => void;
}

type AlayStore = AlayState & AlayActions;

// =============================================================================
// DEFAULT STATE
// =============================================================================

const DEFAULT_DRAFT: ReportDraft = {
  pharmacyId: '',
  pharmacyName: '',
  medicineId: null,
  medicineName: null,
  status: null,
  notes: '',
  photoUrl: null,
};

const DEFAULT_STATE: AlayState = {
  isReportModalOpen: false,
  currentStep: 'proximity',
  reportDraft: null,
  isSubmitting: false,
  lastReportTime: null,
  lastError: null,
  pendingReports: [],
  currentStreak: 0,
  todayReportCount: 0,
};

// =============================================================================
// STEP ORDER
// =============================================================================

const STEP_ORDER: ReportStep[] = ['proximity', 'medicine', 'status', 'confirmation'];

// =============================================================================
// STORE
// =============================================================================

export const useAlayStore = create<AlayStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_STATE,

        // Modal actions
        openReportModal: (pharmacyId, pharmacyName) => {
          set({
            isReportModalOpen: true,
            currentStep: 'proximity',
            reportDraft: {
              ...DEFAULT_DRAFT,
              pharmacyId,
              pharmacyName,
            },
            lastError: null,
          });
        },

        closeReportModal: () => {
          set({
            isReportModalOpen: false,
            currentStep: 'proximity',
            reportDraft: null,
            isSubmitting: false,
            lastError: null,
          });
        },

        setStep: (step) => set({ currentStep: step }),

        nextStep: () => {
          const { currentStep } = get();
          const currentIndex = STEP_ORDER.indexOf(currentStep);
          const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1);
          set({ currentStep: STEP_ORDER[nextIndex] });
        },

        prevStep: () => {
          const { currentStep } = get();
          const currentIndex = STEP_ORDER.indexOf(currentStep);
          const prevIndex = Math.max(currentIndex - 1, 0);
          set({ currentStep: STEP_ORDER[prevIndex] });
        },

        // Draft actions
        setMedicine: (medicineId, medicineName) => {
          const { reportDraft } = get();
          if (!reportDraft) return;

          set({
            reportDraft: {
              ...reportDraft,
              medicineId,
              medicineName,
            },
          });
        },

        setStatus: (status) => {
          const { reportDraft } = get();
          if (!reportDraft) return;

          set({
            reportDraft: {
              ...reportDraft,
              status,
            },
          });
        },

        setNotes: (notes) => {
          const { reportDraft } = get();
          if (!reportDraft) return;

          set({
            reportDraft: {
              ...reportDraft,
              notes,
            },
          });
        },

        setPhotoUrl: (photoUrl) => {
          const { reportDraft } = get();
          if (!reportDraft) return;

          set({
            reportDraft: {
              ...reportDraft,
              photoUrl,
            },
          });
        },

        resetDraft: () => set({ reportDraft: null, currentStep: 'proximity' }),

        // Submission actions
        setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

        setLastError: (lastError) => set({ lastError }),

        markReportSuccess: () => {
          set({
            lastReportTime: Date.now(),
            isSubmitting: false,
            currentStep: 'confirmation',
          });
        },

        // Offline queue actions
        queueReport: (draft, userLocation, distanceFromPharmacy) => {
          const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          const newReport: PendingReport = {
            id,
            draft,
            userLocation,
            distanceFromPharmacy,
            createdAt: Date.now(),
            retryCount: 0,
          };

          set((state) => ({
            pendingReports: [...state.pendingReports, newReport],
          }));
        },

        removeFromQueue: (id) => {
          set((state) => ({
            pendingReports: state.pendingReports.filter((r) => r.id !== id),
          }));
        },

        incrementRetryCount: (id) => {
          set((state) => ({
            pendingReports: state.pendingReports.map((r) =>
              r.id === id ? { ...r, retryCount: r.retryCount + 1 } : r
            ),
          }));
        },

        clearQueue: () => set({ pendingReports: [] }),

        // Stats actions
        setStreak: (currentStreak) => set({ currentStreak }),

        incrementTodayCount: () => {
          set((state) => ({ todayReportCount: state.todayReportCount + 1 }));
        },

        resetTodayCount: () => set({ todayReportCount: 0 }),
      }),
      {
        name: STORAGE_KEY,
        // Only persist offline queue and stats
        partialize: (state) => ({
          pendingReports: state.pendingReports,
          currentStreak: state.currentStreak,
          todayReportCount: state.todayReportCount,
          lastReportTime: state.lastReportTime,
        }),
      }
    ),
    { name: 'AlayStore' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectIsReportModalOpen = (state: AlayStore) => state.isReportModalOpen;
export const selectCurrentStep = (state: AlayStore) => state.currentStep;
export const selectReportDraft = (state: AlayStore) => state.reportDraft;
export const selectIsSubmitting = (state: AlayStore) => state.isSubmitting;
export const selectPendingReports = (state: AlayStore) => state.pendingReports;
export const selectHasPendingReports = (state: AlayStore) => state.pendingReports.length > 0;

export const selectCanProceedFromMedicine = (state: AlayStore) =>
  state.reportDraft?.medicineId !== null;

export const selectCanSubmit = (state: AlayStore) =>
  state.reportDraft?.medicineId !== null && state.reportDraft?.status !== null;
