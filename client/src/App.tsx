import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { cn } from '~lib/utils'
import { Spinner } from '~components/ui'
import { PointsAnimationProvider, AchievementToastProvider } from '~features/alay'
import { OfflineBanner, OfflineBannerSpacer } from '~components/ui/OfflineBanner'
import { InstallPromptBanner } from '~components/ui/InstallPromptBanner'
import { useInitialCache } from '~hooks/useInitialCache'
import { useGeolocation } from '~hooks/useGeolocation'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { useTranslation } from '@/lib/i18n'

// Lazy load pages for bundle optimization
const HomePage = lazy(() => import('~pages/HomePage'))
const DesignSystemDemo = lazy(() => import('~pages/DesignSystemDemo'))
const PharmacyPage = lazy(() => import('~pages/PharmacyPage'))
const ProfilePage = lazy(() => import('~pages/ProfilePage'))
const OcrScannerPage = lazy(() => import('~pages/OcrScannerPage'))
const ChatPage = lazy(() => import('~pages/ChatPage'))
const SearchResultsPage = lazy(() => import('~pages/SearchResultsPage'))

// Loading fallback for lazy components
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background-light">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <span className="text-sm font-medium text-text-secondary">Loading...</span>
    </div>
  </div>
)

// Placeholder for pages not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-glow">
          <span className="text-4xl">🚧</span>
        </div>
        <h1 className="font-display text-display-lg text-primary">{title}</h1>
        <p className="mt-2 font-body text-body-lg text-text-secondary">
          Coming Soon
        </p>
        <a
          href="/"
          className={cn(
            'mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3',
            'font-medium text-white shadow-soft',
            'transition-all hover:bg-primary-dark hover:shadow-glow'
          )}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Map
        </a>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light p-4">
      <div className="text-center">
        <h1 className="font-display text-display-lg text-danger">404</h1>
        <p className="mt-2 text-body-lg text-text-secondary">Page not found</p>
        <a
          href="/"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Go back home
        </a>
      </div>
    </div>
  )
}

// Skip Link component for keyboard navigation
function SkipLink() {
  const { t } = useTranslation()

  return (
    <a href="#main-content" className="skip-link">
      {t('nav.skipToMain')}
    </a>
  )
}

function AppContent() {
  // Get user location for caching nearby pharmacies
  const { coordinates } = useGeolocation()

  // Pre-cache data for offline use
  useInitialCache({
    latitude: coordinates?.lat,
    longitude: coordinates?.lng,
    enabled: true,
  })

  return (
    <>
      {/* Skip Link for keyboard/screen reader users */}
      <SkipLink />

      {/* Offline Status Banner */}
      <OfflineBanner />
      <OfflineBannerSpacer />

      {/* Main Content */}
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main Map View */}
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<HomePage />} />

            {/* Design System Demo */}
            <Route path="/design-system" element={<DesignSystemDemo />} />

            {/* Medicine Search Results */}
            <Route path="/search" element={<SearchResultsPage />} />

            {/* Pharmacy Detail */}
            <Route path="/pharmacy/:slug" element={<PharmacyPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contribute" element={<PlaceholderPage title="Contribute" />} />
            <Route path="/scanner" element={<OcrScannerPage />} />
            <Route path="/chat" element={<ChatPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global Gamification Providers */}
      <PointsAnimationProvider />
      <AchievementToastProvider />

      {/* PWA Install Prompt */}
      <InstallPromptBanner />
    </>
  )
}

function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  )
}

export default App
