/**
 * AchievementBadge Component
 *
 * Hexagonal badge display for user achievements.
 * Supports earned and locked states with hover animations.
 *
 * @see references/user_profile_&_alay_dashboard/code.html
 */

import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementBadgeProps {
  /** Badge data */
  badge: {
    id: string;
    name: string;
    description?: string;
    icon: string;
    rarity: BadgeRarity;
  };
  /** Whether the badge is earned */
  isEarned?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const rarityConfig: Record<BadgeRarity, {
  hexColor: string;
  iconColor: string;
  glowClass: string;
  label: string;
}> = {
  common: {
    hexColor: 'text-slate-400',
    iconColor: 'text-white',
    glowClass: '',
    label: 'Common',
  },
  rare: {
    hexColor: 'text-blue-500',
    iconColor: 'text-white',
    glowClass: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    label: 'Rare',
  },
  epic: {
    hexColor: 'text-purple-500',
    iconColor: 'text-white',
    glowClass: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    label: 'Epic',
  },
  legendary: {
    hexColor: 'text-amber-500',
    iconColor: 'text-white',
    glowClass: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    label: 'Legendary',
  },
};

const sizeClasses = {
  sm: {
    container: 'w-14 h-14',
    svg: 'w-14 h-14',
    icon: 'text-xl',
    label: 'text-[10px]',
  },
  md: {
    container: 'w-20 h-20',
    svg: 'w-20 h-20',
    icon: 'text-3xl',
    label: 'text-xs',
  },
  lg: {
    container: 'w-28 h-28',
    svg: 'w-28 h-28',
    icon: 'text-4xl',
    label: 'text-sm',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function AchievementBadge({
  badge,
  isEarned = true,
  size = 'md',
  showTooltip = false,
  onClick,
  className,
}: AchievementBadgeProps) {
  const config = rarityConfig[badge.rarity];
  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 group',
        onClick && 'cursor-pointer',
        !isEarned && 'opacity-40 grayscale hover:grayscale-0 hover:opacity-70',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={showTooltip ? `${badge.name}${badge.description ? ` - ${badge.description}` : ''}` : undefined}
    >
      {/* Hexagon Badge */}
      <div
        className={cn(
          'relative flex items-center justify-center',
          classes.container
        )}
      >
        {/* Hexagon SVG */}
        <svg
          className={cn(
            'fill-current transition-all duration-300',
            classes.svg,
            isEarned ? config.hexColor : 'text-slate-300 dark:text-slate-600',
            isEarned && config.glowClass,
            'group-hover:scale-110'
          )}
          viewBox="0 0 100 100"
        >
          <polygon points="50 1 95 25 95 75 50 99 5 75 5 25" />
        </svg>

        {/* Icon */}
        <span
          className={cn(
            'material-symbols-outlined absolute',
            classes.icon,
            isEarned ? config.iconColor : 'text-slate-500 dark:text-slate-400'
          )}
        >
          {isEarned ? badge.icon : 'lock'}
        </span>

        {/* Legendary sparkle effect */}
        {isEarned && badge.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-yellow-300 animate-pulse">
              ✦
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-yellow-300 animate-pulse delay-500">
              ✦
            </div>
          </div>
        )}
      </div>

      {/* Badge Name */}
      <span
        className={cn(
          'font-bold text-center text-text-primary dark:text-white leading-tight',
          classes.label
        )}
      >
        {badge.name}
      </span>
    </div>
  );
}

// =============================================================================
// BADGE LIST
// =============================================================================

interface AchievementBadgeListProps {
  badges: Array<{
    id: string;
    name: string;
    description?: string;
    icon: string;
    rarity: BadgeRarity;
    isEarned: boolean;
  }>;
  size?: 'sm' | 'md' | 'lg';
  showLocked?: boolean;
  onBadgeClick?: (badgeId: string) => void;
  className?: string;
}

export function AchievementBadgeList({
  badges,
  size = 'md',
  showLocked = true,
  onBadgeClick,
  className,
}: AchievementBadgeListProps) {
  const displayBadges = showLocked ? badges : badges.filter((b) => b.isEarned);

  return (
    <div className={cn('grid grid-cols-3 sm:grid-cols-4 gap-4', className)}>
      {displayBadges.map((badge) => (
        <AchievementBadge
          key={badge.id}
          badge={badge}
          isEarned={badge.isEarned}
          size={size}
          onClick={onBadgeClick ? () => onBadgeClick(badge.id) : undefined}
        />
      ))}
    </div>
  );
}

// =============================================================================
// PREDEFINED BADGES
// =============================================================================

export const ACHIEVEMENT_BADGES = {
  // Common badges
  firstReport: {
    id: 'first-report',
    name: 'First Steps',
    description: 'Submit your first stock report',
    icon: 'flag',
    rarity: 'common' as BadgeRarity,
  },
  verified10: {
    id: 'verified-10',
    name: 'Truth Seeker',
    description: 'Have 10 reports verified by others',
    icon: 'verified',
    rarity: 'common' as BadgeRarity,
  },

  // Rare badges
  speedyScout: {
    id: 'speedy-scout',
    name: 'Speedy Scout',
    description: 'Report stock within 5 minutes of pharmacy opening',
    icon: 'bolt',
    rarity: 'rare' as BadgeRarity,
  },
  weekStreak: {
    id: 'week-streak',
    name: '7-Day Streak',
    description: 'Maintain a 7-day contribution streak',
    icon: 'local_fire_department',
    rarity: 'rare' as BadgeRarity,
  },
  truthTeller: {
    id: 'truth-teller',
    name: 'Truth Teller',
    description: '50 verified accurate reports',
    icon: 'verified',
    rarity: 'rare' as BadgeRarity,
  },

  // Epic badges
  communityHeart: {
    id: 'community-heart',
    name: 'Community Heart',
    description: 'Help 100 users find medicine',
    icon: 'favorite',
    rarity: 'epic' as BadgeRarity,
  },
  monthStreak: {
    id: 'month-streak',
    name: '30-Day Warrior',
    description: 'Maintain a 30-day contribution streak',
    icon: 'military_tech',
    rarity: 'epic' as BadgeRarity,
  },
  reporter100: {
    id: 'reporter-100',
    name: 'Century Reporter',
    description: 'Submit 100 stock reports',
    icon: 'edit_note',
    rarity: 'epic' as BadgeRarity,
  },

  // Legendary badges
  bayanihanChampion: {
    id: 'bayanihan-champion',
    name: 'Bayanihan Champion',
    description: 'Reach Legend level with 2000+ points',
    icon: 'stars',
    rarity: 'legendary' as BadgeRarity,
  },
  pharmacyExpert: {
    id: 'pharmacy-expert',
    name: 'Pharmacy Expert',
    description: 'Contribute to 50 different pharmacies',
    icon: 'local_pharmacy',
    rarity: 'legendary' as BadgeRarity,
  },
} as const;

export default AchievementBadge;
