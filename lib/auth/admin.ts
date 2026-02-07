import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export interface AdminLoginData {
  email: string;
  password: string;
}

/**
 * Login as admin with email and password
 */
export async function adminLogin(data: AdminLoginData): Promise<{ customToken: string; user: { uid: string; email: string | undefined } }> {
  // Call admin login API to get custom token
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Admin login failed');
  }

  // Exchange custom token for ID token using Firebase Auth
  const userCredential = await signInWithCustomToken(auth, result.data.customToken);
  const idToken = await userCredential.user.getIdToken();

  // Store token in localStorage for API requests
  localStorage.setItem('firebaseIdToken', idToken);
  localStorage.setItem('admin_authenticated', 'true');

  return result.data;
}

/**
 * Logout admin
 */
export async function adminLogout(): Promise<void> {
  await signOut(auth);
  localStorage.removeItem('firebaseIdToken');
  localStorage.removeItem('admin_authenticated');
}

/**
 * Get admin authorization header for API requests
 */
export async function getAdminAuthHeader(): Promise<{ Authorization: string } | {}> {
  const user = auth.currentUser;
  if (!user) {
    return {};
  }
  
  try {
    const token = await user.getIdToken();
    localStorage.setItem('firebaseIdToken', token);
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.error('Error getting admin ID token:', error);
    return {};
  }
}
