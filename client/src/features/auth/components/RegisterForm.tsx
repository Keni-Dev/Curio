/**
 * Register Form Component
 *
 * Email/password registration form with validation.
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input, Button } from '~components/ui';
import { useAuthStore } from '~stores/useAuthStore';
import type { RegisterFormData, AuthFormError } from '../types';

const ONBOARDING_COMPLETED_KEY = 'curio.onboarding.completed';

export function RegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [formData, setFormData] = useState<RegisterFormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<AuthFormError | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get redirect path - new users go to onboarding, returning users to intended page
  const getRedirectPath = () => {
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    if (!onboardingCompleted) {
      return '/onboarding';
    }
    return (location.state as { from?: string })?.from || '/';
  };

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (error?.field === field) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.displayName.trim()) {
      setError({ field: 'displayName', message: 'Display name is required' });
      return false;
    }
    if (formData.displayName.length < 2) {
      setError({ field: 'displayName', message: 'Display name must be at least 2 characters' });
      return false;
    }
    if (!formData.email.trim()) {
      setError({ field: 'email', message: 'Email is required' });
      return false;
    }
    if (!formData.email.includes('@')) {
      setError({ field: 'email', message: 'Please enter a valid email' });
      return false;
    }
    if (!formData.password) {
      setError({ field: 'password', message: 'Password is required' });
      return false;
    }
    if (formData.password.length < 6) {
      setError({ field: 'password', message: 'Password must be at least 6 characters' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError({ field: 'confirmPassword', message: 'Passwords do not match' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName,
    });

    if (!result.success) {
      setError({ field: 'root', message: result.error || 'Registration failed' });
    } else {
      setSuccess(true);
      // Auto-redirect after success - new users go to onboarding
      setTimeout(() => {
        navigate(getRedirectPath(), { replace: true });
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-success">check_circle</span>
        </div>
        <h2 className="font-display text-xl text-text-primary dark:text-white mb-2">
          Account Created!
        </h2>
        <p className="text-text-secondary">
          Welcome to Curio. Redirecting you now...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Root Error */}
      {error?.field === 'root' && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
          <p className="text-sm text-danger font-medium">{error.message}</p>
        </div>
      )}

      {/* Display Name Field */}
      <Input
        type="text"
        label="Display Name"
        placeholder="Juan dela Cruz"
        value={formData.displayName}
        onChange={handleChange('displayName')}
        error={error?.field === 'displayName' ? error.message : undefined}
        autoComplete="name"
        autoFocus
        leftIcon={
          <span className="material-symbols-outlined text-[20px]">person</span>
        }
      />

      {/* Email Field */}
      <Input
        type="email"
        label="Email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange('email')}
        error={error?.field === 'email' ? error.message : undefined}
        autoComplete="email"
        leftIcon={
          <span className="material-symbols-outlined text-[20px]">mail</span>
        }
      />

      {/* Password Field */}
      <Input
        type={showPassword ? 'text' : 'password'}
        label="Password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange('password')}
        error={error?.field === 'password' ? error.message : undefined}
        autoComplete="new-password"
        leftIcon={
          <span className="material-symbols-outlined text-[20px]">lock</span>
        }
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-muted hover:text-text-primary transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      {/* Confirm Password Field */}
      <Input
        type={showConfirmPassword ? 'text' : 'password'}
        label="Confirm Password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={error?.field === 'confirmPassword' ? error.message : undefined}
        autoComplete="new-password"
        leftIcon={
          <span className="material-symbols-outlined text-[20px]">lock</span>
        }
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-text-muted hover:text-text-primary transition-colors"
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showConfirmPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        loadingText="Creating account..."
        className="mt-6"
      >
        Create Account
      </Button>

      {/* Login Link */}
      <p className="text-center text-body-sm text-text-secondary mt-6">
        Already have an account?{' '}
        <Link
          to="/login"
          state={location.state}
          className="text-primary font-semibold hover:text-primary-hover transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
