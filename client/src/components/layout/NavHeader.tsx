/**
 * NavHeader Component
 *
 * Top navigation header with glass morphism pill design.
 * Matches the reference design exactly.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '~lib/utils';
import { CurioBrand } from '~components/ui/CurioLogo';
import ProfileMenu from '~components/ui/ProfileMenu';

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
  label: string;
  path: string;
}

interface NavHeaderProps {
  /** Visual style variant */
  variant?: 'glass' | 'solid';
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

const NavHeader: React.FC<NavHeaderProps> = ({ variant = 'glass' }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if path matches
  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <header className="w-full p-4 pointer-events-auto relative z-50">
      <div className="mx-auto max-w-[1440px]">
        {/* Nav Header */}
        <div
          className={cn(
            'rounded-full px-6 py-3.5 flex items-center justify-between',
            variant === 'glass'
              ? 'bg-white/50 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]'
              : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700'
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group ml-2" tabIndex={-1}>
            <div className="group-hover:scale-110 transition-transform duration-300">
              <CurioBrand logoSize={28} variant="primary" />
            </div>
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

            {/* Profile Menu */}
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
