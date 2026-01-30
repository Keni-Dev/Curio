/**
 * DevToolsPanel Component
 *
 * Floating dev panel for testing location and contribution features.
 * Only renders in development mode.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useDevToolsStore, isDevMode } from '@/stores/useDevToolsStore';

// =============================================================================
// CONSTANTS
// =============================================================================

// Pre-defined test locations near pharmacies in Malolos
const PRESET_LOCATIONS = [
  { name: 'BulSU e-Library', lat: 14.858427, lng: 120.813601 },
  { name: 'Malolos City Center', lat: 14.8527, lng: 120.815 },
  { name: 'Mercury Drug Malolos', lat: 14.8545, lng: 120.8132 },
  { name: 'TGP Malolos', lat: 14.8512, lng: 120.8167 },
  { name: 'Watsons Robinsons', lat: 14.8498, lng: 120.8189 },
] as const;

// =============================================================================
// INNER COMPONENT (Only mounted in dev mode)
// =============================================================================

function DevToolsPanelContent() {
  const {
    isMockLocationEnabled,
    mockLocation,
    bypassProximityCheck,
    isDevPanelOpen,
    isDemoModeEnabled,
    isDemoAuthEnabled,
    setMockLocationEnabled,
    setMockLocation,
    setBypassProximityCheck,
    toggleDevPanel,
    setDemoAuthEnabled,
    enableFullDemoMode,
    disableFullDemoMode,
  } = useDevToolsStore();

  const [customLat, setCustomLat] = useState(mockLocation.lat.toString());
  const [customLng, setCustomLng] = useState(mockLocation.lng.toString());

  const handleCustomLocationSubmit = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setMockLocation({ lat, lng });
    }
  };  

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleDevPanel}
        className={cn(
          'fixed bottom-7 right-4 z-[9999] size-12 rounded-full shadow-lg',
          'flex items-center justify-center transition-all',
          'hover:scale-110 active:scale-95',
          isMockLocationEnabled
            ? 'bg-amber-500 text-white'
            : 'bg-slate-800 text-white'
        )}
        title="Toggle Dev Tools"
      >
        <span className="material-symbols-outlined text-[24px]">
          {isMockLocationEnabled ? 'location_searching' : 'developer_mode'}
        </span>
      </button>

      {/* Panel */}
      {isDevPanelOpen && (
        <div
          className={cn(
            'fixed bottom-56 right-4 z-[9998] w-80',
            'bg-slate-900 text-white rounded-xl shadow-2xl',
            'border border-slate-700 overflow-hidden'
          )}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">🛠️ Dev Tools</span>
              <button
                onClick={toggleDevPanel}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Mock Location Toggle */}
            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Mock Location</span>
                <button
                  onClick={() => setMockLocationEnabled(!isMockLocationEnabled)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    isMockLocationEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block size-4 transform rounded-full bg-white transition-transform',
                      isMockLocationEnabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </label>
              {isMockLocationEnabled && (
                <p className="text-xs text-amber-400">
                  📍 Using mock location: {mockLocation.lat.toFixed(6)}, {mockLocation.lng.toFixed(6)}
                </p>
              )}
            </div>

            {/* Preset Locations */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                Teleport to Location
              </p>
              <div className="grid grid-cols-1 gap-1">
                {PRESET_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setMockLocation({ lat: loc.lat, lng: loc.lng });
                      setMockLocationEnabled(true);
                      setCustomLat(loc.lat.toString());
                      setCustomLng(loc.lng.toString());
                    }}
                    className={cn(
                      'text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      mockLocation.lat === loc.lat && mockLocation.lng === loc.lng
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    )}
                  >
                    <span className="material-symbols-outlined text-[14px] mr-2 align-middle">
                      location_on
                    </span>
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Coordinates */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                Custom Coordinates
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="Lat"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="Lng"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={handleCustomLocationSubmit}
                className="w-full py-2 rounded-lg bg-amber-500 text-slate-900 font-medium text-sm hover:bg-amber-400 transition-colors"
              >
                Set Location
              </button>
            </div>

            {/* Bypass Proximity Check */}
            <div className="pt-2 border-t border-slate-700">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Bypass Proximity</span>
                  <p className="text-xs text-slate-400">Skip distance check for contributions</p>
                </div>
                <button
                  onClick={() => setBypassProximityCheck(!bypassProximityCheck)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    bypassProximityCheck ? 'bg-rose-500' : 'bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block size-4 transform rounded-full bg-white transition-transform',
                      bypassProximityCheck ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </label>
            </div>

            {/* Demo Mode Section */}
            <div className="pt-3 border-t border-slate-700 space-y-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                🎭 Demo Mode (Offline)
              </p>

              {/* Full Demo Mode Toggle */}
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Full Demo Mode</span>
                    <p className="text-xs text-slate-400">Use mock data, skip auth & APIs</p>
                  </div>
                  <button
                    onClick={() => isDemoModeEnabled ? disableFullDemoMode() : enableFullDemoMode()}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isDemoModeEnabled ? 'bg-purple-500' : 'bg-slate-600'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block size-4 transform rounded-full bg-white transition-transform',
                        isDemoModeEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </label>

                {isDemoModeEnabled && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <p className="text-xs text-purple-300 mb-2">
                      ✅ Demo mode active! Features:
                    </p>
                    <ul className="text-xs text-purple-200 space-y-1">
                      <li>• Mock pharmacy & medicine data</li>
                      <li>• Demo user auto-login</li>
                      <li>• Pre-scripted AI responses</li>
                      <li>• No internet required</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Individual Demo Toggles */}
              {isDemoModeEnabled && (
                <div className="space-y-2 pl-2 border-l-2 border-slate-700">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Demo Auth</span>
                    <button
                      onClick={() => setDemoAuthEnabled(!isDemoAuthEnabled)}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                        isDemoAuthEnabled ? 'bg-purple-400' : 'bg-slate-600'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block size-3 transform rounded-full bg-white transition-transform',
                          isDemoAuthEnabled ? 'translate-x-5' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </label>
                </div>
              )}

              {/* Quick Demo Actions */}
              {isDemoModeEnabled && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMockLocation({ lat: 14.8374, lng: 120.9608 });
                      setMockLocationEnabled(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium hover:bg-purple-500/30 transition-colors"
                  >
                    📍 Go to Malolos
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-600 transition-colors"
                  >
                    🔄 Reload App
                  </button>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="pt-2 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                💡 Tip: Enable mock location or bypass proximity to test contribution flow without being physically near a pharmacy.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =============================================================================
// EXPORTED COMPONENT (Handles dev mode check)
// =============================================================================

export function DevToolsPanel() {
  // Only render in development mode
  if (!isDevMode()) return null;
  return <DevToolsPanelContent />;
}

export default DevToolsPanel;
