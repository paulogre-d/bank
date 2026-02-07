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

    const cardsSnapshot = await adminDb
      .collection('cards')
      .where('userId', '==', uid)
      .get();

    const cards = cardsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        cardNumber: data.cardNumber,
        cardHolder: data.cardHolder,
        expiry: data.expiry,
        status: data.status || 'active',
        balance: data.balance ?? 0,
        limit: data.limit ?? 0,
        onlineUsed: data.onlineUsed ?? 0,
        onlineLimit: data.onlineLimit ?? 5000,
        atmUsed: data.atmUsed ?? 0,
        atmLimit: data.atmLimit ?? 500,
      };
    });

    return successResponse({ cards });
  } catch (error: any) {
    console.error('Get cards error:', error);
    return errorResponse(error.message || 'Failed to fetch cards', 500, 'SERVER_ERROR');
  }
}
