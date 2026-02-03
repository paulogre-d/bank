import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;
    const { accountId } = params;

    const accountDoc = await adminDb.collection('accounts').doc(accountId).get();

    if (!accountDoc.exists) {
      return errorResponse('Account not found', 404, 'NOT_FOUND');
    }

    const accountData = accountDoc.data()!;

    // Verify account belongs to user
    if (accountData.userId !== uid) {
      return errorResponse('Unauthorized: Account does not belong to user', 403, 'FORBIDDEN');
    }

    return successResponse({
      id: accountDoc.id,
      name: accountData.name,
      balance: accountData.balance || 0,
      lastFour: accountData.accountNumber?.slice(-4) || '',
      accountNumber: accountData.accountNumber,
      routingNumber: accountData.routingNumber || null,
      interestRate: accountData.interestRate || null,
      openedDate: accountData.openedDate || null,
      accountType: accountData.accountType,
      ownership: accountData.ownership || 'Individual',
      monthlyFee: accountData.monthlyFee || 0,
      overdraftLimit: accountData.overdraftLimit || null,
      dailyTransferLimit: accountData.dailyTransferLimit || null,
      status: accountData.status || 'active',
    });
  } catch (error: any) {
    console.error('Get account error:', error);
    return errorResponse(error.message || 'Failed to fetch account', 500, 'SERVER_ERROR');
  }
}
