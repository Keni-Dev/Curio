/**
 * Onboarding Page
 *
 * Multi-slide onboarding experience for new users after signup.
 * Introduces Curio's core value proposition: community-powered medicine finding.
 *
 * Design Notes:
 * - Split-screen layout: Left (illustration), Right (content)
 * - Mobile: Stacked layout (illustration top, content bottom)
 * - Consistent with DESIGN_SYSTEM.md tokens
 * - Primary teal (#0F766E), accent coral (#FF7F50)
 *
 * @see DESIGN_SYSTEM.md for design tokens
 * @see references/ONBOARDING_NEW for visual prototypes
 */

import { useState, useCallback, useEffect, type TouchEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '~lib/utils';
import { useTranslation } from '~lib/i18n';
import { OnboardingProgress } from '~components/onboarding';

// Storage key for onboarding completion
const ONBOARDING_COMPLETED_KEY = 'curio.onboarding.completed';

// Slide configuration type
interface SlideConfig {
  badge: string;
  badgeIcon: string;
  titleLine1: string;
  titleLine2?: string;
  titleLine2Highlight?: boolean;
  description: string;
  highlightText?: string;
  illustration: 'welcome' | 'search' | 'community' | 'location';
  floatingIcons: Array<{
    icon: string;
    position: string;
    size: 'sm' | 'md' | 'lg';
    variant: 'coral' | 'gold' | 'teal' | 'glass';
    delay?: number;
  }>;
}

export function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Slide configurations matching the new design references
  const slides: SlideConfig[] = [
    {
      badge: t('onboarding.welcomeBadge'),
      badgeIcon: 'search',
      titleLine1: 'Find the Cure,',
      titleLine2: 'Faster',
      titleLine2Highlight: true,
      description: t('onboarding.welcomeDescription'),
      illustration: 'welcome',
      floatingIcons: [
        { icon: 'medication', position: 'top-12 right-8', size: 'md', variant: 'coral', delay: 0 },
        { icon: 'local_pharmacy', position: 'bottom-12 left-8', size: 'lg', variant: 'coral', delay: 1 },
        { icon: 'health_and_safety', position: 'top-1/2 -right-6', size: 'sm', variant: 'coral', delay: 2 },
      ],
    },
    {
      badge: t('onboarding.searchBadge'),
      badgeIcon: 'travel_explore',
      titleLine1: 'Find Your Meds Instantly.',
      description: t('onboarding.searchDescription'),
      illustration: 'search',
      floatingIcons: [
        { icon: 'medication', position: 'top-[20%] left-[10%]', size: 'md', variant: 'glass', delay: 0 },
        { icon: 'favorite', position: 'bottom-[25%] right-[10%]', size: 'md', variant: 'glass', delay: 3 },
        { icon: 'local_pharmacy', position: 'top-[40%] right-[5%]', size: 'sm', variant: 'glass', delay: 1.5 },
      ],
    },
    {
      badge: t('onboarding.communityBadge'),
      badgeIcon: 'groups',
      titleLine1: 'Tayo-tayo ang Magkakatulong',
      description: t('onboarding.communityDescription'),
      highlightText: 'Alay Points',
      illustration: 'community',
      floatingIcons: [
        { icon: 'monetization_on', position: '-top-6 -left-6', size: 'lg', variant: 'gold', delay: 0 },
        { icon: 'savings', position: '-bottom-8 -right-4', size: 'lg', variant: 'gold', delay: 1 },
        { icon: 'add_circle', position: 'top-1/3 -right-12', size: 'md', variant: 'gold', delay: 0.5 },
      ],
    },
    {
      badge: t('onboarding.startBadge'),
      badgeIcon: 'rocket_launch',
      titleLine1: 'Magsimula Na Tayo',
      description: t('onboarding.startDescription'),
      illustration: 'location',
      floatingIcons: [
        { icon: 'explore', position: 'top-10 right-10', size: 'md', variant: 'glass', delay: 0 },
        { icon: 'stars', position: 'bottom-20 left-10', size: 'md', variant: 'glass', delay: 3 },
      ],
    },
  ];

  const isLastSlide = currentSlide === slides.length - 1;
  const currentSlideData = slides[currentSlide];

  // Handle completion
  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    navigate('/');
  }, [navigate]);

  // Handle skip
  const handleSkip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  // Handle next slide
  const handleNext = useCallback(() => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
    }
  }, [isLastSlide, slides.length, completeOnboarding]);

  // Handle location permission (on final slide)
  const handleEnableLocation = useCallback(async () => {
    setIsRequestingLocation(true);
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      completeOnboarding();
    } catch {
      completeOnboarding();
    } finally {
      setIsRequestingLocation(false);
    }
  }, [completeOnboarding]);

  // Handle dot click
  const handleDotClick = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Swipe handling for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    const touch = e.targetTouches[0];
    if (touch) setTouchStart(touch.clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) setTouchEnd(touch.clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
    if (distance < -minSwipeDistance && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      } else if (e.key === 'Enter' && isLastSlide) {
        completeOnboarding();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length, isLastSlide, completeOnboarding]);

  if (!currentSlideData) return null;

  // Render description with highlighted text
  const renderDescription = () => {
    if (!currentSlideData.highlightText) {
      return currentSlideData.description;
    }
    const parts = currentSlideData.description.split(currentSlideData.highlightText);
    if (parts.length === 1) return currentSlideData.description;
    return (
      <>
        {parts[0]}
        <span className="font-bold text-accent">{currentSlideData.highlightText}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ========== LEFT PANEL - Illustration ========== */}
      <div
        className={cn(
          'relative w-full lg:w-1/2',
          'h-[45vh] lg:h-screen',
          'bg-gradient-to-br from-[#e0f2f1] via-[#f0f9f8] to-white',
          'dark:from-primary-dark/30 dark:via-primary-dark/20 dark:to-background-dark',
          'flex items-center justify-center',
          'overflow-hidden p-8 lg:p-16'
        )}
      >
        {/* Decorative background blurs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        {/* Illustration Container */}
        <div className="relative z-10 w-full max-w-lg">
          {/* Main illustration area */}
          <div
            className={cn(
              'relative w-full',
              currentSlideData.illustration === 'search' ? 'aspect-[280/580]' : 'aspect-square',
              'bg-white/40 dark:bg-white/5 backdrop-blur-sm',
              'border border-white/60 dark:border-white/20',
              'rounded-[24px] shadow-xl',
              'flex items-center justify-center overflow-hidden'
            )}
          >
            {currentSlideData.illustration === 'welcome' && <WelcomeIllustration />}
            {currentSlideData.illustration === 'search' && <SearchIllustration />}
            {currentSlideData.illustration === 'community' && <CommunityIllustration />}
            {currentSlideData.illustration === 'location' && <LocationIllustration />}
          </div>

          {/* Floating Icons */}
          {currentSlideData.floatingIcons.map((item, index) => (
            <FloatingIcon
              key={`${currentSlide}-${index}`}
              icon={item.icon}
              position={item.position}
              size={item.size}
              variant={item.variant}
              delay={item.delay ?? 0}
            />
          ))}
        </div>
      </div>

      {/* ========== RIGHT PANEL - Content ========== */}
      <div
        className={cn(
          'relative w-full lg:w-1/2',
          'flex-1 lg:h-screen',
          'bg-white dark:bg-background-dark',
          'flex flex-col'
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6 lg:px-12 lg:py-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg text-primary">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                medical_services
              </span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-text-primary dark:text-white">
              Curio
            </span>
          </Link>
          <button
            type="button"
            onClick={handleSkip}
            className={cn(
              'text-sm font-semibold text-text-secondary',
              'hover:text-primary transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1'
            )}
          >
            {t('onboarding.skip')}
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-6 lg:px-16 xl:px-24 py-8">
          {/* Badge */}
          <div className="self-start inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <span className="material-symbols-outlined text-primary text-sm">
              {currentSlideData.badgeIcon}
            </span>
            <span className="text-primary text-xs font-bold tracking-wider uppercase">
              {currentSlideData.badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-text-primary dark:text-white text-4xl lg:text-[48px] font-bold leading-[1.1] mb-6 tracking-tight">
            {currentSlideData.titleLine1}
            {currentSlideData.titleLine2 && (
              <>
                <br />
                <span className={currentSlideData.titleLine2Highlight ? 'text-primary' : ''}>
                  {currentSlideData.titleLine2}
                </span>
              </>
            )}
          </h1>

          {/* Subtext */}
          <p className="text-text-secondary dark:text-gray-300 font-body text-lg leading-relaxed max-w-md">
            {renderDescription()}
          </p>
        </main>

        {/* Footer */}
        <footer className="px-6 pb-8 lg:px-16 xl:px-24 lg:pb-12 space-y-6">
          {/* Progress Dots */}
          <OnboardingProgress
            total={slides.length}
            current={currentSlide}
            onDotClick={handleDotClick}
          />

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            {isLastSlide ? (
              <>
                {/* Location Permission Button */}
                <button
                  type="button"
                  onClick={handleEnableLocation}
                  disabled={isRequestingLocation}
                  className={cn(
                    'group w-full h-14 bg-primary hover:bg-primary-dark',
                    'text-white rounded-full shadow-lg shadow-primary/20',
                    'flex items-center justify-center gap-2',
                    'transition-all duration-200 font-bold text-base',
                    'active:scale-[0.99] disabled:opacity-70'
                  )}
                >
                  {isRequestingLocation ? (
                    <span className="material-symbols-outlined animate-spin text-xl">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-xl group-hover:animate-pulse">
                      my_location
                    </span>
                  )}
                  <span>{isRequestingLocation ? t('common.loading') : t('onboarding.enableLocation')}</span>
                </button>
                {/* Skip Location Button */}
                <button
                  type="button"
                  onClick={completeOnboarding}
                  className={cn(
                    'w-full h-12 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5',
                    'text-text-secondary hover:text-text-primary dark:hover:text-white',
                    'rounded-full font-semibold text-sm transition-colors'
                  )}
                >
                  {t('onboarding.getStarted')}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className={cn(
                  'group w-full h-14 bg-accent hover:bg-accent/90',
                  'text-white rounded-full shadow-lg shadow-accent/25',
                  'flex items-center justify-center gap-2',
                  'transition-all duration-200 font-bold text-lg',
                  'active:scale-[0.99] hover:shadow-xl hover:-translate-y-0.5'
                )}
              >
                <span>{t('onboarding.next')}</span>
                <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

// ============================================================================
// Floating Icon Component
// ============================================================================

interface FloatingIconProps {
  icon: string;
  position: string;
  size: 'sm' | 'md' | 'lg';
  variant: 'coral' | 'gold' | 'teal' | 'glass';
  delay: number;
}

function FloatingIcon({ icon, position, size, variant, delay }: FloatingIconProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const variantClasses = {
    coral: 'bg-accent text-white shadow-lg',
    gold: 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-lg',
    teal: 'bg-primary text-white shadow-lg',
    glass: 'bg-white dark:bg-surface-dark p-4 shadow-lg shadow-primary/5 text-primary',
  };

  return (
    <div
      className={cn(
        'absolute z-20 rounded-full flex items-center justify-center animate-float-slow',
        position,
        sizeClasses[size],
        variantClasses[variant]
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </div>
  );
}

// ============================================================================
// Illustrations
// ============================================================================

function WelcomeIllustration() {
  return (
    <div className="relative w-4/5 h-4/5 flex items-center justify-center">
      {/* Pharmacy building illustration */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        <defs>
          <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#13ECDA" />
          </linearGradient>
          <linearGradient id="crossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF7F50" />
            <stop offset="100%" stopColor="#E66A3C" />
          </linearGradient>
        </defs>
        {/* Building base */}
        <rect x="30" y="70" width="140" height="110" rx="12" fill="url(#buildingGrad)" />
        {/* Door */}
        <rect x="75" y="110" width="50" height="70" rx="8" fill="white" fillOpacity="0.95" />
        {/* Windows */}
        <rect x="45" y="90" width="25" height="25" rx="4" fill="white" fillOpacity="0.8" />
        <rect x="130" y="90" width="25" height="25" rx="4" fill="white" fillOpacity="0.8" />
        {/* Cross on top */}
        <rect x="90" y="35" width="20" height="45" rx="4" fill="url(#crossGrad)" />
        <rect x="78" y="47" width="44" height="20" rx="4" fill="url(#crossGrad)" />
      </svg>
      {/* Overlay magnifying glass */}
      <div className="absolute bottom-8 right-8 bg-white/80 dark:bg-white/90 p-4 rounded-full shadow-lg border border-primary/10 backdrop-blur-md animate-float-medium">
        <span className="material-symbols-outlined text-primary text-4xl">search</span>
      </div>
    </div>
  );
}

function SearchIllustration() {
  return (
    <div className="relative w-full h-full bg-gray-900 rounded-[2rem] overflow-hidden">
      {/* Status bar */}
      <div className="absolute top-0 left-0 w-full h-7 bg-white z-20 flex items-center justify-between px-6">
        <span className="text-[10px] font-bold text-black">9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-2 bg-black rounded-sm" />
          <div className="w-3 h-2 bg-black rounded-sm" />
        </div>
      </div>
      {/* Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30" />
      {/* Screen */}
      <div className="w-full h-full pt-8 bg-gray-100">
        {/* Map background */}
        <div
          className="w-full h-full bg-gradient-to-b from-[#e0f2f1] to-[#f0faf9] relative"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(15,118,110,0.05) 1px, transparent 1px),
              linear-gradient(rgba(15,118,110,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        >
          {/* Search bar */}
          <div className="absolute top-4 left-4 right-4 bg-white rounded-full shadow-md p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
            <span className="text-xs text-gray-500 font-medium">Amoxicillin 500mg...</span>
          </div>

          {/* Map markers */}
          <div className="absolute top-[35%] left-[25%] flex flex-col items-center">
            <div className="bg-success text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg mb-1">
              ₱15.00
            </div>
            <div className="w-3 h-3 bg-success rounded-full border-2 border-white shadow-md" />
          </div>

          <div className="absolute top-[50%] right-[20%] flex flex-col items-center opacity-70">
            <div className="bg-gray-400 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg mb-1">
              Out of Stock
            </div>
            <div className="w-3 h-3 bg-danger rounded-full border-2 border-white shadow-md" />
          </div>

          <div className="absolute bottom-[35%] left-[45%] flex flex-col items-center z-10">
            <div className="bg-accent text-white text-[9px] font-bold px-2 py-1.5 rounded-full shadow-xl mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">check_circle</span>
              In Stock
            </div>
            <div className="w-4 h-4 bg-accent rounded-full border-2 border-white ring-4 ring-accent/20 shadow-md" />
          </div>

          {/* Bottom sheet */}
          <div className="absolute bottom-0 w-full bg-white rounded-t-2xl p-4 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-accent text-lg">storefront</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Mercury Drug</h4>
                <p className="text-[9px] text-gray-500">0.5km away • Open until 10PM</p>
              </div>
            </div>
            <div className="w-full h-7 bg-accent rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              Reserve Now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityIllustration() {
  return (
    <div
      className="w-full h-full rounded-2xl bg-cover bg-center shadow-inner"
      style={{
        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkMDd1I6KSnWioL1fSIzM2CbKb0XFdzZcanJsdnVlh2v-_vP5Ev3r35DJNtVPZGFHFQ3ykMQR2XLMpWNuyLecJMlPjooNXtDJ2KhtwmgyqNMO3aTDjX8Uxfu1zvLa2Li5jkBvnmULximtJ3vxl4ZYHAbKqQzRq6HdwTRFaeEFWWdomkYM4F7kAH_cOUYO6pa-WdJz2HAgdDiW8YiMcXRdIgfX4H5A-1v7qpVAnpmwMht0UlHejV_gpID1-meaNGvoEeUkFuyw1FmI1')`,
      }}
    />
  );
}

function LocationIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Map grid background */}
      <div
        className="absolute inset-4 rounded-[2rem] bg-white/40 shadow-xl transform -rotate-6 border border-white/50"
        style={{
          backgroundSize: '30px 30px',
          backgroundImage: `
            linear-gradient(to right, rgba(15,118,110,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,118,110,0.05) 1px, transparent 1px)
          `,
        }}
      />

      {/* Center pulsing location */}
      <div className="relative z-20 flex flex-col items-center -translate-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-primary/20 rounded-full animate-ping" />
          <div className="absolute w-14 h-14 bg-primary/30 rounded-full animate-pulse" />
          <div className="relative z-10 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg text-white">
            <span className="material-symbols-outlined text-2xl">location_on</span>
          </div>
        </div>
        <div className="mt-3 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-primary font-bold text-xs shadow-sm border border-white/50">
          You are here
        </div>
      </div>

      {/* Pharmacy markers */}
      <div className="absolute top-16 left-16 animate-float-slow">
        <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
          <span className="material-symbols-outlined text-sm">add</span>
        </div>
      </div>
      <div className="absolute bottom-24 right-16 animate-float-slow" style={{ animationDelay: '3s' }}>
        <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
          <span className="material-symbols-outlined text-sm">add</span>
        </div>
      </div>
      <div className="absolute top-1/3 right-8">
        <div className="w-5 h-5 bg-accent/80 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
          <span className="material-symbols-outlined text-xs">add</span>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
