/**
 * Login Page
 *
 * Split-screen layout with branding + email/password & Google OAuth login.
 */

import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '~stores/useAuthStore';
import { useTranslation } from '~lib/i18n';
import {
  AuthLayout,
  AuthDivider,
  GoogleAuthButton,
  LoginForm,
} from '~features/auth/components';

const ONBOARDING_COMPLETED_KEY = 'curio.onboarding.completed';

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { t } = useTranslation();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  // Redirect if already logged in
  if (isAuthenticated) {
    // Check if onboarding is completed
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    const redirectTo = onboardingCompleted ? from : '/onboarding';
    return <Navigate to={redirectTo} state={{ from }} replace />;
  }

  return (
    <AuthLayout
      title={t('auth.welcomeBack')}
      subtitle={t('auth.signInSubtitle')}
    >
      {/* Email/Password Form */}
      <LoginForm />

      {/* Divider */}
      <AuthDivider text={t('auth.orContinueWith')} />

      {/* Google OAuth */}
      <GoogleAuthButton />

      {/* Register Link */}
      <p className="text-center text-body-sm text-text-secondary dark:text-text-muted mt-8">
        {t('auth.noAccount')}{' '}
        <Link
          to="/register"
          state={{ from }}
          className="text-primary font-semibold hover:text-primary-hover transition-colors"
        >
          {t('auth.signUp')}
        </Link>
      </p>
    </AuthLayout>
  );
}
