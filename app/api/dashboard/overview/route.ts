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

    // Calculate last month (simplified - last 30 days) and build byDay / byWeek / byMonth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    let lastMonth = 0;
    const byDay: { label: string; value: number }[] = [];
    const byWeek: { label: string; value: number }[] = [];
    const byMonth: { label: string; value: number }[] = [];

    if (accountIds.length > 0) {
      const monthlyTransactionsSnapshot = await adminDb
        .collection('transactions')
        .where('fromAccountId', 'in', accountIds.slice(0, 10))
        .where('amount', '<', 0)
        .where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo))
        .get();

      lastMonth = Math.abs(
        monthlyTransactionsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)
      );

      // Build byDay: last 7 days (Sun–Sat labels)
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayTotals: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString().split('T')[0];
        dayTotals[key] = 0;
      }
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
      monthlyTransactionsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const ts = data.timestamp?.toDate?.();
        if (!ts) return;
        const key = ts.toISOString().split('T')[0];
        if (key >= sevenDaysAgoStr && dayTotals[key] !== undefined) {
          dayTotals[key] += Math.abs(data.amount);
        }
      });
      const sortedDayKeys = Object.keys(dayTotals).sort();
      sortedDayKeys.forEach((key) => {
        const d = new Date(key + 'T12:00:00');
        byDay.push({ label: dayLabels[d.getDay()], value: Math.round(dayTotals[key] * 100) / 100 });
      });

      // Build byWeek: last 4 weeks
      const weekStarts: string[] = [];
      for (let w = 3; w >= 0; w--) {
        const d = new Date();
        d.setDate(d.getDate() - w * 7);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString().split('T')[0];
        weekStarts.push(key);
      }
      const weekTotals: Record<string, number> = {};
      weekStarts.forEach((k) => (weekTotals[k] = 0));
      const thirtyDaysAgoTime = thirtyDaysAgo.getTime();
      monthlyTransactionsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const ts = data.timestamp?.toDate?.();
        if (!ts) return;
        const daysSinceStart = Math.floor((ts.getTime() - thirtyDaysAgoTime) / 86400000);
        const weekIndex = Math.min(3, Math.floor(daysSinceStart / 7));
        const weekKey = weekStarts[weekIndex];
        if (weekTotals[weekKey] !== undefined) {
          weekTotals[weekKey] += Math.abs(data.amount);
        }
      });
      weekStarts.forEach((key) => {
        const d = new Date(key + 'T12:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        byWeek.push({ label, value: Math.round(weekTotals[key] * 100) / 100 });
      });

      // Build byMonth: last 12 months
      const yearTransactionsSnapshot = await adminDb
        .collection('transactions')
        .where('fromAccountId', 'in', accountIds.slice(0, 10))
        .where('amount', '<', 0)
        .where('timestamp', '>=', Timestamp.fromDate(oneYearAgo))
        .get();

      const monthKeys: string[] = [];
      for (let m = 11; m >= 0; m--) {
        const d = new Date();
        d.setMonth(d.getMonth() - m);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        monthKeys.push(d.toISOString().slice(0, 7)); // YYYY-MM
      }
      const monthTotals: Record<string, number> = {};
      monthKeys.forEach((k) => (monthTotals[k] = 0));
      yearTransactionsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const ts = data.timestamp?.toDate?.();
        if (!ts) return;
        const key = ts.toISOString().slice(0, 7);
        if (monthTotals[key] !== undefined) {
          monthTotals[key] += Math.abs(data.amount);
        }
      });
      monthKeys.forEach((key) => {
        const [y, m] = key.split('-').map(Number);
        const label = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
        byMonth.push({ label, value: Math.round(monthTotals[key] * 100) / 100 });
      });
    }

    // If no accounts, fill chart placeholders
    if (byDay.length === 0) {
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date().getDay();
      for (let i = 6; i >= 0; i--) {
        const idx = (today - i + 7) % 7;
        byDay.push({ label: dayLabels[idx], value: 0 });
      }
    }
    if (byWeek.length === 0) {
      for (let w = 3; w >= 0; w--) {
        const d = new Date();
        d.setDate(d.getDate() - w * 7);
        byWeek.push({ label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: 0 });
      }
    }
    if (byMonth.length === 0) {
      for (let m = 11; m >= 0; m--) {
        const d = new Date();
        d.setMonth(d.getMonth() - m);
        byMonth.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), value: 0 });
      }
    }

    return successResponse({
      totalBalance,
      accounts,
      recentTransactions,
      spendingAnalytics: {
        thisWeek,
        lastMonth,
        byDay,
        byWeek,
        byMonth,
      },
    });
  } catch (error: any) {
    console.error('Dashboard overview error:', error);
    return errorResponse(error.message || 'Failed to fetch dashboard data', 500, 'SERVER_ERROR');
  }
}
