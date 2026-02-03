import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { accountNumber } = await request.json();

    if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.length !== 12) {
      return errorResponse('Invalid account number format. Must be 12 digits', 400, 'VALIDATION_ERROR');
    }

    // Find account by account number
    const accountsSnapshot = await adminDb
      .collection('accounts')
      .where('accountNumber', '==', accountNumber)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      return errorResponse('Account not found', 404, 'NOT_FOUND');
    }

    const accountDoc = accountsSnapshot.docs[0];
    const account = accountDoc.data();

    // Check if account is active
    if (account.status !== 'active') {
      return errorResponse('Account is not active', 400, 'ACCOUNT_INACTIVE');
    }

    // Get user information
    const userDoc = await adminDb.collection('users').doc(account.userId).get();
    
    if (!userDoc.exists) {
      return errorResponse('User not found', 404, 'NOT_FOUND');
    }

    const user = userDoc.data()!;

    return successResponse({
      accountNumber,
      isValid: true,
      beneficiaryName: `${user.firstName} ${user.lastName}`,
      accountType: account.accountType,
    });
  } catch (error: any) {
    console.error('Validate beneficiary error:', error);
    return errorResponse(
      error.message || 'Validation failed',
      500,
      'VALIDATION_ERROR'
    );
  }
}
