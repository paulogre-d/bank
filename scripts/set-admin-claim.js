/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * One-time script to set the custom claim `admin: true` on a Firebase user.
 * Run from project root with env loaded (e.g. from .env.local).
 *
 * Usage:
 *   node --env-file=.env.local scripts/set-admin-claim.js <email>
 *   node --env-file=.env.local scripts/set-admin-claim.js admin@vertexpremium.com
 *
 * Or: npm run set-admin
 * Or: npm run set-admin -- admin@vertexpremium.com
 *
 * After running, the user must sign out and sign in again so the new claim is in their ID token.
 */

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const email = process.argv[2] || process.env.ADMIN_EMAIL;

if (!email) {
  console.error('Usage: node --env-file=.env.local scripts/set-admin-claim.js <email>');
  console.error('   Or set ADMIN_EMAIL in .env.local and run without arguments.');
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase env vars. Run with: node --env-file=.env.local scripts/set-admin-claim.js', email);
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const adminAuth = getAuth();

async function main() {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('Done. Set admin: true for:', userRecord.email, '(uid:', userRecord.uid + ')');
    console.log('The user must sign out and sign in again for the claim to appear in their token.');
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.error('No user found with email:', email);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

main();
