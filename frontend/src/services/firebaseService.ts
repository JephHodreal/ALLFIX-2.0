import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  User,
  applyActionCode,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function sendBackendVerificationEmail(email: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send verification email');
  }
}

export async function sendOtp() {
  const token = await getIdToken();
  if (!token) throw new Error('No user signed in to request OTP');

  const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send OTP');
  }
}

export async function verifyOtp(code: string) {
  const token = await getIdToken();
  if (!token) throw new Error('No user signed in to verify OTP');

  const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to verify OTP');
  }
}

/**
 * Register a new user with email and password
 */
export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Login with email and password
 */
export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign out the current user
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Get the current user's ID token for API calls
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Resend OTP to the current user
 */
export async function resendVerificationEmail() {
  await sendOtp();
}

/**
 * Apply action code (verify email)
 */
export async function verifyEmail(actionCode: string) {
  await applyActionCode(auth, actionCode);
}

/**
 * Check if the current user's email is verified
 */
export async function checkEmailVerified(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  await user.reload();
  return user.emailVerified;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current Firebase user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Change/update current user's password
 */
export async function changePassword(password: string, currentPassword?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  
  if (currentPassword && user.email) {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  }
  
  await updatePassword(user, password);
}
