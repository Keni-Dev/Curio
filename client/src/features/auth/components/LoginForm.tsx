/**
 * Login Form Component
 *
 * Email/password login form with validation.
 * Styled to match the split-screen auth layout.
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '~components/ui';
import { useAuthStore } from '~stores/useAuthStore';
import { useTranslation } from '~lib/i18n';
import { cn } from '~lib/utils';
import type { LoginFormData, AuthFormError } from '../types';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<AuthFormError | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect path from location state
  const from = (location.state as { from?: string })?.from || '/';

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (error?.field === field) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError({ field: 'email', message: t('auth.emailRequired') });
      return false;
    }
    if (!formData.email.includes('@')) {
      setError({ field: 'email', message: t('auth.emailInvalid') });
      return false;
    }
    if (!formData.password) {
      setError({ field: 'password', message: t('auth.passwordRequired') });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const result = await signIn(formData);

    if (!result.success) {
      setError({ field: 'root', message: result.error || t('auth.signInFailed') });
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Root Error */}
      {error?.field === 'root' && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
          <p className="text-sm text-danger font-medium">{error.message}</p>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-primary dark:text-white"
        >
          {t('auth.emailAddress')}
        </label>
        <input
          id="email"
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          value={formData.email}
          onChange={handleChange('email')}
          autoComplete="email"
          autoFocus
          className={cn(
            'w-full h-12 px-4 rounded-lg',
            'bg-white dark:bg-surface-elevated',
            'border border-slate-200 dark:border-slate-700',
            'text-text-primary dark:text-white',
            'placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-all',
            error?.field === 'email' && 'border-danger focus:ring-danger/20 focus:border-danger'
          )}
        />
        {error?.field === 'email' && (
          <p className="text-xs text-danger mt-1">{error.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-text-primary dark:text-white"
        >
          {t('auth.password')}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.passwordPlaceholder')}
            value={formData.password}
            onChange={handleChange('password')}
            autoComplete="current-password"
            className={cn(
              'w-full h-12 px-4 pr-12 rounded-lg',
              'bg-white dark:bg-surface-elevated',
              'border border-slate-200 dark:border-slate-700',
              'text-text-primary dark:text-white',
              'placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'transition-all',
              error?.field === 'password' && 'border-danger focus:ring-danger/20 focus:border-danger'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary dark:hover:text-white transition-colors p-1"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {error?.field === 'password' && (
          <p className="text-xs text-danger mt-1">{error.message}</p>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary-hover transition-colors"
        >
          {t('auth.forgotPassword')}
        </Link>
      </div>

      {/* Submit Button - Accent colored with arrow */}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        loading={isLoading}
        loadingText={t('auth.signingIn')}
        className="mt-2 rounded-xl h-14 shadow-lg shadow-accent/30"
      >
        <span className="flex items-center justify-center gap-2">
          {t('auth.signIn')}
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </span>
      </Button>
    </form>
  );
}
