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
} from '@/features/alay';
import { Spinner } from '@/components/ui';

// =============================================================================
// COMPONENT
// =============================================================================

export function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useAlayPoints();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard({ limit: 10 });

  // Mock badges for demo (would come from backend)
  const userBadges = [
    { ...ACHIEVEMENT_BADGES.firstReport, isEarned: true },
    { ...ACHIEVEMENT_BADGES.speedyScout, isEarned: true },
    { ...ACHIEVEMENT_BADGES.truthTeller, isEarned: true },
    { ...ACHIEVEMENT_BADGES.communityHeart, isEarned: true },
    { ...ACHIEVEMENT_BADGES.weekStreak, isEarned: false },
    { ...ACHIEVEMENT_BADGES.monthStreak, isEarned: false },
    { ...ACHIEVEMENT_BADGES.reporter100, isEarned: false },
    { ...ACHIEVEMENT_BADGES.bayanihanChampion, isEarned: false },
  ];

  // Mock activity for demo
  const recentActivity = [
    {
      id: '1',
      type: 'stock_report',
      title: 'Reported generic paracetamol stock',
      location: 'Mercury Drug, Quezon Ave',
      points: 20,
      timeAgo: '2h ago',
      icon: 'inventory_2',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      id: '2',
      type: 'verification',
      title: 'Verified stock availability',
      location: 'Watsons, SM North EDSA',
      points: 10,
      timeAgo: '5h ago',
      icon: 'check_circle',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500',
    },
    {
      id: '3',
      type: 'vote',
      title: 'Upvoted price accuracy',
      location: 'The Generics Pharmacy',
      points: 5,
      timeAgo: '1d ago',
      icon: 'thumbs_up_down',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-500',
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Earned "Truth Teller" Badge',
      location: 'Achievement Unlocked',
      points: 50,
      timeAgo: '2d ago',
      icon: 'military_tech',
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-500',
    },
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
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 text-text-primary dark:text-white group">
            <div className="size-8 text-primary group-hover:scale-110 transition-transform duration-300">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48">
                <path
                  clipRule="evenodd"
                  d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Curio</span>
          </a>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href="/" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
              Map
            </a>
            <a href="/profile" className="text-sm font-semibold text-primary">
              Dashboard
            </a>
          </nav>

          {/* Report button */}
          <button className="hidden sm:flex items-center justify-center h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all shadow-soft">
            Report Stock
          </button>
        </div>
      </header>

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
                    <div
                      className="h-full w-full rounded-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=curio-user)`,
                      }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white dark:border-surface-dark uppercase tracking-wider shadow-sm">
                  Level 5 Scout
                </div>
              </div>

              <h1 className="text-2xl font-bold text-text-primary dark:text-white mt-2">
                Juan Dela Cruz
              </h1>
              <p className="text-text-secondary text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Quezon City • Member since Jan 2023
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
                {recentActivity.map((activity, index) => (
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
                ))}
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
