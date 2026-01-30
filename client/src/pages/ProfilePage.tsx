/**
 * ProfilePage
 *
 * User profile and Alay Dashboard showing points, achievements,
 * activity history, and leaderboard position.
 *
 * @see references/user_profile_&_alay_dashboard/code.html
 */

import { cn } from '@/lib/utils';
import {
  useAlayPoints,
  ProfileStatsCard,
  Leaderboard,
  AchievementBadgeList,
  ACHIEVEMENT_BADGES,
  useLeaderboard,
  useUserActivity,
} from '@/features/alay';
import { Spinner, AccessibilityMenu } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import NavHeader from '@/components/layout/NavHeader';

// =============================================================================
// COMPONENT
// =============================================================================

export function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useAlayPoints();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard({ limit: 10 });
  const { data: recentActivity = [], isLoading: activityLoading } = useUserActivity({ limit: 10 });
  const authUser = useAuthStore((state) => state.user);
  const authProfile = useAuthStore((state) => state.profile);

  // Calculate badges based on actual user stats
  const contributionCount = profile?.contributionCount ?? 0;
  const streakDays = profile?.streakDays ?? 0;
  const helpfulVotes = profile?.helpfulVotes ?? 0;

  const userBadges = [
    { ...ACHIEVEMENT_BADGES.firstReport, isEarned: contributionCount >= 1 },
    { ...ACHIEVEMENT_BADGES.speedyScout, isEarned: contributionCount >= 5 },
    { ...ACHIEVEMENT_BADGES.truthTeller, isEarned: helpfulVotes >= 10 },
    { ...ACHIEVEMENT_BADGES.communityHeart, isEarned: helpfulVotes >= 50 },
    { ...ACHIEVEMENT_BADGES.weekStreak, isEarned: streakDays >= 7 },
    { ...ACHIEVEMENT_BADGES.monthStreak, isEarned: streakDays >= 30 },
    { ...ACHIEVEMENT_BADGES.reporter100, isEarned: contributionCount >= 100 },
    { ...ACHIEVEMENT_BADGES.bayanihanChampion, isEarned: contributionCount >= 500 && helpfulVotes >= 100 },
  ];

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  // Use mock data if no profile (for demo purposes)
  const displayProfile = profile || {
    alayPoints: 320,
    streakDays: 12,
    contributionCount: 45,
    level: 'Scout' as const,
    helpfulVotes: 128,
    rankPercentile: 'Top 5%',
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Navbar */}
      <NavHeader variant="glass" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile & Stats */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Hero Profile Card */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-card flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-transparent" />

              {/* Avatar */}
              <div className="relative mb-4">
                <div className="h-32 w-32 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-amber-500 shadow-glow">
                  <div className="h-full w-full rounded-full bg-white dark:bg-surface-dark p-1">
                    {authProfile?.avatarUrl || authUser?.user_metadata?.avatar_url ? (
                      <img
                        src={authProfile?.avatarUrl || authUser?.user_metadata?.avatar_url}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.id || 'curio-user'})`,
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white dark:border-surface-dark uppercase tracking-wider shadow-sm">
                  {displayProfile.level}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-text-primary dark:text-white mt-2">
                {authProfile?.displayName || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-text-secondary text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">email</span>
                {authUser?.email || 'No email'}
              </p>

              {/* Tags */}
              <div className="w-full mt-6 flex justify-center">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-text-secondary">
                    Community Helper
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <ProfileStatsCard
              points={displayProfile.alayPoints}
              level={displayProfile.level}
              streakDays={displayProfile.streakDays}
              contributionCount={displayProfile.contributionCount}
              helpfulVotes={displayProfile.helpfulVotes}
              rank={displayProfile.rankPercentile || undefined}
            />

            {/* Accessibility Settings - Easy access for seniors */}
            <AccessibilityMenu className="shadow-card" />
          </div>

          {/* Right Column: Achievements & Activity */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Achievements Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">military_tech</span>
                  Achievements
                </h2>
                <button className="text-primary hover:text-primary-dark text-sm font-medium">
                  View All
                </button>
              </div>

              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-card">
                <AchievementBadgeList
                  badges={userBadges}
                  size="md"
                  showLocked
                />
              </div>
            </section>

            {/* Activity Feed Section */}
            <section className="flex-1">
              <h2 className="text-xl font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Recent Activity
              </h2>

              <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-card overflow-hidden">
                {activityLoading ? (
                  <div className="p-8 flex justify-center">
                    <Spinner size="md" />
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={cn(
                        'group flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
                        index !== recentActivity.length - 1 && 'border-b border-slate-100 dark:border-slate-800'
                      )}
                    >
                      <div
                        className={cn(
                          'size-12 rounded-xl flex items-center justify-center transition-colors',
                          activity.iconBg,
                          activity.iconColor,
                          'group-hover:bg-primary group-hover:text-white'
                        )}
                      >
                        <span className="material-symbols-outlined">{activity.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-text-primary dark:text-white truncate">
                          {activity.title}
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">{activity.location}</p>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold font-mono">
                          +{activity.points} pts
                        </span>
                        <p className="text-xs text-text-muted mt-1">{activity.timeAgo}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-slate-400">volunteer_activism</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-1">
                      No activity yet
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Start contributing to help your community find medicine!
                    </p>
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Report Stock
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Leaderboard Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">leaderboard</span>
                  Top Contributors
                </h2>
                <button className="text-primary hover:text-primary-dark text-sm font-medium">
                  View Full Leaderboard
                </button>
              </div>

              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-card">
                <Leaderboard
                  entries={leaderboard || []}
                  showPodium={false}
                  maxEntries={5}
                  isLoading={leaderboardLoading}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
