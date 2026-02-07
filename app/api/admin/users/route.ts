import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all users
    const usersSnapshot = await adminDb
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        accountNumber: data.accountNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        createdAt: data.createdAt?.toDate().toISOString() || null,
      };
    });

    return successResponse({
      users,
      total: users.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Get admin users error:', error);
    return errorResponse(error.message || 'Failed to fetch users', 500, 'SERVER_ERROR');
  }
}
