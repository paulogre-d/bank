import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue } from 'firebase-admin/firestore';

function generateCardNumber(): string {
  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12, 16)}`;
}

function generateExpiryThreeYears(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 3);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

function generateCvv(): string {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { userId, name } = await request.json();

    if (!userId) {
      return errorResponse('userId required', 400, 'VALIDATION_ERROR');
    }

    // Verify user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return errorResponse('User not found', 404, 'NOT_FOUND');
    }

    const userData = userDoc.data()!;
    const cardHolder = `${userData.firstName} ${userData.lastName}`;

    const cardData = {
      userId,
      name: name || 'Visa Infinite',
      cardNumber: generateCardNumber(),
      cardHolder,
      expiry: generateExpiryThreeYears(),
      cvv: generateCvv(),
      status: 'active',
      balance: 0,
      limit: 25000,
      onlineUsed: 0,
      onlineLimit: 5000,
      atmUsed: 0,
      atmLimit: 500,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const cardRef = await adminDb.collection('cards').add(cardData);
    const cardDoc = await cardRef.get();

    return successResponse({
      id: cardDoc.id,
      name: cardData.name,
      cardNumber: cardData.cardNumber,
      cardHolder: cardData.cardHolder,
      expiry: cardData.expiry,
      cvv: cardData.cvv,
      status: cardData.status,
    }, 201);
  } catch (error: any) {
    console.error('Create admin card error:', error);
    return errorResponse(error.message || 'Failed to create card', 500, 'SERVER_ERROR');
  }
}
