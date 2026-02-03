import { NextRequest } from 'next/server';
import { adminAuth } from '../firebase/admin';

export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { uid: decodedToken.uid, error: null };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}
