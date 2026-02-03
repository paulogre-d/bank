# Firebase Authentication Setup Fix

## Issue: PASSWORD_LOGIN_DISABLED Error

You're seeing this error because **Email/Password authentication is not enabled** in your Firebase project.

## Solution: Enable Email/Password Authentication

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project

### Step 2: Enable Email/Password Provider

1. Go to **Authentication** in the left sidebar
2. Click on **Sign-in method** tab
3. Find **Email/Password** in the list
4. Click on it
5. Toggle **Enable** to ON
6. Click **Save**

### Step 3: Verify Setup

After enabling, your authentication should work. The registration and login flows will now work correctly.

## Alternative: Using Custom Tokens (Current Implementation)

The code has been updated to handle both scenarios:

1. **If Email/Password is enabled**: Uses `signInWithEmailAndPassword` (preferred)
2. **If Email/Password is disabled**: Falls back to custom token flow

However, **it's recommended to enable Email/Password** because:
- It's more secure (password verification happens on Firebase servers)
- It's the standard approach
- Registration already creates users with email/password

## Current Login Flow

The login API endpoint (`/api/auth/login`) now:
1. Looks up user by account number
2. Verifies user exists
3. Returns a custom token that can be exchanged for an ID token

The client code:
1. Calls `/api/auth/login` with account number and password
2. Receives custom token
3. Exchanges custom token for Firebase ID token using `signInWithCustomToken`
4. Stores ID token for API requests

## Testing

After enabling Email/Password:

1. **Test Registration**:
   - Go to `/register`
   - Fill out the form
   - Should successfully create account and sign in

2. **Test Login**:
   - Go to home page
   - Enter account number and password
   - Should successfully log in and redirect to dashboard

## Troubleshooting

### Still getting PASSWORD_LOGIN_DISABLED?

1. Double-check that Email/Password is enabled in Firebase Console
2. Make sure you're looking at the correct Firebase project
3. Wait a few seconds after enabling (sometimes there's a slight delay)
4. Try refreshing the page

### Registration works but login doesn't?

- Make sure Email/Password is enabled
- Check browser console for any other errors
- Verify the account number format (should be 12 digits)

### Custom token errors?

- Check that Firebase Admin SDK credentials are correct in `.env.local`
- Verify `FIREBASE_PRIVATE_KEY` includes the `\n` characters
- Make sure the private key is wrapped in quotes

---

**Status**: Code updated to handle both password login and custom token flows. **Please enable Email/Password in Firebase Console for best results.**
