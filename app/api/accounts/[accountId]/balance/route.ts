import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue } from 'firebase-admin/firestore';

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
      accountId,
      balance: accountData.balance || 0,
      availableBalance: accountData.balance || 0,
      currency: 'USD',
      lastUpdated: accountData.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get balance error:', error);
    return errorResponse(error.message || 'Failed to fetch balance', 500, 'SERVER_ERROR');
  }
}

export async function PATCH(
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
    const { amount, transactionType, referenceId } = await request.json();

    if (typeof amount !== 'number') {
      return errorResponse('Invalid amount', 400, 'VALIDATION_ERROR');
    }

    // Use Firestore transaction for atomic update
    const result = await adminDb.runTransaction(async (transaction) => {
      const accountRef = adminDb.collection('accounts').doc(accountId);
      const accountDoc = await transaction.get(accountRef);

      if (!accountDoc.exists) {
        throw new Error('Account not found');
      }

      const accountData = accountDoc.data()!;

      // Verify account belongs to user
      if (accountData.userId !== uid) {
        throw new Error('Unauthorized: Account does not belong to user');
      }

      const previousBalance = accountData.balance || 0;
      const newBalance = previousBalance + amount;

      // Check for insufficient funds if deducting
      if (amount < 0 && newBalance < 0 && !accountData.overdraftLimit) {
        throw new Error('Insufficient funds');
      }

      // Check overdraft limit
      if (amount < 0 && accountData.overdraftLimit) {
        const overdraftAmount = Math.abs(Math.min(0, newBalance));
        if (overdraftAmount > accountData.overdraftLimit) {
          throw new Error('Overdraft limit exceeded');
        }
      }

      transaction.update(accountRef, {
        balance: newBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        accountId,
        previousBalance,
        newBalance,
        amount,
      };
    });

    return successResponse(result);
  } catch (error: any) {
    console.error('Update balance error:', error);
    const status = error.message.includes('Insufficient') || error.message.includes('Overdraft')
      ? 400
      : 500;
    return errorResponse(
      error.message || 'Failed to update balance',
      status,
      error.message.includes('Insufficient') ? 'INSUFFICIENT_FUNDS' : 'SERVER_ERROR'
    );
  }
}
