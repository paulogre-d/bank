import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password required', 400, 'VALIDATION_ERROR');
    }

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return errorResponse('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
      throw error;
    }

    const adminEmails = (process.env.ADMIN_EMAIL ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin =
      userRecord.customClaims?.admin === true ||
      (email && adminEmails.includes(email.trim().toLowerCase()));

    if (!isAdmin) {
      return errorResponse('Admin access required', 403, 'FORBIDDEN');
    }

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return successResponse({
      customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return errorResponse(error.message || 'Login failed', 500, 'LOGIN_ERROR');
  }
}
