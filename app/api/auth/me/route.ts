import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;

    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return errorResponse('User not found', 404, 'NOT_FOUND');
    }

    const userData = userDoc.data()!;

    return successResponse({
      uid: userData.uid,
      email: userData.email,
      accountNumber: userData.accountNumber,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || null,
      address: userData.address || null,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return errorResponse(error.message || 'Failed to fetch user data', 500, 'SERVER_ERROR');
  }
}
