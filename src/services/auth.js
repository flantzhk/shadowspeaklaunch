// src/services/auth.js — Authentication service (Firebase)

import { firebase, fbAuth, fbDb } from './firebase';
import { logger } from '../utils/logger';

/**
 * Register a new user with email/password.
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
async function signUp(email, password, name) {
  try {
    const cred = await fbAuth.createUserWithEmailAndPassword(email, password);
    if (cred.user && name) {
      await cred.user.updateProfile({ displayName: name });
    }
    // Track user registration in Firestore
    try {
      await fbDb.collection('users').doc(cred.user.uid).set({
        uid: cred.user.uid,
        email,
        name: name || '',
        signUpDate: new Date().toISOString(),
        platform: 'web',
        onboardingCompleted: false,
      }, { merge: true });
    } catch (dbErr) {
      logger.error('Failed to write user doc', dbErr);
      // Non-fatal — auth still succeeded
    }
    return { user: cred.user, error: null };
  } catch (error) {
    logger.error('Sign up failed', error);
    return { user: null, error: firebaseErrorMessage(error) };
  }
}

/**
 * Sign in with email/password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
async function signIn(email, password) {
  try {
    const cred = await fbAuth.signInWithEmailAndPassword(email, password);
    return { user: cred.user, error: null };
  } catch (error) {
    logger.error('Sign in failed', error);
    return { user: null, error: firebaseErrorMessage(error) };
  }
}

/**
 * Sign in with Google popup.
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const cred = await fbAuth.signInWithPopup(provider);
    // Track first-time Google sign-ups in Firestore
    if (cred.additionalUserInfo?.isNewUser) {
      try {
        await fbDb.collection('users').doc(cred.user.uid).set({
          uid: cred.user.uid,
          email: cred.user.email || '',
          name: cred.user.displayName || '',
          signUpDate: new Date().toISOString(),
          platform: 'web',
          onboardingCompleted: false,
        }, { merge: true });
      } catch (dbErr) {
        logger.error('Failed to write Google user doc', dbErr);
      }
    }
    return { user: cred.user, error: null };
  } catch (error) {
    logger.error('Google sign-in failed', error);
    if (error.code === 'auth/popup-closed-by-user') {
      return { user: null, error: null };
    }
    return { user: null, error: firebaseErrorMessage(error) };
  }
}

/**
 * Sign in with Apple popup via Firebase OAuthProvider.
 * Requires Apple Sign In configured in the Firebase console:
 *   Authentication > Sign-in method > Apple > Enable
 *   (Needs Apple Developer account + Service ID + OAuth redirect domain)
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
async function signInWithApple() {
  const provider = new firebase.auth.OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  try {
    const cred = await fbAuth.signInWithPopup(provider);
    if (cred.additionalUserInfo?.isNewUser) {
      try {
        await fbDb.collection('users').doc(cred.user.uid).set({
          uid: cred.user.uid,
          email: cred.user.email || '',
          name: cred.user.displayName || '',
          signUpDate: new Date().toISOString(),
          platform: 'web',
          onboardingCompleted: false,
        }, { merge: true });
      } catch (dbErr) {
        logger.error('Failed to write Apple user doc', dbErr);
      }
    }
    return { user: cred.user, error: null };
  } catch (error) {
    logger.error('Apple sign-in failed', error);
    if (error.code === 'auth/popup-closed-by-user') {
      return { user: null, error: null };
    }
    if (error.code === 'auth/operation-not-allowed') {
      return { user: null, error: 'Apple Sign In is not enabled yet. Please use email or Google.' };
    }
    return { user: null, error: firebaseErrorMessage(error) };
  }
}

/**
 * Sign out the current user.
 */
async function signOut() {
  await fbAuth.signOut();
  window.location.hash = '#login';
}

/**
 * Check if a user is currently signed in.
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!fbAuth.currentUser;
}

/**
 * Get a fresh Firebase ID token (auto-refreshes if near expiry).
 * @returns {Promise<string|null>}
 */
async function getAuthToken() {
  try {
    const user = fbAuth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error) {
    logger.error('Failed to get auth token', error);
    return null;
  }
}

/**
 * Refresh token if needed — Firebase handles this automatically via getIdToken(),
 * so this is kept for API compatibility.
 * @returns {Promise<boolean>}
 */
async function refreshTokenIfNeeded() {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Send a password reset email.
 * @param {string} email
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
async function requestPasswordReset(email) {
  try {
    await fbAuth.sendPasswordResetEmail(email);
    return { success: true, error: null };
  } catch (error) {
    logger.error('Password reset request failed', error);
    return { success: false, error: firebaseErrorMessage(error) };
  }
}

/**
 * Get current user info.
 * @returns {{name: string, email: string, displayName: string, photoURL: string|null, metadata: Object}|null}
 */
function getCurrentUser() {
  const user = fbAuth.currentUser;
  if (!user) return null;
  return {
    name: user.displayName || '',
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || null,
    metadata: user.metadata || {},
  };
}

/**
 * Wait for Firebase Auth to initialize (resolves on first auth state).
 * @returns {Promise<import('firebase/compat').User|null>}
 */
function waitForAuth() {
  return new Promise((resolve) => {
    const unsub = fbAuth.onAuthStateChanged((user) => {
      unsub();
      resolve(user);
    });
  });
}

/**
 * Map Firebase error codes to user-friendly messages.
 */
function firebaseErrorMessage(error) {
  switch (error.code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed': return 'Network error. Please try again.';
    default: return error.message || 'Something went wrong. Please try again.';
  }
}

async function deleteAccount() {
  const user = fbAuth.currentUser;
  if (!user) throw new Error('Not signed in');
  await user.delete();
}

export {
  signUp,
  signIn,
  signInWithGoogle,
  signInWithApple,
  signOut,
  isAuthenticated,
  getAuthToken,
  refreshTokenIfNeeded,
  requestPasswordReset,
  getCurrentUser,
  waitForAuth,
  deleteAccount,
};
