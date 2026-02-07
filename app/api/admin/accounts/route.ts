import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { adminDb } from '@/lib/firebase/admin';
import { generateAccountNumber } from '@/lib/utils/accountNumber';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { userId, accountType, name } = await request.json();

    if (!userId || !accountType) {
      return errorResponse('userId and accountType required', 400, 'VALIDATION_ERROR');
    }

    if (!['checking', 'savings', 'credit'].includes(accountType)) {
      return errorResponse('Invalid account type', 400, 'VALIDATION_ERROR');
    }

    // Verify user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return errorResponse('User not found', 404, 'NOT_FOUND');
    }

    // Generate unique account number
    const accountNumber = await generateAccountNumber();

    const accountName = name || 
      (accountType === 'checking' ? 'Premium Checking' : 
       accountType === 'savings' ? 'High Yield Savings' : 
       'Credit Card');

    const accountData = {
      userId,
      accountNumber,
      name: accountName,
      accountType,
      balance: accountType === 'credit' ? 0 : 0,
      routingNumber: '123456789',
      interestRate: accountType === 'savings' ? 4.25 : accountType === 'checking' ? 0.05 : undefined,
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

    return successResponse({
      id: accountRef.id,
      accountNumber,
      name: accountName,
      accountType,
      balance: 0,
      status: 'active',
    }, 201);
  } catch (error: any) {
    console.error('Create admin account error:', error);
    return errorResponse(error.message || 'Failed to create account', 500, 'SERVER_ERROR');
  }
}
