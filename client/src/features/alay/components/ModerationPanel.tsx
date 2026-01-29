/**
 * ModerationPanel Component
 *
 * Admin interface for reviewing and moderating flagged reports.
 * Only accessible to Legend-level users.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { StockBadge } from '@/components/ui/Badge';
import {
  useModerationQueue,
  useModerationStats,
  useModerateReport,
  useIsAdmin,
} from '../hooks/useModeration';
import {
  FLAG_TYPE_CONFIG,
  type ModerationQueueItem,
} from '../types/moderation';

// =============================================================================
// MAIN PANEL
// =============================================================================

export function ModerationPanel() {
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: queue, isLoading: loadingQueue } = useModerationQueue();
  const { data: stats, isLoading: loadingStats } = useModerationStats();

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-rose-500 mb-4">
          lock
        </span>
        <h2 className="text-lg font-bold text-text-primary">Access Denied</h2>
        <p className="text-sm text-text-secondary mt-2">
          Only Legend-level users can access the moderation panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      {!loadingStats && stats && <ModerationStatsBar stats={stats} />}

      {/* Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">pending_actions</span>
          Moderation Queue
          {stats && stats.pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-sm">
              {stats.pendingCount}
            </span>
          )}
        </h2>

        {loadingQueue ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : queue && queue.length > 0 ? (
          <div className="space-y-3">
            {queue.map((item) => (
              <ModerationCard key={item.moderationId} item={item} />
            ))}
          </div>
        ) : (
          <EmptyQueue />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// STATS BAR
// =============================================================================

interface ModerationStatsBarProps {
  stats: {
    pendingCount: number;
    resolvedToday: number;
    flaggedUsersCount: number;
  };
}

function ModerationStatsBar({ stats }: ModerationStatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        icon="pending"
        label="Pending"
        value={stats.pendingCount}
        color="amber"
      />
      <StatCard
        icon="check_circle"
        label="Resolved Today"
        value={stats.resolvedToday}
        color="emerald"
      />
      <StatCard
        icon="person_alert"
        label="Flagged Users"
        value={stats.flaggedUsersCount}
        color="rose"
      />
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: 'amber' | 'emerald' | 'rose';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors = {
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <div className={cn('rounded-xl border p-4', colors[color])}>
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <span className="text-xs uppercase tracking-wide opacity-75">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

// =============================================================================
// MODERATION CARD
// =============================================================================

interface ModerationCardProps {
  item: ModerationQueueItem;
}

function ModerationCard({ item }: ModerationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const moderateMutation = useModerateReport();

  const flagConfig = FLAG_TYPE_CONFIG[item.flagReason as keyof typeof FLAG_TYPE_CONFIG];
  const voteRatio =
    item.helpfulCount + item.notHelpfulCount > 0
      ? item.helpfulCount / (item.helpfulCount + item.notHelpfulCount)
      : 0.5;

  const handleApprove = () => {
    moderateMutation.mutate({
      reportId: item.reportId,
      action: 'approve',
    });
  };

  const handleReject = (adjustTrust: boolean) => {
    moderateMutation.mutate({
      reportId: item.reportId,
      action: 'reject',
      adjustTrustScore: adjustTrust,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Flag Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600">
              {flagConfig?.icon || 'flag'}
            </span>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-text-primary">
                {item.medicineName}
              </span>
              <StockBadge status={item.stockStatus} />
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {item.pharmacyName}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">person</span>
                {item.reporterName || 'Anonymous'}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  verified
                </span>
                Trust: {Math.round(item.reporterTrust * 100)}%
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                {new Date(item.flaggedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Expand Icon */}
          <span
            className={cn(
              'material-symbols-outlined text-slate-400 transition-transform',
              expanded && 'rotate-180'
            )}
          >
            expand_more
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50">
          {/* Flag Reason */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">
              Flag Reason:
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-sm">
              {flagConfig?.label || item.flagReason}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3">
              <div className="text-text-secondary">Vote Ratio</div>
              <div className="font-semibold flex items-center gap-2">
                <span
                  className={
                    voteRatio >= 0.5 ? 'text-emerald-600' : 'text-rose-600'
                  }
                >
                  {Math.round(voteRatio * 100)}% helpful
                </span>
                <span className="text-text-tertiary text-xs">
                  ({item.helpfulCount}↑ / {item.notHelpfulCount}↓)
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-text-secondary">Distance</div>
              <div className="font-semibold">
                {item.distanceFromPharmacy
                  ? `${Math.round(item.distanceFromPharmacy)}m`
                  : 'Unknown'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-text-secondary">Reporter Level</div>
              <div className="font-semibold">{item.reporterLevel}</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-text-secondary">Pending Flags</div>
              <div
                className={cn(
                  'font-semibold',
                  item.reporterPendingFlags > 2 && 'text-rose-600'
                )}
              >
                {item.reporterPendingFlags}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              loading={moderateMutation.isPending}
              className="flex-1"
            >
              <span className="material-symbols-outlined text-lg">
                check_circle
              </span>
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReject(false)}
              loading={moderateMutation.isPending}
              className="flex-1"
            >
              <span className="material-symbols-outlined text-lg">cancel</span>
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReject(true)}
              loading={moderateMutation.isPending}
              className="text-rose-600"
            >
              <span className="material-symbols-outlined text-lg">
                person_remove
              </span>
              Reject + Penalize
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyQueue() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-emerald-600 text-3xl">
          verified
        </span>
      </div>
      <h3 className="text-lg font-bold text-text-primary">
        Walang pending na moderation
      </h3>
      <p className="text-sm text-text-secondary mt-2">
        Lahat ng reports ay na-review na. Great job!
      </p>
    </div>
  );
}
