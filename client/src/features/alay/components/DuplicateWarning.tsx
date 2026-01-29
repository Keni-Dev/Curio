/**
 * DuplicateWarning Component
 *
 * Shown when user tries to report the same medicine at the same pharmacy
 * within 24 hours. Offers option to update existing report instead.
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { StockBadge } from '@/components/ui/Badge';
import { formatTimeAgo, type ExistingReport } from '../hooks/useDuplicateCheck';

// =============================================================================
// TYPES
// =============================================================================

interface DuplicateWarningProps {
  /** The existing report data */
  existingReport: ExistingReport;
  /** Whether the existing report is still valid */
  isStillValid: boolean;
  /** Called when user wants to update the existing report */
  onUpdateExisting?: () => void;
  /** Called when user wants to submit anyway (creates new report) */
  onSubmitAnyway?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DuplicateWarning({
  existingReport,
  isStillValid,
  onUpdateExisting,
  onSubmitAnyway,
  className,
}: DuplicateWarningProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-4',
        isStillValid
          ? 'bg-amber-50 border-amber-200'
          : 'bg-slate-50 border-slate-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            isStillValid ? 'bg-amber-100' : 'bg-slate-200'
          )}
        >
          <span
            className={cn(
              'material-symbols-outlined text-xl',
              isStillValid ? 'text-amber-600' : 'text-slate-500'
            )}
          >
            {isStillValid ? 'info' : 'history'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-semibold',
              isStillValid ? 'text-amber-800' : 'text-slate-700'
            )}
          >
            {isStillValid
              ? 'May nag-report ka na dito kamakailan'
              : 'Nakapag-report ka na dito kanina'}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {formatTimeAgo(existingReport.hoursAgo)}
          </p>
        </div>
      </div>

      {/* Existing Report Details */}
      <div className="bg-white/60 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm text-text-secondary">Iyong dating report:</span>
        <StockBadge status={existingReport.status} />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {isStillValid ? (
          <>
            <Button variant="primary" fullWidth onClick={onUpdateExisting}>
              <span className="material-symbols-outlined text-lg">edit</span>
              I-update ang aking report
            </Button>
            <Button variant="ghost" fullWidth onClick={onSubmitAnyway}>
              <span className="text-sm">Mag-submit ng bagong report anyway</span>
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" fullWidth onClick={onSubmitAnyway}>
              <span className="material-symbols-outlined text-lg">add</span>
              Mag-submit ng bagong report
            </Button>
            <p className="text-xs text-center text-text-tertiary">
              Ang dating report mo ay expired na. Okay lang mag-submit ng bago.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// INLINE DUPLICATE NOTICE
// =============================================================================

interface DuplicateNoticeProps {
  /** The existing report data */
  existingReport: ExistingReport;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Compact inline notice for duplicate detection
 */
export function DuplicateNotice({
  existingReport,
  className,
}: DuplicateNoticeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm',
        className
      )}
    >
      <span className="material-symbols-outlined text-amber-600 text-lg">
        info
      </span>
      <span className="text-amber-800">
        Nakapag-report ka na dito {formatTimeAgo(existingReport.hoursAgo)}
      </span>
    </div>
  );
}

// =============================================================================
// UPDATE REPORT MODAL CONTENT
// =============================================================================

interface UpdateReportPromptProps {
  /** The existing report data */
  existingReport: ExistingReport;
  /** Medicine name for display */
  medicineName: string;
  /** Called when user confirms update */
  onConfirmUpdate: () => void;
  /** Called when user cancels */
  onCancel: () => void;
}

/**
 * Content for a modal prompting user to update their report
 */
export function UpdateReportPrompt({
  existingReport,
  medicineName,
  onConfirmUpdate,
  onCancel,
}: UpdateReportPromptProps) {
  return (
    <div className="space-y-4 p-2">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">
            edit_note
          </span>
        </div>
        <h3 className="text-lg font-bold text-text-primary">
          I-update ang iyong report?
        </h3>
        <p className="text-sm text-text-secondary mt-2">
          May existing report ka para sa <strong>{medicineName}</strong>{' '}
          {formatTimeAgo(existingReport.hoursAgo)}.
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm text-text-secondary">Current status:</span>
        <StockBadge status={existingReport.status} />
      </div>

      {/* Helper Text */}
      <p className="text-xs text-center text-text-tertiary">
        Pag nag-update ka, mare-refresh ang expiry time ng report (4 hours).
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" fullWidth onClick={onConfirmUpdate}>
          I-update
        </Button>
      </div>
    </div>
  );
}
