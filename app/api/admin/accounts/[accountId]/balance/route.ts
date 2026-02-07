import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { accountId } = await params;
    const { balance } = await request.json();

    if (typeof balance !== 'number') {
      return errorResponse('Invalid balance', 400, 'VALIDATION_ERROR');
    }

    const accountRef = adminDb.collection('accounts').doc(accountId);
    const accountDoc = await accountRef.get();

    if (!accountDoc.exists) {
      return errorResponse('Account not found', 404, 'NOT_FOUND');
    }

    await accountRef.update({
      balance,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updated = (await accountRef.get()).data()!;

    return successResponse({
      accountId,
      balance: updated.balance || 0,
      name: updated.name,
      accountNumber: updated.accountNumber,
    });
  } catch (error: any) {
    console.error('Update admin account balance error:', error);
    return errorResponse(error.message || 'Failed to update balance', 500, 'SERVER_ERROR');
  }
}
