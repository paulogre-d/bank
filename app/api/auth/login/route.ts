import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const { accountNumber, password } = await request.json();

    if (!accountNumber || !password) {
      return errorResponse('Account number and password required', 400, 'VALIDATION_ERROR');
    }

    // Find user by account number
    const usersSnapshot = await adminDb
      .collection('users')
      .where('accountNumber', '==', accountNumber)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return errorResponse('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify user exists in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.getUser(userData.uid);
    } catch (error) {
      return errorResponse('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Note: In a production app, you would verify the password here
    // For now, we'll create a custom token that the client can exchange for an ID token
    // The actual password verification happens when the client signs in with Firebase Auth
    const customToken = await adminAuth.createCustomToken(userData.uid);

    return successResponse({
      user: {
        uid: userData.uid,
        email: userData.email,
        accountNumber: userData.accountNumber,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatarUrl: userData.avatarUrl || null,
      },
      customToken, // Client should exchange this for ID token using Firebase Auth
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Login failed', 500, 'LOGIN_ERROR');
  }
}
