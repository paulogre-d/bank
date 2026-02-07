import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const accountId = searchParams.get('accountId');

    let transactionsSnapshot;
    if (accountId) {
      // Use equality-only queries (no orderBy) to avoid requiring composite indexes
      const [fromSnap, toSnap] = await Promise.all([
        adminDb
          .collection('transactions')
          .where('fromAccountId', '==', accountId)
          .limit(limit * 2)
          .get(),
        adminDb
          .collection('transactions')
          .where('toAccountId', '==', accountId)
          .limit(limit * 2)
          .get(),
      ]);
      const fromIds = new Set(fromSnap.docs.map((d) => d.id));
      const combined = [
        ...fromSnap.docs,
        ...toSnap.docs.filter((d) => !fromIds.has(d.id)),
      ];
      combined.sort((a, b) => {
        const aTs = a.data().timestamp?.toDate?.()?.getTime() ?? 0;
        const bTs = b.data().timestamp?.toDate?.()?.getTime() ?? 0;
        return bTs - aTs;
      });
      transactionsSnapshot = { docs: combined.slice(0, limit) };
    } else {
      transactionsSnapshot = await adminDb
        .collection('transactions')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
    }

    const transactions = await Promise.all(
      transactionsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get account details
        let fromAccount = null;
        let toAccount = null;
        
        if (data.fromAccountId) {
          const fromAccountDoc = await adminDb.collection('accounts').doc(data.fromAccountId).get();
          if (fromAccountDoc.exists) {
            const accData = fromAccountDoc.data()!;
            fromAccount = {
              id: fromAccountDoc.id,
              lastFour: accData.accountNumber?.slice(-4) || '',
            };
          }
        }
        
        if (data.toAccountId) {
          const toAccountDoc = await adminDb.collection('accounts').doc(data.toAccountId).get();
          if (toAccountDoc.exists) {
            const accData = toAccountDoc.data()!;
            toAccount = {
              id: toAccountDoc.id,
              lastFour: accData.accountNumber?.slice(-4) || '',
            };
          }
        }

        // Handle timestamp - could be string, Firestore Timestamp, or Date
        let timestamp: string;
        if (data.timestamp) {
          if (typeof data.timestamp === 'string') {
            timestamp = data.timestamp;
          } else if (data.timestamp.toDate) {
            // Firestore Timestamp
            timestamp = data.timestamp.toDate().toISOString();
          } else if (data.timestamp instanceof Date) {
            timestamp = data.timestamp.toISOString();
          } else {
            timestamp = doc.createTime.toDate().toISOString();
          }
        } else {
          timestamp = doc.createTime.toDate().toISOString();
        }

        return {
          id: doc.id,
          referenceId: data.referenceId || '',
          type: data.type || 'internal',
          fromAccountId: data.fromAccountId || null,
          toAccountId: data.toAccountId || null,
          fromAccount,
          toAccount,
          amount: data.amount || 0,
          status: data.status || 'completed',
          merchant: data.merchant || null,
          category: data.category || 'transfer',
          timestamp,
        };
      })
    );

    return successResponse({
      transactions,
      total: transactions.length,
      limit,
    });
  } catch (error: any) {
    console.error('Get admin transactions error:', error);
    return errorResponse(error.message || 'Failed to fetch transactions', 500, 'SERVER_ERROR');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const body = await request.json();
    const {
      accountId,
      amount: rawAmount,
      timestamp: timestampInput,
      type = 'internal',
      merchant = '',
      category = 'Transfer',
      referenceId: refId,
      status = 'completed',
    } = body;

    if (!accountId || typeof accountId !== 'string') {
      return errorResponse('accountId is required', 400, 'VALIDATION_ERROR');
    }
    const amount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount);
    if (isNaN(amount) || amount === 0) {
      return errorResponse('amount must be a non-zero number', 400, 'VALIDATION_ERROR');
    }

    const validTypes = ['internal', 'send-to-person', 'bill-payment', 'wire-transfer'];
    if (!validTypes.includes(type)) {
      return errorResponse('Invalid transaction type', 400, 'VALIDATION_ERROR');
    }
    const validStatuses = ['completed', 'pending', 'failed'];
    if (!validStatuses.includes(status)) {
      return errorResponse('Invalid status', 400, 'VALIDATION_ERROR');
    }

    let timestamp: Date;
    if (timestampInput) {
      timestamp = new Date(timestampInput);
      if (Number.isNaN(timestamp.getTime())) {
        return errorResponse('Invalid date/time', 400, 'VALIDATION_ERROR');
      }
    } else {
      timestamp = new Date();
    }

    const referenceId =
      typeof refId === 'string' && refId.trim()
        ? refId.trim()
        : `TRX-${Math.floor(1000 + Math.random() * 9000)}-${String(timestamp.getFullYear()).slice(-2)}`;

    const accountRef = adminDb.collection('accounts').doc(accountId);
    const accountDoc = await accountRef.get();
    if (!accountDoc.exists) {
      return errorResponse('Account not found', 404, 'NOT_FOUND');
    }

    const accountData = accountDoc.data()!;
    const currentBalance = accountData.balance ?? 0;

    if (status === 'completed') {
      const newBalance = currentBalance + amount;
      if (amount < 0 && accountData.accountType !== 'credit' && newBalance < 0) {
        const overdraft = accountData.overdraftLimit ?? 0;
        if (newBalance < -overdraft) {
          return errorResponse(
            `Insufficient funds. Balance would be $${newBalance.toFixed(2)}.`,
            400,
            'VALIDATION_ERROR'
          );
        }
      }
    }

    const transactionRef = adminDb.collection('transactions').doc();
    const timestampFs = Timestamp.fromDate(timestamp);

    await adminDb.runTransaction(async (tx) => {
      const txData = {
        referenceId,
        type,
        fromAccountId: accountId,
        toAccountId: null,
        amount,
        status,
        merchant: merchant || 'Manual entry',
        category: category || 'Transfer',
        timestamp: timestampFs,
        createdAt: timestampFs,
      };
      tx.set(transactionRef, txData);

      if (status === 'completed') {
        const newBalance = currentBalance + amount;
        tx.update(accountRef, {
          balance: newBalance,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return successResponse({
      id: transactionRef.id,
      referenceId,
      accountId,
      amount,
      timestamp: timestamp.toISOString(),
      status,
    });
  } catch (error: any) {
    console.error('Create admin transaction error:', error);
    return errorResponse(
      error.message || 'Failed to create transaction',
      error.status || 500,
      'SERVER_ERROR'
    );
  }
}
