# Firestore Index Setup

## Quick Fix (Recommended)

**Use the error link**: Copy the URL from your terminal error message and open it in your browser. Firebase will automatically create the required index.

## Manual Setup via Firebase Console

1. Go to: https://console.firebase.google.com/project/vyrbank-8923d/firestore/indexes
2. Click **"Create Index"**
3. Configure:
   - **Collection ID**: `transactions`
   - **Fields**:
     - `fromAccountId` → Ascending
     - `timestamp` → Descending
   - **Query scope**: Collection
4. Click **"Create"**

Wait 2-5 minutes for the index to build, then refresh your app.

## Deploy via Firebase CLI (Optional)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init firestore

# Deploy indexes
firebase deploy --only firestore:indexes
```

The indexes are already configured in `firestore.indexes.json`.
