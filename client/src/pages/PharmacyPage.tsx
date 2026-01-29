/**
 * PharmacyPage Component
 *
 * Full pharmacy detail view with responsive desktop/mobile layout:
 * - Hero section with gradient overlay
 * - Two-column layout on desktop (info card + main content)
 * - Community verification with stock reporting
 * - Alay contributor badges with gamification
 * - Filterable stock list with freshness indicators
 *
 * @see references/pharmacy_detail_&_verification/code.html
 */

import { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Spinner, ToastContainer, useToast } from '@/components/ui';
import { usePharmacy } from '@/features/pharmacy/hooks/usePharmacy';
import { usePharmacyStock, EnhancedStockList } from '@/features/stock';
import { ReportModal, useAlayStore } from '@/features/alay';
import type { Pharmacy, OperatingHours } from '@/types/pharmacy';
import type { AlayContributor, MedicineStock } from '@/features/stock/types';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function isPharmacyOpen(pharmacy: Pharmacy): { isOpen: boolean; nextChange: string } {
  if (pharmacy.is24Hours) {
    return { isOpen: true, nextChange: 'Open 24 hours' };
  }

  if (!pharmacy.operatingHours) {
    return { isOpen: true, nextChange: 'Hours not available' };
  }

  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayKey = days[now.getDay()] as keyof OperatingHours;
  const todayHours = pharmacy.operatingHours[todayKey];

  if (!todayHours || todayHours.toLowerCase() === 'closed') {
    return { isOpen: false, nextChange: 'Closed today' };
  }

  const [openTime, closeTime] = todayHours.split(' - ');
  if (!openTime || !closeTime) {
    return { isOpen: true, nextChange: todayHours };
  }

  const parseTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
    if (!match || !match[1]) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2] || '0', 10);
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTime(openTime);
  const closeMinutes = parseTime(closeTime);
  const isOpen = currentTime >= openMinutes && currentTime < closeMinutes;

  return {
    isOpen,
    nextChange: isOpen ? `Closes ${closeTime}` : `Opens ${openTime}`,
  };
}

function getTodayHours(operatingHours?: OperatingHours): string {
  if (!operatingHours) return 'Hours not available';
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()] as keyof OperatingHours;
  return operatingHours[today] || 'Closed';
}

// =============================================================================
// PAGE HEADER (Nav Bar)
// =============================================================================

function PageHeader({
  pharmacy,
  onBack,
}: {
  pharmacy: Pharmacy | null;
  onBack: () => void;
}) {
  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col">
          <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white">
            {pharmacy?.name || 'Loading...'}
          </h1>
          {pharmacy?.chainName && (
            <span className="text-xs text-primary dark:text-teal-400 font-medium">
              {pharmacy.chainName}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

// =============================================================================
// HERO SECTION
// =============================================================================

function HeroSection() {
  return (
    <div className="relative h-64 bg-gradient-to-r from-teal-400 to-teal-600 dark:from-teal-800 dark:to-teal-900">
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
    </div>
  );
}

// =============================================================================
// LEFT SIDEBAR - PHARMACY INFO CARD
// =============================================================================

function PharmacyInfoCard({ pharmacy }: { pharmacy: Pharmacy }) {
  const { isOpen, nextChange } = useMemo(() => isPharmacyOpen(pharmacy), [pharmacy]);
  const todayHours = getTodayHours(pharmacy.operatingHours);

  const handleGetDirections = () => {
    const { lat, lng } = pharmacy.location;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCall = () => {
    if (pharmacy.phone) {
      window.location.href = `tel:${pharmacy.phone}`;
    }
  };

  return (
    <div className="w-full md:w-[380px] flex-shrink-0 space-y-6">
      {/* Main Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
        {/* Logo */}
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-lg p-1 -mt-16 mb-6 mx-auto md:mx-0 flex items-center justify-center border border-slate-50 dark:border-slate-700">
          <div className="w-full h-full rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-primary dark:text-teal-400">
            {pharmacy.logoUrl ? (
              <img
                src={pharmacy.logoUrl}
                alt={`${pharmacy.name} logo`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="material-symbols-outlined text-4xl">storefront</span>
            )}
          </div>
        </div>

        {/* Pharmacy Info */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {pharmacy.name}
            </h2>
            {pharmacy.isVerified && (
              <span 
                className="material-symbols-outlined text-blue-500 text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="Verified"
              >
                verified
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            {pharmacy.address}, {pharmacy.city}
          </p>

          {/* Status Tags */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {/* Open/Closed Status */}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
                isOpen || pharmacy.is24Hours
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              )}
            >
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                isOpen || pharmacy.is24Hours ? 'bg-green-500' : 'bg-rose-500'
              )} />
              {pharmacy.is24Hours ? 'Open 24/7' : isOpen ? 'Bukas' : 'Sarado'} • {nextChange}
            </span>

            {/* Verified Badge */}
            {pharmacy.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-100 dark:border-teal-800">
                <span 
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                Verified
              </span>
            )}

            {/* Pharmacy Type */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
              {pharmacy.type}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        {/* Today's Hours */}
        <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mr-4">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Today's Hours</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{todayHours}</p>
          </div>
          <button className="text-sm font-medium text-primary hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
            View all
          </button>
        </div>

        {/* Phone */}
        {pharmacy.phone && (
          <a
            href={`tel:${pharmacy.phone}`}
            className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mr-4 group-hover:bg-white dark:group-hover:bg-slate-600">
              <span className="material-symbols-outlined">call</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{pharmacy.phone}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tap to call</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleGetDirections}
          className={cn(
            'flex items-center justify-center gap-2 px-6 py-4 rounded-xl',
            'border-2 border-primary text-primary dark:text-teal-400 dark:border-teal-500 font-bold',
            'bg-white dark:bg-transparent hover:bg-teal-50 dark:hover:bg-teal-900/20',
            'transition-all shadow-sm active:scale-[0.98]'
          )}
        >
          <span className="material-symbols-outlined text-xl rotate-45">navigation</span>
          I-Navigate
        </button>
        <button
          onClick={handleCall}
          disabled={!pharmacy.phone}
          className={cn(
            'flex items-center justify-center gap-2 px-6 py-4 rounded-xl',
            'bg-primary hover:bg-primary-dark text-white font-bold',
            'shadow-lg shadow-teal-200 dark:shadow-none',
            'transition-all active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <span className="material-symbols-outlined text-xl">call</span>
          Tawagan
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// COMMUNITY VERIFICATION SECTION (with Report Stock Button)
// =============================================================================

function CommunityVerificationCard({ onReportStock }: { onReportStock: () => void }) {
  return (
    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-6 border border-teal-100 dark:border-teal-800">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-300 flex-shrink-0">
          <span className="material-symbols-outlined text-2xl">groups</span>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Community Verification</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Tulungan mo ring i-verify para sa iba!</p>
        </div>
      </div>

      {/* Report Stock Button - Replacing Oo/Wala buttons */}
      <button
        onClick={onReportStock}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl',
          'bg-accent hover:bg-accent-dark text-white font-bold',
          'shadow-lg shadow-accent/30',
          'transition-all active:scale-[0.98]'
        )}
      >
        <span className="material-symbols-outlined text-xl">volunteer_activism</span>
        Mag-report ng Stock
      </button>
    </div>
  );
}

// =============================================================================
// ALAY CONTRIBUTORS CARD
// =============================================================================

function AlayContributorsCard({ contributors }: { contributors: AlayContributor[] }) {
  if (contributors.length === 0) return null;

  const levelConfig: Record<number, { bg: string; textColor: string }> = {
    1: { bg: 'bg-slate-400', textColor: 'text-slate-600 dark:text-slate-400' },
    2: { bg: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    3: { bg: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
    4: { bg: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
    5: { bg: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-wide">
          <span className="material-symbols-outlined text-lg">volunteer_activism</span>
          Mga Alay Contributors
        </div>
        <span className="text-xs font-medium text-primary hover:underline dark:text-teal-400 cursor-pointer">
          {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Contributors Grid - always 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {contributors.slice(0, 4).map((contributor) => {
          const level = levelConfig[contributor.alayLevel] ?? levelConfig[1]!;
          return (
            <div
              key={contributor.id}
              className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/40 p-2 pr-4 rounded-full border border-slate-100 dark:border-slate-600"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden border-2 border-white dark:border-slate-800">
                  {contributor.avatarUrl ? (
                    <img
                      src={contributor.avatarUrl}
                      alt={contributor.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                  )}
                </div>
                {/* Level Badge */}
                <span
                  className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full',
                    'text-white text-[10px] flex items-center justify-center',
                    'border-2 border-white dark:border-slate-800 font-bold',
                    level.bg
                  )}
                >
                  {contributor.alayLevel}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {contributor.displayName}
                </span>
                <span className={cn('text-[10px] font-medium', level.textColor)}>
                  {contributor.contributionCount} contributions
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// STOCK SECTION
// =============================================================================

function StockSection({ pharmacyId }: { pharmacyId: string }) {
  const { stock, summary, isLoading, isFetching, error } = usePharmacyStock({
    pharmacyId,
    realtime: true,
  });

  const { toasts, showToast, hideToast } = useToast();

  const handleItemClick = useCallback((item: MedicineStock) => {
    console.log('Clicked medicine:', item.medicineName);
  }, []);

  const handleVoteSuccess = useCallback(
    (item: MedicineStock) => {
      showToast(`Salamat sa feedback mo sa ${item.medicineName}!`, {
        variant: 'success',
        duration: 2500,
      });
    },
    [showToast]
  );

  return (
    <div className="space-y-6">
      {/* Toast Container for vote feedback */}
      <ToastContainer toasts={toasts} onClose={hideToast} position="bottom" />

      {/* Stock Summary Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary dark:text-teal-400">inventory_2</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Stock ng Gamot</h3>
            </div>
            {summary && (
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                {summary.totalMedicines} na gamot • Updated {formatRelativeTime(summary.lastUpdated)}
              </p>
            )}
          </div>
        </div>

        {/* Stock Summary Stats */}
        {summary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-100 dark:border-green-900/50">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-0.5">
                {summary.inStock}
              </div>
              <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                May Stock
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center border border-amber-100 dark:border-amber-900/50">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                {summary.lowStock}
              </div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Konti Na
              </div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 text-center border border-rose-100 dark:border-rose-900/50">
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-0.5">
                {summary.outOfStock}
              </div>
              <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                Wala Na
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Medications Section */}
      <div className="space-y-4">
        {/* Section Header with Freshness Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Available Medications
          </h4>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
            <span>Freshness:</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Bago
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Medyo Luma
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Lumang Report
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
            <p className="text-sm text-rose-600 font-medium">
              Hindi ma-load ang stock data. Subukan ulit.
            </p>
          </div>
        )}

        {/* Loading indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <Spinner size="sm" />
            <span>Updating...</span>
          </div>
        )}

        {/* Enhanced Stock List - showLegend=false to avoid duplicate */}
        <EnhancedStockList
          items={stock}
          pharmacyId={pharmacyId}
          isLoading={isLoading}
          onItemClick={handleItemClick}
          onVoteSuccess={handleVoteSuccess}
          showLegend={false}
        />
      </div>
    </div>
  );
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function PharmacyPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="h-64 bg-gradient-to-r from-slate-200 to-slate-300 animate-pulse" />

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-col md:flex-row gap-8 -mt-16 relative z-10">
          {/* Left Sidebar Skeleton */}
          <div className="w-full md:w-[380px] flex-shrink-0 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="w-24 h-24 rounded-full bg-slate-200 animate-pulse -mt-16 mb-6" />
              <div className="space-y-3">
                <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-48 animate-pulse" />
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-64 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function PharmacyNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <PageHeader pharmacy={null} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-rose-500 text-5xl">error</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Hindi Makita ang Botika
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
          Baka mali ang link o hindi na available ang botika na ito.
        </p>
        <button
          onClick={onBack}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
            'bg-primary text-white font-bold',
            'shadow-lg shadow-primary/25',
            'hover:bg-primary-dark active:scale-[0.98]',
            'transition-all duration-200'
          )}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Bumalik sa Map
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PharmacyPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { pharmacy, isLoading, isError } = usePharmacy({
    slug: slug || '',
    enabled: !!slug,
  });

  const handleBack = useCallback(() => navigate(-1), [navigate]);
  const { openReportModal } = useAlayStore();
  const handleReportStock = useCallback(() => {
    if (pharmacy) {
      openReportModal(pharmacy.id, pharmacy.name);
    }
  }, [pharmacy, openReportModal]);

  // Mock contributors for demo
  const mockContributors: AlayContributor[] = pharmacy
    ? [
        { id: '1', displayName: 'Maria Santos', alayLevel: 3, contributionCount: 47, lastContributedAt: new Date().toISOString() },
        { id: '2', displayName: 'Juan Dela Cruz', alayLevel: 2, contributionCount: 23, lastContributedAt: new Date().toISOString() },
        { id: '3', displayName: 'Ana Reyes', alayLevel: 4, contributionCount: 89, lastContributedAt: new Date().toISOString() },
      ]
    : [];

  if (isLoading) return <PharmacyPageSkeleton />;
  if (isError || !pharmacy) return <PharmacyNotFound onBack={handleBack} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PageHeader pharmacy={pharmacy} onBack={handleBack} />
      <HeroSection />

      <main className="max-w-[1440px] mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-col md:flex-row gap-8 -mt-16 relative z-10">
          {/* Left Sidebar - Pharmacy Info */}
          <PharmacyInfoCard pharmacy={pharmacy} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Top Row: Community Verification + Alay Contributors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CommunityVerificationCard onReportStock={handleReportStock} />
              <AlayContributorsCard contributors={mockContributors} />
            </div>

            {/* Stock Section */}
            <StockSection pharmacyId={pharmacy.id} />
          </div>
        </div>
      </main>

      {/* Alay Stock Report Modal */}
      <ReportModal pharmacyLocation={pharmacy.location} />
    </div>
  );
}

export default PharmacyPage;
