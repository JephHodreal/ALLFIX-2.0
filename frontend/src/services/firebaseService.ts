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

function verificationLinkSettings() {
  // This makes Firebase include a continue URL back to our app.
  // The link will still contain mode/oobCode parameters.
  return {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };
}

/**
 * Register a new user with email and password
 */
export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user, verificationLinkSettings());
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
 * Resend email verification to the current user
 */
export async function resendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  await sendEmailVerification(user, verificationLinkSettings());
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
