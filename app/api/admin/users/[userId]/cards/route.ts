import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { userId } = await params;

    const cardsSnapshot = await adminDb
      .collection('cards')
      .where('userId', '==', userId)
      .get();

    const cards = cardsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        cardNumber: data.cardNumber,
        cardHolder: data.cardHolder,
        expiry: data.expiry,
        cvv: data.cvv,
        status: data.status || 'active',
      };
    });

    return successResponse({ cards });
  } catch (error: any) {
    console.error('Get user cards error:', error);
    return errorResponse(error.message || 'Failed to fetch cards', 500, 'SERVER_ERROR');
  }
}
