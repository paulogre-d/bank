import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { userId } = await params;

    const accountsSnapshot = await adminDb
      .collection('accounts')
      .where('userId', '==', userId)
      .get();

    const accounts = accountsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        balance: data.balance || 0,
        lastFour: data.accountNumber?.slice(-4) || '',
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        status: data.status || 'active',
      };
    });

    return successResponse({ accounts });
  } catch (error: any) {
    console.error('Get user accounts error:', error);
    return errorResponse(error.message || 'Failed to fetch accounts', 500, 'SERVER_ERROR');
  }
}
