/**
 * ReportModal Component
 *
 * Main stock report modal that orchestrates the multi-step flow:
 * 1. Proximity Check - Verify user is near pharmacy
 * 2. Medicine Selection - Search/select medicine to report
 * 3. Status Selection - Choose stock status
 * 4. Confirmation - Thank you + points earned
 *
 * Includes anti-abuse protections:
 * - Rate limiting (30s cooldown, 50/day max)
 * - Duplicate report detection
 *
 * Uses centered Modal for cleaner presentation.
 *
 * @see references/alay_stock_report_contribution/code.html
 */

import { useCallback, useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAlayStore } from '@/stores/useAlayStore';
import { useSubmitReport } from '../hooks/useSubmitReport';
import { useOnlineStatus } from '../hooks/usePendingReports';
import { useRateLimit } from '../hooks/useRateLimit';
import { useDuplicateCheck } from '../hooks/useDuplicateCheck';
import { ProximityCheck } from './ProximityCheck';
import { MedicineSelector } from './MedicineSelector';
import { StatusSelector } from './StatusSelector';
import { ThankYouConfirmation } from './ThankYouConfirmation';
import { RateLimitDisplay, RateLimitBlocker } from './RateLimitDisplay';
import { DuplicateWarning } from './DuplicateWarning';
import { ALAY_COPY, ALAY_POINTS } from '../constants';
import type { StockStatusEnum } from '@/types/database';

// =============================================================================
// TYPES
// =============================================================================

interface ReportModalProps {
  /** Pharmacy location for proximity check */
  pharmacyLocation: { lat: number; lng: number };
  /** Optional pre-selected medicine */
  initialMedicineId?: string;
  initialMedicineName?: string;
}

interface SubmitResult {
  pointsEarned: number;
  bonusPoints: number;
  newStreak: number;
  wasQueued: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ReportModal({
  pharmacyLocation,
  initialMedicineId,
  initialMedicineName,
}: ReportModalProps) {
  // Store state
  const {
    isReportModalOpen,
    currentStep,
    reportDraft,
    todayReportCount,
    lastError,
    closeReportModal,
    nextStep,
    prevStep,
    setMedicine,
    setStatus,
    setStep,
  } = useAlayStore();

  // Online status
  const isOnline = useOnlineStatus();

  // Anti-abuse: Rate limiting
  const { data: rateLimit } = useRateLimit({
    enabled: isReportModalOpen,
  });

  // Anti-abuse: Duplicate check (only when medicine is selected)
  const { data: duplicateCheck } = useDuplicateCheck({
    pharmacyId: reportDraft?.pharmacyId ?? null,
    medicineId: reportDraft?.medicineId ?? null,
    enabled: isReportModalOpen && !!reportDraft?.medicineId,
  });

  // Submit result (for confirmation screen)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  // Show duplicate warning - derived from duplicateCheck, no useState needed
  const showDuplicateWarning = duplicateCheck?.hasDuplicate && duplicateCheck.isStillValid;

  // User location (captured during proximity check)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceFromPharmacy, setDistanceFromPharmacy] = useState<number | null>(null);

  // Submit mutation
  const submitMutation = useSubmitReport({
    onSuccess: (result) => {
      setSubmitResult({
        pointsEarned: result.pointsEarned,
        bonusPoints: result.bonusPoints,
        newStreak: result.newStreak,
        wasQueued: 'queued' in result && result.queued === true,
      });
      setStep('confirmation');
    },
  });

  // Set initial medicine if provided
  useEffect(() => {
    if (initialMedicineId && initialMedicineName && isReportModalOpen) {
      setMedicine(initialMedicineId, initialMedicineName);
    }
  }, [initialMedicineId, initialMedicineName, isReportModalOpen, setMedicine]);

  // Handlers
  const handleProximityVerified = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handleProximityProceed = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handleMedicineSelect = useCallback(
    (medicineId: string, medicineName: string) => {
      setMedicine(medicineId, medicineName);
    },
    [setMedicine]
  );

  const handleMedicineContinue = useCallback(() => {
    if (reportDraft?.medicineId) {
      nextStep();
    }
  }, [reportDraft, nextStep]);

  const handleStatusSelect = useCallback(
    (status: StockStatusEnum) => {
      setStatus(status);
    },
    [setStatus]
  );

  const handleSubmit = useCallback(() => {
    console.log('[ReportModal] handleSubmit called');
    console.log('[ReportModal] reportDraft:', reportDraft);
    
    if (!reportDraft?.medicineId || !reportDraft?.status) {
      console.log('[ReportModal] Missing medicineId or status, returning early');
      return;
    }

    console.log('[ReportModal] Calling submitMutation.mutate with:', {
      pharmacyId: reportDraft.pharmacyId,
      medicineId: reportDraft.medicineId,
      status: reportDraft.status,
      notes: reportDraft.notes,
      userLocation,
      distanceFromPharmacy,
    });

    submitMutation.mutate({
      pharmacyId: reportDraft.pharmacyId,
      medicineId: reportDraft.medicineId,
      status: reportDraft.status,
      notes: reportDraft.notes,
      userLocation,
      distanceFromPharmacy,
    });
  }, [reportDraft, submitMutation, userLocation, distanceFromPharmacy]);

  const handleClose = useCallback(() => {
    closeReportModal();
    setSubmitResult(null);
    setUserLocation(null);
    setDistanceFromPharmacy(null);
  }, [closeReportModal]);

  // Handle duplicate warning actions
  const handleUpdateExisting = useCallback(() => {
    // For now, just proceed - could implement update flow later
  }, []);

  const handleSubmitAnyway = useCallback(() => {
    // Continue with the report flow - warning will be dismissed
  }, []);

  // Can proceed from medicine step?
  const canProceedFromMedicine = reportDraft?.medicineId !== null && !showDuplicateWarning;

  // Can submit? Also check rate limit
  const isRateLimited = rateLimit && !rateLimit.canReport;
  const canSubmit = 
    reportDraft?.medicineId !== null && 
    reportDraft?.status !== null && 
    !isRateLimited &&
    !showDuplicateWarning;

  // Step indicator
  const stepNumber = useMemo(() => {
    const steps = ['proximity', 'medicine', 'status', 'confirmation'];
    return steps.indexOf(currentStep) + 1;
  }, [currentStep]);

  if (!isReportModalOpen) return null;

  // Get modal title based on step
  const getModalTitle = () => {
    if (currentStep === 'confirmation') return undefined;
    return ALAY_COPY.modalHeader;
  };

  // Get modal subtitle based on step  
  const getModalSubtitle = () => {
    if (currentStep === 'confirmation') return undefined;
    if (currentStep === 'proximity') return 'Tiyakin na malapit ka sa pharmacy';
    if (currentStep === 'medicine') return 'Pumili ng gamot na ire-report';
    if (currentStep === 'status') return 'Ano ang status ng stock?';
    return undefined;
  };

  return (
    <Modal
      isOpen={isReportModalOpen}
      onClose={handleClose}
      size="lg"
      showCloseButton={currentStep !== 'confirmation'}
      title={getModalTitle()}
      subtitle={getModalSubtitle()}
      headerIcon={
        currentStep !== 'confirmation' ? (
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[22px]">
              volunteer_activism
            </span>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {/* Offline Banner */}
        {!isOnline && currentStep !== 'confirmation' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <span className="material-symbols-outlined text-[18px]">cloud_off</span>
              <span className="text-sm font-medium">{ALAY_COPY.offlineBanner}</span>
            </div>
          </div>
        )}

        {/* Rate Limit Blocker - Show when on cooldown */}
        {isRateLimited && rateLimit?.reason === 'cooldown' && currentStep !== 'confirmation' && (
          <RateLimitBlocker 
            rateLimit={rateLimit} 
            onClose={() => {
              // Will auto-refresh via query
            }}
          />
        )}

        {/* Daily Limit Reached - Show full display */}
        {isRateLimited && rateLimit?.reason === 'daily_limit_reached' && currentStep !== 'confirmation' && (
          <div className="space-y-4">
            <RateLimitDisplay rateLimit={rateLimit} />
            <Button variant="outline" fullWidth onClick={handleClose}>
              Sige, bumalik na lang
            </Button>
          </div>
        )}

        {/* Normal Flow - Only show when not rate limited */}
        {(!isRateLimited || currentStep === 'confirmation') && (
          <>
            {/* Step Indicator (not shown on confirmation) */}
            {currentStep !== 'confirmation' && (
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      step === stepNumber
                        ? 'w-8 bg-primary'
                        : step < stepNumber
                        ? 'w-4 bg-primary/40'
                        : 'w-4 bg-slate-200 dark:bg-white/10'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Rate limit info (compact) - shown at top when not blocking */}
            {rateLimit && !isRateLimited && currentStep !== 'confirmation' && (
              <RateLimitDisplay rateLimit={rateLimit} compact />
            )}

        {/* Step Content */}
        {currentStep === 'proximity' && reportDraft && (
          <ProximityCheck
            pharmacyLocation={pharmacyLocation}
            pharmacyName={reportDraft.pharmacyName}
            onProceed={handleProximityProceed}
            onVerified={handleProximityVerified}
          />
        )}

        {currentStep === 'medicine' && reportDraft && (
          <div className="space-y-4">
            <MedicineSelector
              pharmacyId={reportDraft.pharmacyId}
              selectedId={reportDraft.medicineId}
              onSelect={handleMedicineSelect}
              remainingReports={rateLimit ? rateLimit.reportsRemaining : undefined}
            />

            {/* Duplicate Warning */}
            {showDuplicateWarning && duplicateCheck?.existingReport && (
              <DuplicateWarning
                existingReport={duplicateCheck.existingReport}
                isStillValid={duplicateCheck.isStillValid}
                onUpdateExisting={handleUpdateExisting}
                onSubmitAnyway={handleSubmitAnyway}
              />
            )}

            {/* Continue Button */}
            {!showDuplicateWarning && (
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Bumalik
                </Button>
                <Button
                  onClick={handleMedicineContinue}
                  disabled={!canProceedFromMedicine}
                  className="flex-1"
                >
                  Magpatuloy
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'status' && reportDraft && (
          <div className="space-y-4">
            {/* Selected Medicine Display - Enhanced soft mint style */}
            {reportDraft.medicineName && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 rounded-2xl p-4 mb-2 border border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm border border-primary/10">
                    <span className="material-symbols-outlined text-primary text-[28px]">
                      medication
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                        Tablet
                      </span>
                    </div>
                    <p className="font-bold text-text-primary text-lg truncate">
                      {reportDraft.medicineName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <StatusSelector
              value={reportDraft.status}
              onChange={handleStatusSelect}
              onSkip={handleClose}
              disabled={submitMutation.isPending}
            />

            {/* Error Display */}
            {lastError && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3">
                <p className="text-sm text-rose-700 dark:text-rose-300">{lastError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                Bumalik
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitMutation.isPending}
                loading={submitMutation.isPending}
                className="flex-1"
              >
                {ALAY_COPY.submitButton}
              </Button>
            </div>

            {/* Points Preview */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-yellow-500 text-[18px] fill-1">
                stars
              </span>
              <span className="text-sm text-muted">
                Earn{' '}
                <span className="font-bold text-primary">
                  +{ALAY_POINTS.STOCK_REPORT}
                </span>{' '}
                Alay Points
              </span>
            </div>
          </div>
        )}

        {currentStep === 'confirmation' && submitResult && (
          <ThankYouConfirmation
            pointsEarned={submitResult.pointsEarned}
            bonusPoints={submitResult.bonusPoints}
            currentStreak={submitResult.newStreak}
            todayCount={todayReportCount + 1}
            userLevel="Baguhan" // TODO: Get from user profile
            totalPoints={submitResult.pointsEarned} // TODO: Get from user profile
            wasQueued={submitResult.wasQueued}
            onClose={handleClose}
          />
        )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default ReportModal;
