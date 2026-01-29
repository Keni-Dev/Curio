/**
 * NavHeader Component
 *
 * Top navigation header with glass morphism pill design.
 * Matches the reference design exactly.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '~lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Map', path: '/map' },
  { label: 'Saved', path: '/saved' },
  { label: 'Profile', path: '/profile' },
];

// =============================================================================
// NAV HEADER COMPONENT
// =============================================================================

const NavHeader: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if path matches
  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/' || currentPath === '/map';
    }
    return currentPath === path;
  };

  return (
    <header className="w-full p-4 pointer-events-auto relative z-50">
      <div className="mx-auto max-w-[1440px]">
        {/* Glass Panel Header */}
        <div
          className={cn(
            'rounded-full px-6 py-3.5 flex items-center justify-between',
            'bg-white/50 backdrop-blur-xl',
            'border border-white/15',
            'shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]'
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">local_pharmacy</span>
            </div>
            <h1 className="text-primary text-xl font-bold tracking-tight">
              Curio
            </h1>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center',
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-slate-700">
                notifications
              </span>
            </button>

            {/* User Avatar */}
            <div
              className="size-10 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer"
              aria-label="Profile"
            >
              <span className="material-symbols-outlined">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
