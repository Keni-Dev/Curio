/**
 * useUserActivity Hook
 *
 * TanStack Query hook for fetching user's recent activity history
 * from inventory reports.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface UserActivity {
  id: string;
  type: 'stock_report';
  title: string;
  location: string;
  points: number;
  timeAgo: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  createdAt: string;
}

interface InventoryReport {
  id: string;
  status: string;
  created_at: string;
  pharmacy: {
    name: string;
  } | null;
  medicine: {
    brand_name: string | null;
    generic_name: string;
  } | null;
}

// =============================================================================
// HELPERS
// =============================================================================

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function getPointsForReport(status: string): number {
  // Points based on stock status
  switch (status) {
    case 'in_stock':
      return 15;
    case 'low_stock':
      return 10;
    case 'out_of_stock':
      return 5;
    default:
      return 5;
  }
}

function mapReportToActivity(report: InventoryReport): UserActivity {
  const medicineName = report.medicine?.brand_name || report.medicine?.generic_name || 'Unknown Medicine';
  const pharmacyName = report.pharmacy?.name || 'Unknown Pharmacy';
  
  // Determine icon and colors based on status
  let icon = 'inventory_2';
  let iconBg = 'bg-emerald-100 dark:bg-emerald-900/30';
  let iconColor = 'text-emerald-600 dark:text-emerald-400';
  
  switch (report.status) {
    case 'in_stock':
      icon = 'check_circle';
      iconBg = 'bg-emerald-100 dark:bg-emerald-900/30';
      iconColor = 'text-emerald-600 dark:text-emerald-400';
      break;
    case 'low_stock':
      icon = 'warning';
      iconBg = 'bg-amber-100 dark:bg-amber-900/30';
      iconColor = 'text-amber-600 dark:text-amber-400';
      break;
    case 'out_of_stock':
      icon = 'cancel';
      iconBg = 'bg-red-100 dark:bg-red-900/30';
      iconColor = 'text-red-600 dark:text-red-400';
      break;
  }

  return {
    id: report.id,
    type: 'stock_report',
    title: `Reported ${medicineName}`,
    location: pharmacyName,
    points: getPointsForReport(report.status),
    timeAgo: getTimeAgo(report.created_at),
    icon,
    iconBg,
    iconColor,
    createdAt: report.created_at,
  };
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const userActivityKeys = {
  all: ['user-activity'] as const,
  list: (userId: string, limit?: number) => [...userActivityKeys.all, 'list', userId, limit] as const,
};

// =============================================================================
// FETCH FUNCTION
// =============================================================================

async function fetchUserActivity(limit: number = 10): Promise<UserActivity[]> {
  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // Fetch user's inventory reports with pharmacy and medicine details
  const { data: reports, error } = await supabase
    .from('inventory_reports')
    .select(
      `
      id,
      status,
      created_at,
      pharmacy:pharmacy_id (
        name
      ),
      medicine:medicine_id (
        brand_name,
        generic_name
      )
    `
    )
    .eq('reported_by', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }

  if (!reports || reports.length === 0) {
    return [];
  }

  // Map reports to activity items
  return reports.map(mapReportToActivity);
}

// =============================================================================
// HOOK
// =============================================================================

interface UseUserActivityOptions {
  /** Number of activity items to fetch */
  limit?: number;
  /** Enable/disable the query */
  enabled?: boolean;
}

export function useUserActivity(options: UseUserActivityOptions = {}) {
  const { limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: userActivityKeys.list('current', limit),
    queryFn: () => fetchUserActivity(limit),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export default useUserActivity;
