/**
 * ProfileMenu Component
 *
 * Dropdown menu for user profile actions.
 * Shows user info, profile link, and sign out option.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '~lib/utils';
import { useAuthStore } from '~stores/useAuthStore';

// =============================================================================
// PROFILE MENU COMPONENT
// =============================================================================

const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  // Display name fallback: profile name → email → 'User'
  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleViewProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    // Force reload to clear all state and reflect signed-out UI
    window.location.href = '/';
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Button */}
      <button
        onClick={handleToggle}
        onKeyDown={(e) => handleKeyDown(e, handleToggle)}
        className={cn(
          'size-10 rounded-full bg-primary flex items-center justify-center text-white',
          'cursor-pointer transition-all duration-200',
          'hover:ring-2 hover:ring-primary/30 hover:ring-offset-2',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isOpen && 'ring-2 ring-primary/30 ring-offset-2'
        )}
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined">person</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Profile menu"
          className={cn(
            'absolute right-0 top-full mt-2 w-64',
            'bg-white dark:bg-surface-dark',
            'rounded-xl shadow-lg',
            'border border-slate-200 dark:border-slate-700',
            'overflow-hidden',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {email}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* View Profile */}
            <button
              role="menuitem"
              onClick={handleViewProfile}
              onKeyDown={(e) => handleKeyDown(e, handleViewProfile)}
              className={cn(
                'w-full px-4 py-2.5 flex items-center gap-3',
                'text-left text-slate-700 dark:text-slate-200',
                'hover:bg-slate-50 dark:hover:bg-slate-800',
                'focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800',
                'transition-colors duration-150'
              )}
            >
              <span className="material-symbols-outlined text-xl text-slate-500">
                person
              </span>
              <span className="text-sm font-medium">View Profile</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

            {/* Sign Out */}
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSignOut();
              }}
              onKeyDown={(e) => handleKeyDown(e, handleSignOut)}
              className={cn(
                'w-full px-4 py-2.5 flex items-center gap-3',
                'text-left text-danger',
                'hover:bg-danger/5',
                'focus:outline-none focus:bg-danger/5',
                'transition-colors duration-150'
              )}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
