/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const { fromAccountId, toAccountNumber, amount, frequency, scheduledDate, category } =
      await request.json();

    if (!fromAccountId || !toAccountNumber || !amount || amount <= 0) {
      return errorResponse('Invalid request data. Amount must be positive', 400, 'VALIDATION_ERROR');
    }

    if (typeof toAccountNumber !== 'string' || toAccountNumber.length !== 12) {
      return errorResponse('Invalid account number format. Must be 12 digits', 400, 'VALIDATION_ERROR');
    }

    // Find beneficiary account
    const beneficiaryAccountsSnapshot = await adminDb
      .collection('accounts')
      .where('accountNumber', '==', toAccountNumber)
      .limit(1)
      .get();

    if (beneficiaryAccountsSnapshot.empty) {
      return errorResponse('Beneficiary account not found', 404, 'NOT_FOUND');
    }

    const beneficiaryAccountDoc = beneficiaryAccountsSnapshot.docs[0];
    const beneficiaryAccount = beneficiaryAccountDoc.data();
    const toAccountId = beneficiaryAccountDoc.id;

    // Check if beneficiary account is active
    if (beneficiaryAccount.status !== 'active') {
      return errorResponse('Beneficiary account is not active', 400, 'ACCOUNT_INACTIVE');
    }

    // Prevent self-transfer
    if (beneficiaryAccount.userId === uid) {
      return errorResponse('Cannot transfer to your own account. Use internal transfer instead', 400, 'VALIDATION_ERROR');
    }

    // Get beneficiary user info
    const beneficiaryUserDoc = await adminDb
      .collection('users')
      .doc(beneficiaryAccount.userId)
      .get();
    
    if (!beneficiaryUserDoc.exists) {
      return errorResponse('Beneficiary user not found', 404, 'NOT_FOUND');
    }

    const beneficiaryUser = beneficiaryUserDoc.data()!;

    // Use Firestore transaction
    const result = await adminDb.runTransaction(async (transaction) => {
      const fromAccountRef = adminDb.collection('accounts').doc(fromAccountId);
      const toAccountRef = adminDb.collection('accounts').doc(toAccountId);

      const fromAccountDoc = await transaction.get(fromAccountRef);
      const toAccountDoc = await transaction.get(toAccountRef);

      if (!fromAccountDoc.exists) {
        throw new Error('Source account not found');
      }

      const fromAccount = fromAccountDoc.data()!;

      // Verify source account belongs to user
      if (fromAccount.userId !== uid) {
        throw new Error('Unauthorized: Account does not belong to user');
      }

      // Check account status
      if (fromAccount.status !== 'active') {
        throw new Error('Source account is not active');
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
      const newToBalance = (toAccountDoc.data()?.balance || 0) + amount;

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
      const beneficiaryName = `${beneficiaryUser.firstName} ${beneficiaryUser.lastName}`;

      const categoryValue = typeof category === 'string' && category.trim() ? category.trim() : 'transfer';
      // Create transaction records
      const fromTransactionData = {
        referenceId,
        type: 'send-to-person',
        fromAccountId,
        toAccountId,
        toAccountNumber,
        amount: -amount,
        status: 'completed',
        frequency: frequency || 'One-time Transfer',
        scheduledDate: scheduledDate || null,
        merchant: `Transfer to ${beneficiaryName}`,
        category: categoryValue,
        timestamp,
        createdAt: timestamp,
      };

      const toTransactionData = {
        ...fromTransactionData,
        amount: amount,
        fromAccountId: toAccountId,
        toAccountId: fromAccountId,
        fromAccountNumber: fromAccount.accountNumber,
        merchant: `Transfer from ${fromAccountName}`,
      };

      const fromTransactionRef = adminDb.collection('transactions').doc();
      const toTransactionRef = adminDb.collection('transactions').doc();

      transaction.set(fromTransactionRef, fromTransactionData);
      transaction.set(toTransactionRef, toTransactionData);

      return {
        transactionId: fromTransactionRef.id,
        referenceId,
        fromAccount: {
          id: fromAccountId,
          newBalance: newFromBalance,
        },
        toAccount: {
          accountNumber: toAccountNumber,
          beneficiaryName: `${beneficiaryUser.firstName} ${beneficiaryUser.lastName}`,
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
    console.error('Send to person error:', error);
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
