/**
 * BottomNavBar Component
 *
 * Mobile bottom navigation bar with 5 tabs:
 * - Home (dashboard)
 * - Map (pharmacy finder)
 * - Scan (OCR scanner)
 * - Chat (Medi-Bot)
 * - Profile (user profile)
 *
 * Fixed at bottom of screen, hidden on desktop.
 * Follows 44px minimum touch target guideline.
 */

import type React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '~lib/utils';
import { useAuthStore } from '~stores/useAuthStore';

// =============================================================================
// TYPES
// =============================================================================

interface NavItemProps {
  to: string;
  icon: string;
  iconFilled: string;
  label: string;
  requiresAuth?: boolean;
}

// =============================================================================
// NAV ITEM COMPONENT
// =============================================================================

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  iconFilled,
  label,
  requiresAuth = false,
}) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Check if current route matches
  const isActive = location.pathname === to;

  // For protected routes, redirect to login
  const href = requiresAuth && !isAuthenticated ? '/login' : to;

  return (
    <NavLink
      to={href}
      className={({ isActive: navIsActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-1',
          'flex-1 h-full',
          'transition-colors duration-200',
          navIsActive || isActive
            ? 'text-primary'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        )
      }
    >
      {({ isActive: navIsActive }) => (
        <>
          <span
            className={cn(
              'material-symbols-outlined text-[26px] transition-all',
              (navIsActive || isActive) && 'scale-110'
            )}
          >
            {navIsActive || isActive ? iconFilled : icon}
          </span>
          <span
            className={cn(
              'text-[10px] font-medium leading-none',
              (navIsActive || isActive) ? 'font-semibold' : ''
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};

// =============================================================================
// SCAN BUTTON (Center, Elevated)
// =============================================================================

const ScanButton: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const href = isAuthenticated ? '/scanner' : '/login';

  return (
    <NavLink
      to={href}
      className={cn(
        'relative flex flex-col items-center justify-center flex-1',
        '-mt-8' // Elevate above the bar
      )}
    >
      {/* Circular Button */}
      <div
        className={cn(
          'size-14 rounded-full flex items-center justify-center',
          'bg-accent shadow-lg shadow-accent/30',
          'text-white transition-all',
          'hover:scale-105',
          'active:scale-95'
        )}
      >
        <span className="material-symbols-outlined text-[28px] font-bold">
          document_scanner
        </span>
      </div>
      {/* Label */}
      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
        Scan
      </span>
    </NavLink>
  );
};

// =============================================================================
// BOTTOM NAV BAR COMPONENT
// =============================================================================

export const BottomNavBar: React.FC = () => {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'lg:hidden', // Hide on large desktop only
        'bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl',
        'border-t border-slate-200 dark:border-slate-700',
        'shadow-[0_-2px_10px_rgba(0,0,0,0.1)]',
        'safe-area-inset-bottom' // Safe area padding for notched devices
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-16 px-2">
        <NavItem
          to="/"
          icon="home"
          iconFilled="home"
          label="Home"
        />

        <NavItem
          to="/map"
          icon="map"
          iconFilled="map"
          label="Map"
        />

        {/* Center Scan Button */}
        <ScanButton />

        <NavItem
          to="/chat"
          icon="smart_toy"
          iconFilled="smart_toy"
          label="Chat"
          requiresAuth
        />

        <NavItem
          to="/profile"
          icon="person"
          iconFilled="person"
          label="Profile"
          requiresAuth
        />
      </div>
    </nav>
  );
};

export default BottomNavBar;
