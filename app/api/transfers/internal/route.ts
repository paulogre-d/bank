import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;
    const { fromAccountId, toAccountId, amount, frequency, scheduledDate, category } = await request.json();

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return errorResponse('Invalid request data. Amount must be positive', 400, 'VALIDATION_ERROR');
    }

    if (fromAccountId === toAccountId) {
      return errorResponse('Source and destination accounts cannot be the same', 400, 'VALIDATION_ERROR');
    }

    // Use Firestore transaction for atomic operations
    const result = await adminDb.runTransaction(async (transaction) => {
      // Get both accounts
      const fromAccountRef = adminDb.collection('accounts').doc(fromAccountId);
      const toAccountRef = adminDb.collection('accounts').doc(toAccountId);

      const fromAccountDoc = await transaction.get(fromAccountRef);
      const toAccountDoc = await transaction.get(toAccountRef);

      if (!fromAccountDoc.exists || !toAccountDoc.exists) {
        throw new Error('One or both accounts not found');
      }

      const fromAccount = fromAccountDoc.data()!;
      const toAccount = toAccountDoc.data()!;

      // Verify both accounts belong to the user
      if (fromAccount.userId !== uid || toAccount.userId !== uid) {
        throw new Error('Unauthorized: Account does not belong to user');
      }

      // Check account status
      if (fromAccount.status !== 'active' || toAccount.status !== 'active') {
        throw new Error('One or both accounts are not active');
      }

      // Check sufficient funds
      if (fromAccount.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Check daily transfer limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const transactionsSnapshot = await adminDb
        .collection('transactions')
        .where('fromAccountId', '==', fromAccountId)
        .where('status', '==', 'completed')
        .where('timestamp', '>=', Timestamp.fromDate(today))
        .get();

      const dailyTotal = transactionsSnapshot.docs.reduce(
        (sum, doc) => sum + Math.abs(doc.data().amount),
        0
      );

      const dailyLimit = fromAccount.dailyTransferLimit || Infinity;
      if (dailyTotal + amount > dailyLimit) {
        throw new Error(`Daily transfer limit exceeded. Limit: $${dailyLimit}, Used: $${dailyTotal}, Requested: $${amount}`);
      }

      // Update balances
      const newFromBalance = fromAccount.balance - amount;
      const newToBalance = (toAccount.balance || 0) + amount;

      transaction.update(fromAccountRef, {
        balance: newFromBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.update(toAccountRef, {
        balance: newToBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Generate reference ID
      const referenceId = `TRX-${Math.floor(1000 + Math.random() * 9000)}-${String(
        new Date().getFullYear()
      ).slice(-2)}`;

      const timestamp = FieldValue.serverTimestamp();

      // Get account names for merchant field
      const fromAccountName = fromAccount.name || 'Account';
      const toAccountName = toAccount.name || 'Account';

      const categoryValue = typeof category === 'string' && category.trim() ? category.trim() : 'transfer';
      // Create transaction record for source account
      const fromTransactionData = {
        referenceId,
        type: 'internal',
        fromAccountId,
        toAccountId,
        amount: -amount, // Negative for outgoing
        status: 'completed',
        frequency: frequency || 'One-time Transfer',
        scheduledDate: scheduledDate || null,
        merchant: `Transfer to ${toAccountName}`,
        category: categoryValue,
        timestamp,
        createdAt: timestamp,
      };

      const transactionRef = adminDb.collection('transactions').doc();
      transaction.set(transactionRef, fromTransactionData);

      // Create corresponding transaction for destination account
      const toTransactionData = {
        ...fromTransactionData,
        amount: amount, // Positive for incoming
        fromAccountId: toAccountId,
        toAccountId: fromAccountId,
        merchant: `Transfer from ${fromAccountName}`,
      };

      const toTransactionRef = adminDb.collection('transactions').doc();
      transaction.set(toTransactionRef, toTransactionData);

      return {
        transactionId: transactionRef.id,
        referenceId,
        fromAccount: {
          id: fromAccountId,
          newBalance: newFromBalance,
        },
        toAccount: {
          id: toAccountId,
          newBalance: newToBalance,
        },
        amount,
      };
    });

    return successResponse({
      ...result,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Internal transfer error:', error);
    const status = error.message.includes('Insufficient') || 
                   error.message.includes('limit') || 
                   error.message.includes('Unauthorized')
      ? 400
      : 500;
    const code = error.message.includes('Insufficient') 
      ? 'INSUFFICIENT_FUNDS' 
      : error.message.includes('limit')
      ? 'TRANSFER_LIMIT_EXCEEDED'
      : 'TRANSFER_ERROR';
    
    return errorResponse(
      error.message || 'Transfer failed',
      status,
      code
    );
  }
}
