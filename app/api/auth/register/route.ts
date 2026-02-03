import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { generateAccountNumber } from '@/lib/utils/accountNumber';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue } from 'firebase-admin/firestore';
import { sendWelcomeEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      ssn,
      email,
      phone,
      address,
      accountType,
      password,
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !accountType) {
      return errorResponse('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    // Validate account type
    if (!['checking', 'savings'].includes(accountType)) {
      return errorResponse('Invalid account type. Must be "checking" or "savings"', 400, 'VALIDATION_ERROR');
    }

    // Check if email already exists
    try {
      await adminAuth.getUserByEmail(email);
      return errorResponse('Email already exists', 400, 'EMAIL_EXISTS');
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Generate unique 12-digit account number
    const accountNumber = await generateAccountNumber();

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      accountNumber,
      email,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      ssn: ssn || null, // In production, encrypt this
      phone: phone || null,
      address: address || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userData);

    // Create initial account
    const accountName = accountType === 'checking' ? 'Premium Checking' : 'High Yield Savings';
    const accountData = {
      userId: userRecord.uid,
      accountNumber,
      name: accountName,
      accountType,
      balance: 0.00,
      routingNumber: '123456789', // Default routing number
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

    // Send welcome email with account number (non-blocking)
    sendWelcomeEmail({
      to: email,
      firstName,
      accountNumber,
      accountType,
    }).then((result) => {
      if (!result.ok) {
        console.error('[register] Welcome email failed:', result.error);
      }
    });

    return successResponse(
      {
        uid: userRecord.uid,
        accountNumber,
        email,
        accountId: accountRef.id,
        message: 'Account created successfully',
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse(error.message || 'Registration failed', 500, 'REGISTRATION_ERROR');
  }
}
