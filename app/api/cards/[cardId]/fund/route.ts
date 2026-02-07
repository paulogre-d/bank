import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;
    const { cardId } = await params;
    const { accountId, amount } = await request.json();

    if (!accountId || typeof amount !== 'number' || amount <= 0) {
      return errorResponse('accountId and positive amount required', 400, 'VALIDATION_ERROR');
    }

    const result = await adminDb.runTransaction(async (transaction) => {
      const cardRef = adminDb.collection('cards').doc(cardId);
      const accountRef = adminDb.collection('accounts').doc(accountId);

      const cardDoc = await transaction.get(cardRef);
      const accountDoc = await transaction.get(accountRef);

      if (!cardDoc.exists) throw new Error('Card not found');
      if (!accountDoc.exists) throw new Error('Account not found');

      const cardData = cardDoc.data()!;
      const accountData = accountDoc.data()!;

      if (cardData.userId !== uid) throw new Error('Unauthorized');
      if (accountData.userId !== uid) throw new Error('Account does not belong to you');

      const accountBalance = accountData.balance ?? 0;
      if (accountBalance < amount) throw new Error('Insufficient funds');

      const newAccountBalance = accountBalance - amount;
      const cardBalance = cardData.balance ?? 0;
      const newCardBalance = cardBalance + amount;

      transaction.update(accountRef, {
        balance: newAccountBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.update(cardRef, {
        balance: newCardBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { newAccountBalance, newCardBalance };
    });

    return successResponse(result);
  } catch (error: any) {
    const status =
      error.message === 'Card not found' || error.message === 'Account not found'
        ? 404
        : error.message === 'Unauthorized' || error.message === 'Account does not belong to you'
          ? 403
          : error.message === 'Insufficient funds' || error.message === 'accountId and positive amount required'
            ? 400
            : 500;
    return errorResponse(error.message || 'Failed to fund card', status, 'SERVER_ERROR');
  }
}
