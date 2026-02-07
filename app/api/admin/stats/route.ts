import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    // Get all users count
    const usersSnapshot = await adminDb.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Get all accounts and calculate total balance
    const accountsSnapshot = await adminDb.collection('accounts').get();
    let totalBalance = 0;
    let totalAccounts = 0;
    
    accountsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.accountType !== 'credit' && data.balance > 0) {
        totalBalance += data.balance || 0;
      }
      totalAccounts++;
    });

    // Get transactions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    const transactionsSnapshot = await adminDb
      .collection('transactions')
      .where('timestamp', '>=', todayStr)
      .get();
    
    const transactionsToday = transactionsSnapshot.size;

    return successResponse({
      totalUsers,
      totalAccounts,
      totalBalance: Math.round(totalBalance * 100) / 100, // Round to 2 decimals
      transactionsToday,
    });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    return errorResponse(error.message || 'Failed to fetch stats', 500, 'SERVER_ERROR');
  }
}
