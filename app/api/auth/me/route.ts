import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;
    if (!uid) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return errorResponse('User not found', 404, 'NOT_FOUND');
    }

    const userData = userDoc.data()!;

    return successResponse({
      uid: userData.uid,
      email: userData.email,
      accountNumber: userData.accountNumber,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || null,
      address: userData.address || null,
      avatarUrl: userData.avatarUrl || null,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return errorResponse(error.message || 'Failed to fetch user data', 500, 'SERVER_ERROR');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status || 401, 'UNAUTHORIZED');
    }

    const { uid } = authResult;
    if (!uid) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }
    const body = await request.json();

    const allowedKeys = ['firstName', 'lastName', 'phone', 'address', 'avatarUrl'] as const;
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        if (key === 'address') {
          const a = body[key];
          if (a && typeof a === 'object') {
            updates[key] = {
              street: a.street ?? '',
              city: a.city ?? '',
              state: a.state ?? '',
              zip: a.zip ?? '',
            };
          } else {
            updates[key] = null;
          }
        } else if (key === 'avatarUrl') {
          const v = body[key];
          updates[key] = typeof v === 'string' ? (v.trim() || null) : null;
        } else if (typeof body[key] === 'string') {
          updates[key] = body[key].trim() || null;
        }
      }
    }

    if (Object.keys(updates).length <= 1) {
      return errorResponse('No valid fields to update', 400, 'VALIDATION_ERROR');
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return errorResponse('User not found', 404, 'NOT_FOUND');
    }

    await userRef.update(updates);

    // Keep Firebase Auth photoURL in sync when avatarUrl is updated
    if (updates.avatarUrl !== undefined) {
      try {
        await adminAuth.updateUser(uid, { photoURL: (updates.avatarUrl as string) || undefined });
      } catch (e) {
        console.warn('Failed to update Auth photoURL:', e);
      }
    }

    const updated = (await userRef.get()).data()!;
    return successResponse({
      uid: updated.uid,
      email: updated.email,
      accountNumber: updated.accountNumber,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone || null,
      address: updated.address || null,
      avatarUrl: updated.avatarUrl || null,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return errorResponse(error.message || 'Failed to update profile', 500, 'SERVER_ERROR');
  }
}
