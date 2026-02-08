/* eslint-disable prefer-const */
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} else {
  app = getApps()[0];
}

adminDb = getFirestore(app);
adminAuth = getAuth(app);

export { adminDb, adminAuth };

// Export admin object for compatibility
export const admin = {
  firestore: () => adminDb,
  auth: () => adminAuth,
};
