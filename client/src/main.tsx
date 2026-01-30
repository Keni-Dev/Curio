import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

// ============================================================================
// Service Worker Registration
// ============================================================================

const updateSW = registerSW({
  onNeedRefresh() {
    // New content available, prompt user to refresh
    if (confirm('New version available! Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('[SW] App ready for offline use')
  },
  onRegistered(registration) {
    console.log('[SW] Service worker registered:', registration)
  },
  onRegisterError(error) {
    console.error('[SW] Registration error:', error)
  },
})

// ============================================================================
// Query Client Configuration
// ============================================================================

// Create a client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// ============================================================================
// App Mount
// ============================================================================

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
