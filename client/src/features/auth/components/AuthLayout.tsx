/**
 * Auth Layout Component
 *
 * Split-screen layout for login and registration pages.
 * Left panel: Branding with illustration (desktop) / Compact header (mobile)
 * Right panel: Auth form content
 *
 * @see DESIGN_SYSTEM.md for design tokens
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '~lib/utils';
import { useTranslation } from '~lib/i18n';
import { CurioBrand } from '@/components/ui/CurioLogo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row">
      {/* ========== LEFT PANEL - Branding ========== */}
      <div
        className={cn(
          'relative w-full lg:w-1/2',
          'min-h-[40vh] lg:min-h-screen',
          'bg-gradient-to-br from-primary via-primary to-primary-dark',
          'dark:from-primary-dark dark:via-primary-dark dark:to-background-dark',
          'flex flex-col justify-between',
          'overflow-hidden'
        )}
      >
        {/* Decorative mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-light/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Logo - top left */}
        <Link
          to="/"
          className="relative z-10 p-6 group"
        >
          <CurioBrand logoSize={36} variant="white" className="transition-transform group-hover:scale-105" />
        </Link>

        {/* Illustration Container */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-4 lg:py-8">
          <div className="relative w-full max-w-md">
            {/* Illustration frame with subtle border */}
            <div
              className={cn(
                'relative aspect-[4/3] lg:aspect-square',
                'rounded-2xl overflow-hidden',
                'border-2 border-white/20',
                'bg-white/5 backdrop-blur-sm'
              )}
            >
              {/* TODO: Replace with actual community illustration */}
              {/* Placeholder illustration - community people */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 400 300"
                  className="w-full h-full p-4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Simple placeholder silhouettes representing community */}
                  <defs>
                    <linearGradient id="personGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="personGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="personGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="skinTone1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#D4A574" />
                      <stop offset="100%" stopColor="#C4956C" />
                    </linearGradient>
                    <linearGradient id="skinTone2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F5D0B5" />
                      <stop offset="100%" stopColor="#E8C4A8" />
                    </linearGradient>
                    <linearGradient id="skinTone3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B6B4A" />
                      <stop offset="100%" stopColor="#7A5D3F" />
                    </linearGradient>
                  </defs>

                  {/* Ground/base */}
                  <ellipse cx="200" cy="270" rx="160" ry="20" fill="rgba(255,255,255,0.1)" />

                  {/* Person 1 - Left (waving) */}
                  <g transform="translate(60, 80)">
                    {/* Body */}
                    <path d="M30 100 L30 160 Q30 180 50 180 L70 180 Q90 180 90 160 L90 100 Q60 90 30 100" fill="url(#personGrad1)" />
                    {/* Head */}
                    <circle cx="60" cy="60" r="35" fill="url(#skinTone1)" />
                    {/* Hair */}
                    <path d="M30 50 Q40 20 60 25 Q80 20 90 50 Q85 40 60 45 Q35 40 30 50" fill="#2D2D2D" />
                    {/* Raised arm */}
                    <path d="M85 100 Q110 70 100 40" stroke="url(#skinTone1)" strokeWidth="12" strokeLinecap="round" fill="none" />
                  </g>

                  {/* Person 2 - Center (arms raised) */}
                  <g transform="translate(140, 60)">
                    {/* Body */}
                    <path d="M30 120 L30 180 Q30 200 50 200 L70 200 Q90 200 90 180 L90 120 Q60 110 30 120" fill="url(#personGrad2)" />
                    {/* Head */}
                    <circle cx="60" cy="75" r="38" fill="url(#skinTone2)" />
                    {/* Hair */}
                    <ellipse cx="60" cy="55" rx="35" ry="25" fill="#4A3728" />
                    {/* Arms raised */}
                    <path d="M25 125 Q0 80 20 40" stroke="url(#skinTone2)" strokeWidth="12" strokeLinecap="round" fill="none" />
                    <path d="M95 125 Q120 80 100 40" stroke="url(#skinTone2)" strokeWidth="12" strokeLinecap="round" fill="none" />
                  </g>

                  {/* Person 3 - Right */}
                  <g transform="translate(240, 85)">
                    {/* Body */}
                    <path d="M25 95 L25 155 Q25 175 45 175 L65 175 Q85 175 85 155 L85 95 Q55 85 25 95" fill="url(#personGrad3)" />
                    {/* Head */}
                    <circle cx="55" cy="55" r="32" fill="url(#skinTone3)" />
                    {/* Hair */}
                    <path d="M25 45 Q35 15 55 20 Q75 15 85 45 Q80 35 55 40 Q30 35 25 45" fill="#1A1A1A" />
                    {/* Arm waving */}
                    <path d="M80 100 Q100 65 90 35" stroke="url(#skinTone3)" strokeWidth="11" strokeLinecap="round" fill="none" />
                  </g>

                  {/* Decorative elements - floating hearts/plus signs */}
                  <g className="animate-float-slow" style={{ transformOrigin: 'center' }}>
                    <text x="320" y="60" fontSize="24" fill="rgba(255,255,255,0.6)">+</text>
                    <text x="50" y="50" fontSize="20" fill="rgba(255,255,255,0.5)">❤</text>
                    <text x="350" y="150" fontSize="18" fill="rgba(255,255,255,0.4)">+</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bayanihan Title */}
        <div className="relative z-10 px-8 pb-8 lg:pb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white leading-tight">
            {t('auth.bayanihanTitle')}
            <br />
            <span className="italic text-accent">{t('auth.bayanihanSubtitle')}</span>
          </h2>
          <p className="mt-4 text-white/80 font-body text-sm lg:text-base max-w-md">
            {t('auth.bayanihanDesc')}
          </p>

          {/* Copyright - visible on desktop */}
          <p className="hidden lg:block mt-8 text-white/50 text-xs font-body">
            {t('auth.copyright')}
          </p>
        </div>
      </div>

      {/* ========== RIGHT PANEL - Auth Form ========== */}
      <div
        className={cn(
          'relative w-full lg:w-1/2',
          'flex flex-col justify-center items-center',
          'bg-white dark:bg-surface-dark',
          'px-6 py-8 lg:px-12 lg:py-0',
          'min-h-[60vh] lg:min-h-screen'
        )}
      >
        {/* Form Container */}
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 font-body text-body-sm text-text-secondary dark:text-text-muted">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Copyright - visible on mobile */}
        <p className="lg:hidden mt-8 text-text-muted text-xs font-body">
          {t('auth.copyright')}
        </p>
      </div>
    </div>
  );
}
