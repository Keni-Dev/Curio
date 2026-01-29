/**
 * useVoteHelpful Hook
 *
 * TanStack Query mutation hook for voting on stock reports.
 * Handles both authenticated and anonymous voting via device fingerprint.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useVotedStore, useHasVoted } from '@/stores/useVotedStore';
import { pharmacyKeys } from '@/features/pharmacy/hooks/useNearbyPharmacies';

// =============================================================================
// TYPES
// =============================================================================

interface VoteParams {
  reportId: string;
  isHelpful: boolean;
  pharmacyId: string;
}

interface VoteResult {
  success: boolean;
  newHelpfulCount: number;
  newNotHelpfulCount: number;
}

interface UseVoteHelpfulOptions {
  onSuccess?: (result: VoteResult) => void;
  onError?: (error: Error) => void;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for voting on stock report helpfulness.
 *
 * @example
 * ```tsx
 * const { vote, isVoting } = useVoteHelpful({
 *   onSuccess: () => showToast('Salamat sa feedback!'),
 * });
 *
 * const handleVote = () => {
 *   vote({ reportId: 'xxx', isHelpful: true, pharmacyId: 'yyy' });
 * };
 * ```
 */
export function useVoteHelpful(options: UseVoteHelpfulOptions = {}) {
  const queryClient = useQueryClient();
  const addVote = useVotedStore((state) => state.addVote);

  const mutation = useMutation({
    mutationFn: async ({ reportId, isHelpful }: VoteParams): Promise<VoteResult> => {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Authenticated vote - insert into helpful_votes table
        const { error: insertError } = await supabase
          .from('helpful_votes')
          .upsert(
            {
              report_id: reportId,
              user_id: user.id,
              is_helpful: isHelpful,
            },
            {
              onConflict: 'report_id,user_id',
            }
          );

        if (insertError) {
          throw new Error(`Failed to submit vote: ${insertError.message}`);
        }
      } else {
        // Anonymous vote - direct update with optimistic increment
        // Note: In production, use RPC function for atomic updates
        const { data: currentReport, error: fetchError } = await supabase
          .from('inventory_reports')
          .select('helpful_count, not_helpful_count')
          .eq('id', reportId)
          .single();

        if (fetchError) {
          throw new Error(`Failed to fetch report: ${fetchError.message}`);
        }

        const updateData = isHelpful
          ? { helpful_count: (currentReport?.helpful_count ?? 0) + 1 }
          : { not_helpful_count: (currentReport?.not_helpful_count ?? 0) + 1 };

        const { error: updateError } = await supabase
          .from('inventory_reports')
          .update(updateData)
          .eq('id', reportId);

        if (updateError) {
          throw new Error(`Failed to update vote count: ${updateError.message}`);
        }
      }

      // Fetch updated counts
      const { data: updatedReport, error: finalFetchError } = await supabase
        .from('inventory_reports')
        .select('helpful_count, not_helpful_count')
        .eq('id', reportId)
        .single();

      if (finalFetchError) {
        throw new Error(`Failed to fetch updated counts: ${finalFetchError.message}`);
      }

      return {
        success: true,
        newHelpfulCount: updatedReport?.helpful_count ?? 0,
        newNotHelpfulCount: updatedReport?.not_helpful_count ?? 0,
      };
    },

    onSuccess: (result, variables) => {
      // Record vote in local store (prevents duplicate votes from same device)
      addVote(variables.reportId, variables.isHelpful);

      // Invalidate pharmacy stock query to refetch
      queryClient.invalidateQueries({
        queryKey: pharmacyKeys.stock(variables.pharmacyId),
      });

      // Call user's success callback
      options.onSuccess?.(result);
    },

    onError: (error: Error) => {
      console.error('Vote error:', error);
      options.onError?.(error);
    },
  });

  return {
    vote: mutation.mutate,
    voteAsync: mutation.mutateAsync,
    isVoting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook to check if user can vote on a report.
 * Returns false if already voted.
 */
export function useCanVote(reportId: string): boolean {
  const hasVoted = useHasVoted(reportId);
  return !hasVoted;
}

export default useVoteHelpful;
