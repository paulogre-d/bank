import { NextRequest } from 'next/server';
import { adminAuth } from '../firebase/admin';

/**
 * Verify admin authentication and check for admin custom claim or allowed email.
 */
export async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check for admin custom claim (user must sign out/in after claim is set to get it in token)
    const hasAdminClaim = decodedToken.admin === true;
    const adminEmails = (process.env.ADMIN_EMAIL ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const emailMatch =
      decodedToken.email &&
      adminEmails.includes(decodedToken.email.trim().toLowerCase());

    if (!hasAdminClaim && !emailMatch) {
      return { error: 'Forbidden: Admin access required', status: 403 };
    }

    return { uid: decodedToken.uid, email: decodedToken.email, error: null };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}
