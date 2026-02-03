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
    // Note: Firestore 'in' queries are limited to 10 items
    // We fetch without orderBy to avoid composite index requirement, then sort in memory
    let outgoingTransactions: any[] = [];
    let incomingTransactions: any[] = [];

    if (accountIds.length > 0) {
      // Fetch outgoing transactions (where account is source)
      const outgoingQuery = adminDb
        .collection('transactions')
        .where('fromAccountId', 'in', accountIds.slice(0, 10))
        .limit(100); // Fetch more to ensure we have enough after sorting

      const outgoingSnapshot = await outgoingQuery.get();
      outgoingTransactions = outgoingSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        source: 'outgoing',
      }));

      // Fetch incoming transactions (where account is destination)
      const incomingQuery = adminDb
        .collection('transactions')
        .where('toAccountId', 'in', accountIds.slice(0, 10))
        .limit(100);

      const incomingSnapshot = await incomingQuery.get();
      incomingTransactions = incomingSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        source: 'incoming',
      }));
    }

    // Combine and sort transactions by timestamp
    const combined = [...outgoingTransactions, ...incomingTransactions].sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(0);
      const bTime = b.timestamp?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });

    // Deduplicate by referenceId: each transfer creates two records (sender + receiver).
    // Show one row per transfer by keeping the first occurrence of each referenceId.
    const seenRefIds = new Set<string>();
    const allTransactions = combined.filter((tx) => {
      const refId = tx.referenceId ?? tx.id;
      if (seenRefIds.has(refId)) return false;
      seenRefIds.add(refId);
      return true;
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
          merchant: tx.merchant || 'Transfer',
          category: tx.category || 'transfer',
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
