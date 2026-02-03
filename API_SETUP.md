# API Setup Guide

This guide will help you set up the VyrBank API with Firebase.

## Prerequisites

1. Node.js 18+ installed
2. A Firebase project created at [Firebase Console](https://console.firebase.google.com/)

## Step 1: Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable **Authentication** and **Firestore Database**

### 2.2 Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Save changes

### 2.3 Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Start in **test mode** (we'll add security rules later)
3. Choose a location for your database

### 2.4 Get Firebase Client Config

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Copy the Firebase configuration values

### 2.5 Get Firebase Admin SDK Credentials

1. Go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file securely (do NOT commit to git)
4. Extract the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key\n-----END PRIVATE KEY-----\n"
   ```

**Important:** 
- Keep `.env.local` in `.gitignore` (it should already be there)
- Never commit your Firebase credentials to version control
- The `FIREBASE_PRIVATE_KEY` should include the `\n` characters as shown

## Step 4: Set Up Firestore Security Rules

Go to **Firestore Database** > **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own accounts
    match /accounts/{accountId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Users can read transactions involving their accounts
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Users can only access their own loan applications
    match /loanApplications/{loanId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /loanPayments/{paymentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **Publish** to save the rules.

## Step 5: Welcome Email (Resend)

After successful registration, a welcome email with the user's account number is sent via [Resend](https://resend.com).

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
3. Optional: set a custom sender after verifying your domain in Resend:
   ```env
   RESEND_FROM_EMAIL=VyrBank <welcome@yourdomain.com>
   ```
4. Optional: set the base URL for "Sign in" links in the email (for production):
   ```env
   NEXT_PUBLIC_APP_URL=https://yourapp.com
   ```

If `RESEND_API_KEY` is not set, registration still succeeds; the welcome email is skipped and a warning is logged.

## Step 6: Test the API

### Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/`

### Test Registration Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "accountType": "checking",
    "phone": "(555) 123-4567",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "uid": "...",
    "accountNumber": "123456789012",
    "email": "john@example.com",
    "accountId": "...",
    "message": "Account created successfully"
  }
}
```

## Step 7: Verify Setup

1. Check Firebase Console > **Authentication** - you should see the new user
2. Check **Firestore Database** - you should see:
   - A document in `users` collection
   - A document in `accounts` collection

## Troubleshooting

### Error: "Firebase Admin SDK initialization error"

- Check that `FIREBASE_PRIVATE_KEY` includes the `\n` characters
- Verify the private key is wrapped in quotes in `.env.local`
- Ensure `FIREBASE_PROJECT_ID` and `FIREBASE_CLIENT_EMAIL` are correct

### Error: "Permission denied" in Firestore

- Check that Firestore security rules are published
- Verify the user is authenticated (check Firebase Auth token)

### Error: "Account number generation failed"

- This usually means too many collisions. The function will retry up to 10 times.
- If this persists, check Firestore indexes.

## Next Steps

1. Integrate the API endpoints with your frontend components
2. Add error handling and loading states in the UI
3. Implement client-side Firebase Auth for login
4. Add input validation on the frontend
5. Set up proper error logging and monitoring

## API Endpoints Summary

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/accounts` - Get all user accounts
- `GET /api/accounts/:accountId` - Get specific account
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:accountId/balance` - Get account balance
- `POST /api/transfers/validate-beneficiary` - Validate account number
- `POST /api/transfers/internal` - Internal transfer
- `POST /api/transfers/send-to-person` - Send to person transfer
- `GET /api/transfers/history` - Get transfer history
- `GET /api/dashboard/overview` - Get dashboard data

See `API_DOCUMENTATION.md` for detailed API documentation.
