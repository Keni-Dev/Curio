/**
 * Admin Moderation Types
 *
 * Types for the anti-abuse admin moderation interface.
 */

import type { StockStatusEnum, UserLevelEnum } from '@/types/database';

// =============================================================================
// ABUSE FLAG TYPES
// =============================================================================

export type AbuseFlagType =
  | 'rate_exceeded'
  | 'duplicate_report'
  | 'low_trust_reporter'
  | 'multiple_negative_votes'
  | 'suspicious_pattern'
  | 'location_spoofing'
  | 'rapid_conflicting_reports';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

// =============================================================================
// ABUSE FLAG
// =============================================================================

export interface AbuseFlag {
  id: string;
  userId: string | null;
  reportId: string | null;
  flagType: AbuseFlagType;
  severity: 1 | 2 | 3 | 4 | 5;
  details: Record<string, unknown>;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  createdAt: string;
}

// =============================================================================
// MODERATION QUEUE ITEM
// =============================================================================

export interface ModerationQueueItem {
  moderationId: string;
  moderationStatus: ModerationStatus;
  flagReason: string;
  flaggedAt: string;
  
  // Report details
  reportId: string;
  stockStatus: StockStatusEnum;
  reportCreatedAt: string;
  helpfulCount: number;
  notHelpfulCount: number;
  distanceFromPharmacy: number | null;
  
  // Pharmacy details
  pharmacyName: string;
  
  // Medicine details
  medicineName: string;
  brandName: string | null;
  
  // Reporter details
  reporterName: string | null;
  reporterTrust: number;
  reporterLevel: UserLevelEnum;
  reporterPoints: number;
  reporterPendingFlags: number;
}

// =============================================================================
// MODERATION ACTIONS
// =============================================================================

export interface ModerationAction {
  reportId: string;
  action: 'approve' | 'reject' | 'escalate';
  reason?: string;
  adjustTrustScore?: boolean;
  banUser?: boolean;
}

export interface ModerationResult {
  success: boolean;
  message: string;
  affectedReportId: string;
  newStatus: ModerationStatus;
}

// =============================================================================
// MODERATION STATS
// =============================================================================

export interface ModerationStats {
  pendingCount: number;
  resolvedToday: number;
  flaggedUsersCount: number;
  topFlagTypes: Array<{
    type: AbuseFlagType;
    count: number;
  }>;
}

// =============================================================================
// FLAG SEVERITY CONFIG
// =============================================================================

export const FLAG_SEVERITY_CONFIG: Record<
  1 | 2 | 3 | 4 | 5,
  { label: string; color: string; bgColor: string }
> = {
  1: { label: 'Info', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  2: { label: 'Low', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  3: { label: 'Medium', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  4: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  5: { label: 'Critical', color: 'text-rose-700', bgColor: 'bg-rose-50' },
};

// =============================================================================
// FLAG TYPE CONFIG
// =============================================================================

export const FLAG_TYPE_CONFIG: Record<
  AbuseFlagType,
  { label: string; description: string; icon: string }
> = {
  rate_exceeded: {
    label: 'Rate Limit Exceeded',
    description: 'User submitted reports too quickly',
    icon: 'speed',
  },
  duplicate_report: {
    label: 'Duplicate Report',
    description: 'Multiple reports for same medicine/pharmacy',
    icon: 'content_copy',
  },
  low_trust_reporter: {
    label: 'Low Trust Reporter',
    description: 'Report from user with low trust score',
    icon: 'person_alert',
  },
  multiple_negative_votes: {
    label: 'Negative Votes',
    description: 'Report received many "Not Helpful" votes',
    icon: 'thumb_down',
  },
  suspicious_pattern: {
    label: 'Suspicious Pattern',
    description: 'Unusual reporting behavior detected',
    icon: 'warning',
  },
  location_spoofing: {
    label: 'Location Spoofing',
    description: 'Report from very far distance',
    icon: 'wrong_location',
  },
  rapid_conflicting_reports: {
    label: 'Conflicting Reports',
    description: 'Rapidly changing stock status',
    icon: 'sync_problem',
  },
};
