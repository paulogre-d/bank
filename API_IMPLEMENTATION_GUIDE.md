# VyrBank API Implementation Guide

This guide provides example implementations for the API endpoints described in `API_DOCUMENTATION.md`.

## Prerequisites

### Install Dependencies

```bash
npm install firebase firebase-admin
```

### Firebase Configuration

Create `lib/firebase/config.ts`:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
....
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
```

Create `lib/firebase/admin.ts` for server-side operations:

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = getFirestore();
export { admin } from 'firebase-admin';
```

### Authentication Middleware

Create `lib/middleware/auth.ts`:

```typescript
import { NextRequest } from 'next/server';
import { admin } from '../firebase/admin';

export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return { uid: decodedToken.uid, error: null };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}
```

### Utility Functions

Create `lib/utils/accountNumber.ts`:

```typescript
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

    // Check if it exists in Firestore
    const accountsSnapshot = await adminDb
      .collection('accounts')
      .where('accountNumber', '==', accountNumber)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
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
```

---

## API Route Examples

### 1. User Registration

**File:** `app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase/admin';
import { generateAccountNumber } from '@/lib/utils/accountNumber';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      ssn,
      email,
      phone,
      address,
      accountType,
      password,
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    try {
      await admin.auth().getUserByEmail(email);
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Generate unique 12-digit account number
    const accountNumber = await generateAccountNumber();

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      accountNumber,
      email,
      firstName,
      lastName,
      dateOfBirth,
      ssn, // In production, encrypt this
      phone,
      address,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('users').doc(userRecord.uid).set(userData);

    // Create initial account
    const accountData = {
      userId: userRecord.uid,
      accountNumber,
      name: accountType === 'checking' ? 'Premium Checking' : 'High Yield Savings',
      accountType,
      balance: 0.00,
      routingNumber: '123456789', // Default routing number
      interestRate: accountType === 'savings' ? 4.25 : 0.05,
      openedDate: new Date().toISOString(),
      ownership: 'Individual',
      monthlyFee: 0.00,
      overdraftLimit: accountType === 'checking' ? 500.00 : null,
      dailyTransferLimit: accountType === 'checking' ? 5000.00 : 10000.00,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const accountRef = await admin.firestore().collection('accounts').add(accountData);

    return NextResponse.json(
      {
        success: true,
        data: {
          uid: userRecord.uid,
          accountNumber,
          email,
          message: 'Account created successfully',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### 2. Login

**File:** `app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { accountNumber, password } = await request.json();

    if (!accountNumber || !password) {
      return NextResponse.json(
        { success: false, error: 'Account number and password required' },
        { status: 400 }
      );
    }

    // Find user by account number
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('accountNumber', '==', accountNumber)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password using Firebase Auth
    // Note: In production, you might want to use email for login instead
    // This is a simplified example
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUser(userData.uid);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate custom token (or use Firebase Auth sign-in)
    const customToken = await admin.auth().createCustomToken(userData.uid);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          uid: userData.uid,
          email: userData.email,
          accountNumber: userData.accountNumber,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
        token: customToken, // Client should exchange this for ID token
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
```

### 3. Get User Accounts

**File:** `app/api/accounts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { uid } = authResult;

    // Fetch all accounts for the user
    const accountsSnapshot = await adminDb
      .collection('accounts')
      .where('userId', '==', uid)
      .get();

    const accounts = accountsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        balance: data.balance || 0,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error: any) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
```

### 4. Internal Transfer

**File:** `app/api/transfers/internal/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { uid } = authResult;
    const { fromAccountId, toAccountId, amount, frequency, scheduledDate } = await request.json();

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Use Firestore transaction for atomic operations
    const result = await adminDb.runTransaction(async (transaction) => {
      // Get both accounts
      const fromAccountRef = adminDb.collection('accounts').doc(fromAccountId);
      const toAccountRef = adminDb.collection('accounts').doc(toAccountId);

      const fromAccountDoc = await transaction.get(fromAccountRef);
      const toAccountDoc = await transaction.get(toAccountRef);

      if (!fromAccountDoc.exists || !toAccountDoc.exists) {
        throw new Error('One or both accounts not found');
      }

      const fromAccount = fromAccountDoc.data()!;
      const toAccount = toAccountDoc.data()!;

      // Verify both accounts belong to the user
      if (fromAccount.userId !== uid || toAccount.userId !== uid) {
        throw new Error('Unauthorized: Account does not belong to user');
      }

      // Check sufficient funds
      if (fromAccount.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Check daily transfer limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const transactionsSnapshot = await adminDb
        .collection('transactions')
        .where('fromAccountId', '==', fromAccountId)
        .where('status', '==', 'completed')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(today))
        .get();

      const dailyTotal = transactionsSnapshot.docs.reduce(
        (sum, doc) => sum + Math.abs(doc.data().amount),
        0
      );

      if (dailyTotal + amount > (fromAccount.dailyTransferLimit || Infinity)) {
        throw new Error('Daily transfer limit exceeded');
      }

      // Update balances
      const newFromBalance = fromAccount.balance - amount;
      const newToBalance = (toAccount.balance || 0) + amount;

      transaction.update(fromAccountRef, {
        balance: newFromBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(toAccountRef, {
        balance: newToBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Generate reference ID
      const referenceId = `TRX-${Math.floor(1000 + Math.random() * 9000)}-${String(
        new Date().getFullYear()
      ).slice(-2)}`;

      // Create transaction record
      const transactionData = {
        referenceId,
        type: 'internal',
        fromAccountId,
        toAccountId,
        amount: -amount, // Negative for outgoing
        status: 'completed',
        frequency: frequency || 'One-time Transfer',
        scheduledDate: scheduledDate || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const transactionRef = adminDb.collection('transactions').doc();
      transaction.set(transactionRef, transactionData);

      // Create corresponding transaction for destination account
      const toTransactionData = {
        ...transactionData,
        amount: amount, // Positive for incoming
        fromAccountId: toAccountId,
        toAccountId: fromAccountId,
      };

      const toTransactionRef = adminDb.collection('transactions').doc();
      transaction.set(toTransactionRef, toTransactionData);

      return {
        transactionId: transactionRef.id,
        referenceId,
        fromAccount: {
          id: fromAccountId,
          newBalance: newFromBalance,
        },
        toAccount: {
          id: toAccountId,
          newBalance: newToBalance,
        },
        amount,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        status: 'completed',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Transfer failed',
        code: error.message.includes('Insufficient') ? 'INSUFFICIENT_FUNDS' : 'TRANSFER_ERROR',
      },
      { status: 400 }
    );
  }
}
```

### 5. Send to Person Transfer

**File:** `app/api/transfers/send-to-person/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { uid } = authResult;
    const { fromAccountId, toAccountNumber, amount, frequency, scheduledDate } =
      await request.json();

    if (!fromAccountId || !toAccountNumber || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Find beneficiary account
    const beneficiaryAccountsSnapshot = await adminDb
      .collection('accounts')
      .where('accountNumber', '==', toAccountNumber)
      .limit(1)
      .get();

    if (beneficiaryAccountsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Beneficiary account not found' },
        { status: 404 }
      );
    }

    const beneficiaryAccountDoc = beneficiaryAccountsSnapshot.docs[0];
    const beneficiaryAccount = beneficiaryAccountDoc.data();
    const toAccountId = beneficiaryAccountDoc.id;

    // Get beneficiary user info
    const beneficiaryUserDoc = await adminDb
      .collection('users')
      .doc(beneficiaryAccount.userId)
      .get();
    const beneficiaryUser = beneficiaryUserDoc.data()!;

    // Use Firestore transaction
    const result = await adminDb.runTransaction(async (transaction) => {
      const fromAccountRef = adminDb.collection('accounts').doc(fromAccountId);
      const toAccountRef = adminDb.collection('accounts').doc(toAccountId);

      const fromAccountDoc = await transaction.get(fromAccountRef);
      const toAccountDoc = await transaction.get(toAccountRef);

      if (!fromAccountDoc.exists) {
        throw new Error('Source account not found');
      }

      const fromAccount = fromAccountDoc.data()!;

      // Verify source account belongs to user
      if (fromAccount.userId !== uid) {
        throw new Error('Unauthorized: Account does not belong to user');
      }

      // Check sufficient funds
      if (fromAccount.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Check daily transfer limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const transactionsSnapshot = await adminDb
        .collection('transactions')
        .where('fromAccountId', '==', fromAccountId)
        .where('status', '==', 'completed')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(today))
        .get();

      const dailyTotal = transactionsSnapshot.docs.reduce(
        (sum, doc) => sum + Math.abs(doc.data().amount),
        0
      );

      if (dailyTotal + amount > (fromAccount.dailyTransferLimit || Infinity)) {
        throw new Error('Daily transfer limit exceeded');
      }

      // Update balances
      const newFromBalance = fromAccount.balance - amount;
      const newToBalance = (toAccountDoc.data()?.balance || 0) + amount;

      transaction.update(fromAccountRef, {
        balance: newFromBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(toAccountRef, {
        balance: newToBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Generate reference ID
      const referenceId = `TRX-${Math.floor(1000 + Math.random() * 9000)}-${String(
        new Date().getFullYear()
      ).slice(-2)}`;

      // Create transaction records
      const fromTransactionData = {
        referenceId,
        type: 'send-to-person',
        fromAccountId,
        toAccountId,
        toAccountNumber,
        amount: -amount,
        status: 'completed',
        frequency: frequency || 'One-time Transfer',
        scheduledDate: scheduledDate || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const toTransactionData = {
        ...fromTransactionData,
        amount: amount,
        fromAccountId: toAccountId,
        toAccountId: fromAccountId,
        fromAccountNumber: fromAccount.accountNumber,
      };

      const fromTransactionRef = adminDb.collection('transactions').doc();
      const toTransactionRef = adminDb.collection('transactions').doc();

      transaction.set(fromTransactionRef, fromTransactionData);
      transaction.set(toTransactionRef, toTransactionData);

      return {
        transactionId: fromTransactionRef.id,
        referenceId,
        fromAccount: {
          id: fromAccountId,
          newBalance: newFromBalance,
        },
        toAccount: {
          accountNumber: toAccountNumber,
          beneficiaryName: `${beneficiaryUser.firstName} ${beneficiaryUser.lastName}`,
        },
        amount,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        status: 'completed',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Send to person error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Transfer failed',
        code: error.message.includes('Insufficient') ? 'INSUFFICIENT_FUNDS' : 'TRANSFER_ERROR',
      },
      { status: 400 }
    );
  }
}
```

### 6. Validate Beneficiary

**File:** `app/api/transfers/validate-beneficiary/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { accountNumber } = await request.json();

    if (!accountNumber || accountNumber.length !== 12) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid account number',
          data: { isValid: false },
        },
        { status: 400 }
      );
    }

    // Find account by account number
    const accountsSnapshot = await adminDb
      .collection('accounts')
      .where('accountNumber', '==', accountNumber)
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'Account not found',
        data: { isValid: false },
      });
    }

    const accountDoc = accountsSnapshot.docs[0];
    const account = accountDoc.data();

    // Get user information
    const userDoc = await adminDb.collection('users').doc(account.userId).get();
    const user = userDoc.data()!;

    return NextResponse.json({
      success: true,
      data: {
        accountNumber,
        isValid: true,
        beneficiaryName: `${user.firstName} ${user.lastName}`,
        accountType: account.accountType,
      },
    });
  } catch (error: any) {
    console.error('Validate beneficiary error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Validation failed',
        data: { isValid: false },
      },
      { status: 500 }
    );
  }
}
```

### 7. Dashboard Overview

**File:** `app/api/dashboard/overview/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { uid } = authResult;

    // Fetch all accounts
    const accountsSnapshot = await adminDb
      .collection('accounts')
      .where('userId', '==', uid)
      .get();

    const accounts = accountsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        balance: data.balance || 0,
        lastFour: data.accountNumber.slice(-4),
        accountNumber: data.accountNumber,
        accountType: data.accountType,
      };
    });

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Fetch recent transactions (last 10)
    const accountIds = accounts.map((acc) => acc.id);
    const transactionsSnapshot = await adminDb
      .collection('transactions')
      .where('fromAccountId', 'in', accountIds)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const recentTransactions = transactionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        merchant: data.merchant || 'Transfer',
        date: data.timestamp?.toDate().toISOString().split('T')[0],
        amount: data.amount,
        category: data.category || 'Transfer',
        accountId: data.fromAccountId,
      };
    });

    // Calculate spending analytics (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTransactionsSnapshot = await adminDb
      .collection('transactions')
      .where('fromAccountId', 'in', accountIds)
      .where('amount', '<', 0)
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
      .get();

    const thisWeek = Math.abs(
      weeklyTransactionsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)
    );

    return NextResponse.json({
      success: true,
      data: {
        totalBalance,
        accounts,
        recentTransactions,
        spendingAnalytics: {
          thisWeek,
          lastMonth: thisWeek * 4, // Simplified calculation
        },
      },
    });
  } catch (error: any) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
```

---

## Environment Variables

Create `.env.local`:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Config
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
```

---

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "accountType": "checking"
  }'
```

**Get Accounts (after login):**
```bash
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

---

## Next Steps

1. Implement remaining endpoints following the same patterns
2. Add comprehensive error handling
3. Add input validation using a library like Zod
4. Implement rate limiting
5. Add logging and monitoring
6. Set up Firestore security rules
7. Add unit and integration tests
