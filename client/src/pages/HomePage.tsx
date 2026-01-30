/**
 * HomePage Component
 *
 * Dashboard-style home screen prioritizing three main features:
 * 1. Medicine Search - Hero section with prominent search bar
 * 2. Reseta Reader (OCR Scanner) - Quick access card
 * 3. Medi-Bot AI Assistant - Quick access card
 *
 * Design: Mobile-first with bold typography, glass morphism,
 * and coral accent highlights per design system.
 */

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '~lib/utils';
import { useAuthStore } from '~stores/useAuthStore';
import { useSearchStore, selectRecentSearches } from '~stores/useSearchStore';
import { useNearbyPharmacies, PharmacyCard } from '~features/pharmacy';
import { Spinner } from '~components/ui';
import { MAP_CONFIG } from '~lib/constants';
import NavHeader from '~components/layout/NavHeader';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Filipino greetings that rotate randomly
 */
const GREETINGS = [
  'Mabuhay',
  'Kumusta',
  'Magandang araw',
  'Maligayang pagdating',
  'Masayang araw',
  'Tuloy ka',
] as const;

/**
 * Get a random greeting from the list
 */
function getRandomGreeting(): string {
  const index = Math.floor(Math.random() * GREETINGS.length);
  return GREETINGS[index] ?? 'Mabuhay';
}

// =============================================================================
// HERO SECTION WITH SEARCH
// =============================================================================

interface HeroSearchProps {
  userName?: string;
  onSearch: (query: string) => void;
}

const HeroSearch: React.FC<HeroSearchProps> = ({ userName, onSearch }) => {
  const greeting = useMemo(() => getRandomGreeting(), []);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <section className="text-center pt-8 pb-6 px-4">
      {/* Personalized Greeting */}
      {userName && (
        <p className="text-sm font-medium text-primary mb-2 animate-fade-in">
          {greeting}, {userName}! 👋
        </p>
      )}

      {/* Hero Tagline */}
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 dark:text-slate-100 mb-3 leading-tight">
        Find the Cure,{' '}
        <span className="italic text-primary">Faster</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Real-time crowdsourced medicine tracking.
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3',
            'bg-white dark:bg-surface-dark rounded-full',
            'border border-slate-200 dark:border-slate-700',
            'shadow-lg shadow-slate-900/5 dark:shadow-black/20',
            'focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary',
            'transition-all duration-200'
          )}
        >
          {/* Search Icon */}
          <span className="material-symbols-outlined text-xl text-slate-400">
            search
          </span>

          {/* Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for medicine (e.g. Biogesic)"
            className={cn(
              'flex-1 bg-transparent border-none outline-none',
              'text-base text-slate-700 dark:text-slate-200',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:ring-0 focus:border-none focus:outline-none'
            )}
          />

          {/* Search Button - Coral Accent */}
          <button
            type="submit"
            className={cn(
              'size-10 rounded-full flex items-center justify-center shrink-0',
              'bg-accent hover:bg-accent/90 text-white',
              'transition-all duration-200',
              'active:scale-95 hover:shadow-lg hover:shadow-accent/25'
            )}
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_forward
            </span>
          </button>
        </div>
      </form>
    </section>
  );
};

// =============================================================================
// FEATURE CARD COMPONENT (Side-by-Side Layout)
// =============================================================================

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  to: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  to,
  iconBgClass = 'bg-primary/10',
  iconColorClass = 'text-primary',
}) => (
  <Link
    to={to}
    className={cn(
      'flex flex-col items-start p-4',
      'bg-white dark:bg-surface-dark rounded-2xl',
      'border border-slate-100 dark:border-slate-800',
      'shadow-md shadow-slate-900/5 dark:shadow-black/20',
      'transition-all duration-200',
      'hover:shadow-lg hover:-translate-y-0.5',
      'active:scale-[0.98]',
      'min-h-[140px]'
    )}
  >
    {/* Icon */}
    <div
      className={cn(
        'size-12 rounded-xl flex items-center justify-center mb-3',
        iconBgClass
      )}
    >
      <span className={cn('material-symbols-outlined text-2xl', iconColorClass)}>
        {icon}
      </span>
    </div>

    {/* Title */}
    <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 mb-1">
      {title}
    </h3>

    {/* Description */}
    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
      {description}
    </p>
  </Link>
);

// =============================================================================
// QUICK ACTIONS SECTION
// =============================================================================

const QuickActionsSection: React.FC = () => (
  <section className="px-4 mb-8">
    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
      {/* Scan Prescription */}
      <FeatureCard
        icon="document_scanner"
        title="Scan Prescription"
        description="Convert your reseta to digital tracker"
        to="/scanner"
        iconBgClass="bg-accent/10"
        iconColorClass="text-accent"
      />

      {/* Ask Medi-Bot */}
      <FeatureCard
        icon="smart_toy"
        title="Ask Medi-Bot"
        description="Instant answers about your medication"
        to="/chat"
        iconBgClass="bg-primary/10"
        iconColorClass="text-primary"
      />
    </div>
  </section>
);

// =============================================================================
// VIEW MAP CTA
// =============================================================================

const ViewMapCTA: React.FC = () => (
  <section className="px-4 mb-8">
    <Link
      to="/map"
      className={cn(
        'flex items-center justify-between p-4',
        'bg-gradient-to-r from-primary to-primary/80 rounded-2xl',
        'shadow-lg shadow-primary/20',
        'transition-all duration-200',
        'hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5',
        'active:scale-[0.98]',
        'max-w-lg mx-auto'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl text-white">
            map
          </span>
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-white">
            View Pharmacy Map
          </h3>
          <p className="text-xs text-white/80">
            Find nearby pharmacies with stock info
          </p>
        </div>
      </div>
      <span className="material-symbols-outlined text-xl text-white/80">
        arrow_forward
      </span>
    </Link>
  </section>
);

// =============================================================================
// RECENT SEARCHES SECTION
// =============================================================================

interface RecentSearchesSectionProps {
  onSearchSelect: (query: string) => void;
}

const RecentSearchesSection: React.FC<RecentSearchesSectionProps> = ({
  onSearchSelect,
}) => {
  const recentSearches = useSearchStore(selectRecentSearches);
  const clearRecentSearches = useSearchStore((s) => s.clearRecentSearches);

  if (recentSearches.length === 0) {
    return null;
  }

  // Show only last 5 searches
  const displayedSearches = recentSearches.slice(0, 5);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-base text-slate-700 dark:text-slate-200">
          Mga Kamakailan na Hinanap
        </h2>
        <button
          onClick={clearRecentSearches}
          className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
        >
          I-clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {displayedSearches.map((search) => (
          <button
            key={search.id}
            onClick={() => onSearchSelect(search.query)}
            className={cn(
              'flex items-center gap-2 px-3 py-2',
              'bg-white/60 dark:bg-surface-dark/60 rounded-full',
              'border border-white/20 dark:border-white/10',
              'text-sm font-medium text-slate-600 dark:text-slate-300',
              'hover:bg-white dark:hover:bg-surface-dark',
              'transition-all active:scale-95'
            )}
          >
            <span className="material-symbols-outlined text-base text-slate-400">
              schedule
            </span>
            {search.query}
          </button>
        ))}
      </div>
    </section>
  );
};

// =============================================================================
// NEARBY PHARMACIES PREVIEW
// =============================================================================

const NearbyPharmaciesPreview: React.FC = () => {
  // Fetch nearby pharmacies with default center
  const { pharmacies, isLoading, isError, error, refetch, isFetching } = useNearbyPharmacies({
    center: MAP_CONFIG.DEFAULT_CENTER,
    radiusMeters: 5000, // 5km radius
  });

  // Show only top 3 pharmacies
  const previewPharmacies = useMemo(() => {
    return pharmacies
      .filter((p) => p.stockStatus === 'in_stock' || p.stockStatus === 'low_stock')
      .slice(0, 3);
  }, [pharmacies]);

  // Handle retry
  const handleRetry = () => {
    refetch();
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-base text-slate-700 dark:text-slate-200">
          Mga Botika Malapit Sa'yo
        </h2>
        <Link
          to="/map"
          className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          Tingnan lahat
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      {isLoading || isFetching ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : isError ? (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-rose-400 mb-2 block">
            error
          </span>
          <p className="text-sm text-slate-500 mb-2">Hindi ma-load ang mga botika</p>
          <p className="text-xs text-slate-400 mb-3">
            {error?.message || 'May problema sa connection'}
          </p>
          <button
            onClick={handleRetry}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 mx-auto"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Subukan ulit
          </button>
        </div>
      ) : previewPharmacies.length === 0 ? (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-slate-300 mb-2 block">
            local_pharmacy
          </span>
          <p className="text-sm text-slate-500">Walang nakitang botika malapit</p>
        </div>
      ) : (
        <div className="space-y-3">
          {previewPharmacies.map((pharmacy) => (
            <PharmacyCard
              key={pharmacy.id}
              pharmacy={pharmacy}
              showDistance={true}
              compact={true}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// =============================================================================
// HOMEPAGE COMPONENT
// =============================================================================

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Auth state for personalized greeting
  const profile = useAuthStore((s) => s.profile);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  // Refresh profile when auth is initialized but profile is missing (e.g., after login redirect)
  React.useEffect(() => {
    if (isInitialized && isAuthenticated && !profile) {
      refreshProfile();
    }
  }, [isInitialized, isAuthenticated, profile, refreshProfile]);

  // Get display name (first name only if full name)
  const displayName = profile?.displayName 
    ? profile.displayName.split(' ')[0] 
    : undefined;

  // Handle search query submission
  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Handle recent search click
  const handleRecentSearchSelect = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-background-dark dark:to-slate-900">
      {/* Top Navigation Header - Solid variant for home */}
      <NavHeader variant="solid" />

      {/* Main Content */}
      <main className="pb-28">
        {/* Hero Section with Search */}
        <HeroSearch
          userName={isAuthenticated ? displayName : undefined}
          onSearch={handleSearch}
        />

        {/* Quick Actions - Side by Side Cards */}
        <QuickActionsSection />

        {/* View Map CTA */}
        <ViewMapCTA />

        {/* Recent Searches */}
        <div className="px-4 max-w-lg mx-auto">
          <RecentSearchesSection onSearchSelect={handleRecentSearchSelect} />
        </div>

        {/* Nearby Pharmacies Preview */}
        <div className="px-4 max-w-lg mx-auto">
          <NearbyPharmaciesPreview />
        </div>

        {/* Alay CTA for authenticated users */}
        {isAuthenticated && (
          <section className="px-4 max-w-lg mx-auto">
            <div
              className={cn(
                'p-4 rounded-2xl',
                'bg-gradient-to-br from-primary/10 to-primary/5',
                'border border-primary/20'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    volunteer_activism
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-sm text-primary">
                    Maging Alay Hero!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Tumulong mag-report ng stock at makakuha ng points
                  </p>
                </div>
                <Link
                  to="/profile"
                  className={cn(
                    'px-4 py-2 rounded-full',
                    'bg-primary text-white text-sm font-medium',
                    'hover:bg-primary-hover transition-colors',
                    'active:scale-95'
                  )}
                >
                  Tingnan
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default HomePage;
