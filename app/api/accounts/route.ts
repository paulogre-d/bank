import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
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
        routingNumber: data.routingNumber || null,
        interestRate: data.interestRate || null,
        openedDate: data.openedDate || null,
        accountType: data.accountType,
        ownership: data.ownership || 'Individual',
        monthlyFee: data.monthlyFee || 0,
        overdraftLimit: data.overdraftLimit || null,
        dailyTransferLimit: data.dailyTransferLimit || null,
        status: data.status || 'active',
      };
    });

    return successResponse(accounts);
  } catch (error: any) {
    console.error('Get accounts error:', error);
    return errorResponse(error.message || 'Failed to fetch accounts', 500, 'SERVER_ERROR');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;
    if (!uid) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }
    const { accountType, name } = await request.json();

    if (!accountType || !['checking', 'savings'].includes(accountType)) {
      return errorResponse('Invalid account type. Must be "checking" or "savings"', 400, 'VALIDATION_ERROR');
    }

    // Generate unique account number
    const { generateAccountNumber } = await import('@/lib/utils/accountNumber');
    const accountNumber = await generateAccountNumber();

    // Get user data to ensure they exist
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return errorResponse('User not found', 404, 'NOT_FOUND');
    }

    const accountName = name || (accountType === 'checking' ? 'Premium Checking' : 'High Yield Savings');
    const accountData = {
      userId: uid,
      accountNumber,
      name: accountName,
      accountType,
      balance: 0.00,
      routingNumber: '123456789',
      interestRate: accountType === 'savings' ? 4.25 : 0.05,
      openedDate: new Date().toISOString(),
      ownership: 'Individual',
      monthlyFee: 0.00,
      overdraftLimit: accountType === 'checking' ? 500.00 : null,
      dailyTransferLimit: accountType === 'checking' ? 5000.00 : 10000.00,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const accountRef = await adminDb.collection('accounts').add(accountData);

    return successResponse(
      {
        id: accountRef.id,
        accountNumber,
        name: accountName,
        balance: 0.00,
        accountType,
        status: 'active',
      },
      201
    );
  } catch (error: any) {
    console.error('Create account error:', error);
    return errorResponse(error.message || 'Failed to create account', 500, 'SERVER_ERROR');
  }
}
