import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;

    // Fetch all accounts for the user
    const accountsSnapshot = await adminDb
      .collection('accounts')
      .where('userId', '==', uid)
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
      };
    });

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Get account IDs for transaction queries
    const accountIds = accounts.map((acc) => acc.id);

    // Fetch recent transactions (last 10)
    // Note: Firestore 'in' queries are limited to 10 items
    // We fetch without orderBy to avoid composite index requirement, then sort in memory
    let recentTransactions: any[] = [];
    
    if (accountIds.length > 0) {
      const transactionsQuery = adminDb
        .collection('transactions')
        .where('fromAccountId', 'in', accountIds.slice(0, 10))
        .limit(50); // Fetch more to ensure we have enough after sorting

      const transactionsSnapshot = await transactionsQuery.get();
      
      recentTransactions = await Promise.all(
        transactionsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.() || new Date();
          return {
            id: doc.id,
            merchant: data.merchant || 'Transfer',
            date: timestamp.toISOString().split('T')[0],
            amount: data.amount,
            category: data.category || 'Transfer',
            accountId: data.fromAccountId,
            timestamp: timestamp.getTime(), // Add timestamp for sorting
          };
        })
      );

      // Sort by timestamp descending and take top 10
      recentTransactions.sort((a, b) => b.timestamp - a.timestamp);
      recentTransactions = recentTransactions.slice(0, 10);
      
      // Remove timestamp from final result
      recentTransactions = recentTransactions.map(({ timestamp, ...rest }) => rest);
    }

    // Calculate spending analytics (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let thisWeek = 0;
    if (accountIds.length > 0) {
      const weeklyTransactionsSnapshot = await adminDb
        .collection('transactions')
        .where('fromAccountId', 'in', accountIds.slice(0, 10))
        .where('amount', '<', 0) // Only outgoing transactions
        .where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
        .get();

      thisWeek = Math.abs(
        weeklyTransactionsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)
      );
    }

    // Calculate last month (simplified - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    let lastMonth = 0;
    if (accountIds.length > 0) {
      const monthlyTransactionsSnapshot = await adminDb
        .collection('transactions')
        .where('fromAccountId', 'in', accountIds.slice(0, 10))
        .where('amount', '<', 0) // Only outgoing transactions
        .where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo))
        .get();

      lastMonth = Math.abs(
        monthlyTransactionsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)
      );
    }

    return successResponse({
      totalBalance,
      accounts,
      recentTransactions,
      spendingAnalytics: {
        thisWeek,
        lastMonth,
      },
    });
  } catch (error: any) {
    console.error('Dashboard overview error:', error);
    return errorResponse(error.message || 'Failed to fetch dashboard data', 500, 'SERVER_ERROR');
  }
}
