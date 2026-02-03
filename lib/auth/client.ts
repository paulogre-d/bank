import { signInWithCustomToken, signOut, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';

export interface RegisterData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  accountType: 'checking' | 'savings';
  password: string;
}

export interface LoginData {
  accountNumber: string;
  password: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

/**
 * Register a new user.
 * Does not sign in the user; they must sign in with their account number and password.
 * A welcome email with the account number is sent by the server.
 */
export async function registerUser(data: RegisterData): Promise<{ accountNumber: string; email: string }> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Registration failed');
  }

  return {
    accountNumber: result.data.accountNumber,
    email: result.data.email,
  };
}

/**
 * Login with account number and password
 */
export async function loginUser(data: LoginData): Promise<AuthUser> {
  // First, call the API to get user info and custom token
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Login failed');
  }

  // Exchange custom token for ID token using Firebase Auth
  // Note: Password verification happens on the backend
  const userCredential = await signInWithCustomToken(auth, result.data.customToken);
  const idToken = await userCredential.user.getIdToken();

  // Store token in localStorage for API requests
  localStorage.setItem('firebaseIdToken', idToken);

  return result.data.user;
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
  localStorage.removeItem('firebaseIdToken');
}

/**
 * Get current Firebase ID token
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  
  try {
    const token = await user.getIdToken();
    localStorage.setItem('firebaseIdToken', token);
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

/**
 * Get authorization header for API requests
 */
export async function getAuthHeader(): Promise<{ Authorization: string } | {}> {
  const token = await getIdToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Reauthenticate with current password and set a new password.
 * Must be called while the user is signed in.
 */
export async function reauthenticateAndUpdatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) {
    throw new Error('You must be signed in to change your password.');
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
