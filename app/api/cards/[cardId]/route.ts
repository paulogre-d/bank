import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;
    const { cardId } = await params;
    const body = await request.json();

    const cardRef = adminDb.collection('cards').doc(cardId);
    const cardDoc = await cardRef.get();

    if (!cardDoc.exists) {
      return errorResponse('Card not found', 404, 'NOT_FOUND');
    }

    const cardData = cardDoc.data()!;
    if (cardData.userId !== uid) {
      return errorResponse('Unauthorized', 403, 'FORBIDDEN');
    }

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

    if (body.status === 'frozen' || body.status === 'active') {
      updates.status = body.status;
    }

    if (body.pinSet === true) {
      updates.pinSet = true;
    }

    if (Object.keys(updates).length <= 1) {
      return errorResponse('No valid fields to update', 400, 'VALIDATION_ERROR');
    }

    await cardRef.update(updates);
    const updated = (await cardRef.get()).data()!;

    return successResponse({
      id: cardId,
      status: updated.status ?? cardData.status,
      pinSet: updated.pinSet ?? cardData.pinSet,
    });
  } catch (error: any) {
    console.error('Update card error:', error);
    return errorResponse(error.message || 'Failed to update card', 500, 'SERVER_ERROR');
  }
}
