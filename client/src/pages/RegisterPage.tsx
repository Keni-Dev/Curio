/**
 * Register Page
 *
 * Email/password + Google OAuth registration.
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '~stores/useAuthStore';
import {
  AuthLayout,
  AuthDivider,
  GoogleAuthButton,
  RegisterForm,
} from '~features/auth/components';

const ONBOARDING_COMPLETED_KEY = 'curio.onboarding.completed';

export default function RegisterPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect if already logged in
  if (isAuthenticated) {
    // New users should go through onboarding
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    const redirectTo = onboardingCompleted ? '/' : '/onboarding';
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <AuthLayout
      title="Join the Community"
      subtitle="Create an account to help others find medicine near them"
    >
      {/* Google OAuth */}
      <GoogleAuthButton />

      {/* Divider */}
      <AuthDivider text="or register with email" />

      {/* Email/Password Form */}
      <RegisterForm />
    </AuthLayout>
  );
}
