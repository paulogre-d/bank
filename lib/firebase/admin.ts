import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | null = null;
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;

function getApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0] as App;
    return app;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local'
    );
  }
  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return app;
}

function getAdminDb(): Firestore {
  if (!_adminDb) _adminDb = getFirestore(getApp());
  return _adminDb;
}

function getAdminAuth(): Auth {
  if (!_adminAuth) _adminAuth = getAuth(getApp());
  return _adminAuth;
}

// Lazy-initialized exports: initialization happens on first use (at runtime), not at import time
export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    return (getAdminDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getAdminAuth() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const admin = {
  firestore: () => getAdminDb(),
  auth: () => getAdminAuth(),
};
