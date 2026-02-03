import { adminDb } from '../firebase/admin';

export async function generateAccountNumber(): Promise<string> {
  let accountNumber = '';
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 12 random digits
    accountNumber = '';
    for (let i = 0; i < 12; i++) {
      accountNumber += Math.floor(Math.random() * 10).toString();
    }

    // Check if it exists in accounts collection
    const accountsSnapshot = await adminDb
      .collection('accounts')
      .where('accountNumber', '==', accountNumber)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      // Check if it exists in users collection
      const usersSnapshot = await adminDb
        .collection('users')
        .where('accountNumber', '==', accountNumber)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        isUnique = true;
      }
    }

    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique account number');
  }

  return accountNumber;
}
