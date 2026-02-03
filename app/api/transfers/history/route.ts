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
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get user's account IDs
    let accountIds: string[] = [];
    
    if (accountId) {
      // Verify account belongs to user
      const accountDoc = await adminDb.collection('accounts').doc(accountId).get();
      if (!accountDoc.exists) {
        return errorResponse('Account not found', 404, 'NOT_FOUND');
      }
      if (accountDoc.data()!.userId !== uid) {
        return errorResponse('Unauthorized: Account does not belong to user', 403, 'FORBIDDEN');
      }
      accountIds = [accountId];
    } else {
      // Get all user accounts
      const accountsSnapshot = await adminDb
        .collection('accounts')
        .where('userId', '==', uid)
        .get();
      accountIds = accountsSnapshot.docs.map((doc) => doc.id);
    }

    if (accountIds.length === 0) {
      return successResponse({
        transactions: [],
        total: 0,
        limit,
        offset,
      });
    }

    // Fetch transactions (both incoming and outgoing)
    // Note: Firestore 'in' queries are limited to 10 items, so we need to handle this differently
    // For now, we'll fetch transactions where the account is the source
    let transactionsQuery = adminDb
      .collection('transactions')
      .where('fromAccountId', 'in', accountIds.slice(0, 10))
      .orderBy('timestamp', 'desc')
      .limit(limit + offset);

    const transactionsSnapshot = await transactionsQuery.get();
    
    // Also fetch incoming transactions
    let incomingQuery = adminDb
      .collection('transactions')
      .where('toAccountId', 'in', accountIds.slice(0, 10))
      .orderBy('timestamp', 'desc')
      .limit(limit + offset);

    const incomingSnapshot = await incomingQuery.get();

    // Combine and sort transactions
    const allTransactions = [
      ...transactionsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id, source: 'outgoing' })),
      ...incomingSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id, source: 'incoming' })),
    ].sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(0);
      const bTime = b.timestamp?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });

    // Apply pagination
    const paginatedTransactions = allTransactions.slice(offset, offset + limit);

    // Get account details for transactions
    const transactions = await Promise.all(
      paginatedTransactions.map(async (tx) => {
        const fromAccountDoc = await adminDb.collection('accounts').doc(tx.fromAccountId).get();
        const toAccountDoc = tx.toAccountId 
          ? await adminDb.collection('accounts').doc(tx.toAccountId).get()
          : null;

        return {
          id: tx.id,
          referenceId: tx.referenceId,
          type: tx.type,
          fromAccount: {
            id: tx.fromAccountId,
            lastFour: fromAccountDoc.data()?.accountNumber?.slice(-4) || '',
          },
          toAccount: tx.toAccountId
            ? {
                id: tx.toAccountId,
                lastFour: toAccountDoc?.data()?.accountNumber?.slice(-4) || '',
              }
            : tx.toAccountNumber
            ? {
                accountNumber: tx.toAccountNumber,
              }
            : null,
          amount: tx.amount,
          status: tx.status,
          timestamp: tx.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      })
    );

    return successResponse({
      transactions,
      total: allTransactions.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Get transfer history error:', error);
    return errorResponse(error.message || 'Failed to fetch transfer history', 500, 'SERVER_ERROR');
  }
}
