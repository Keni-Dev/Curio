/**
 * Auth Feature Barrel Export
 */

// API
export {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getSession,
  getUser,
  fetchUserProfile,
  updateUserProfile,
  sendPasswordResetEmail,
  ensureUserProfile,
} from './api/authApi';

// Components
export {
  AuthLayout,
  AuthDivider,
  GoogleAuthButton,
  LoginForm,
  RegisterForm,
  RequireAuth,
} from './components';

// Types
export type {
  AuthState,
  SignInCredentials,
  SignUpCredentials,
  AuthResult,
  LoginFormData,
  RegisterFormData,
  AuthFormError,
} from './types';
