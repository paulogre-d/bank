# VyrBank API Documentation

## Overview

This document describes the API structure for the VyrBank application. The backend uses **Firebase Firestore** for data storage and **Firebase Authentication** for user authentication. All operations are CRUD-based with no integration to real payment APIs.

## Technology Stack

- **Backend Framework**: Next.js API Routes (`app/api/`)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Language**: TypeScript

---

## Table of Contents

1. [API Structure](#api-structure)
2. [Authentication](#authentication)
3. [User Registration](#user-registration)
4. [Dashboard Data](#dashboard-data)
5. [Account Management](#account-management)
6. [Account Balances](#account-balances)
7. [Transfers](#transfers)
8. [Loans](#loans)
9. [Data Models](#data-models)
10. [Error Handling](#error-handling)

---

## API Structure

All API endpoints are located in the `app/api/` directory following Next.js App Router conventions.

### Base URL
```
/api/{endpoint}
```

### Authentication
Most endpoints require authentication via Firebase Auth token passed in the `Authorization` header:
```
Authorization: Bearer {firebaseIdToken}
```

---

## Authentication

### POST `/api/auth/login`

Authenticate a user with account number and password.

**Request Body:**
```json
{
  "accountNumber": "123456789012",
  "password": "userPassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "firebaseUserId",
      "email": "user@example.com",
      "accountNumber": "123456789012",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "firebaseIdToken"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Implementation Notes:**
- Look up user in Firestore by `accountNumber`
- Verify password (stored as hashed password in Firestore)
- Generate Firebase custom token or use Firebase Auth
- Return Firebase ID token for subsequent requests

---

## User Registration

### POST `/api/auth/register`

Register a new user account. After successful registration, a random 12-digit account number is generated.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "ssn": "123-45-6789",
  "email": "john.doe@example.com",
  "phone": "(555) 123-4567",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "accountType": "checking",
  "password": "SecurePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "uid": "firebaseUserId",
    "accountNumber": "123456789012",
    "email": "john.doe@example.com",
    "message": "Account created successfully"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

**Implementation Flow:**
1. Validate all input fields
2. Check if email already exists in Firestore
3. Create Firebase Auth user with email and password
4. Generate random 12-digit account number (ensure uniqueness)
5. Create user document in Firestore `users` collection
6. Create initial account document in `accounts` collection
7. Return success response with account number

**Account Number Generation:**
```typescript
function generateAccountNumber(): string {
  // Generate 12 random digits
  let accountNumber = '';
  for (let i = 0; i < 12; i++) {
    accountNumber += Math.floor(Math.random() * 10).toString();
  }
  
  // Check uniqueness in Firestore
  // If exists, regenerate
  return accountNumber;
}
```

---

## Dashboard Data

### GET `/api/dashboard/overview`

Get dashboard overview data including account summaries and recent transactions.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalBalance": 57650.50,
    "accounts": [
      {
        "id": "accountId1",
        "name": "Premium Checking",
        "balance": 12450.00,
        "lastFour": "4589",
        "accountNumber": "123456789012",
        "accountType": "checking"
      },
      {
        "id": "accountId2",
        "name": "High Yield Savings",
        "balance": 45200.50,
        "lastFour": "9012",
        "accountNumber": "123456789013",
        "accountType": "savings"
      }
    ],
    "recentTransactions": [
      {
        "id": "tx1",
        "merchant": "Whole Foods Market",
        "date": "2024-01-28",
        "amount": -124.50,
        "category": "Food",
        "accountId": "accountId1"
      }
    ],
    "spendingAnalytics": {
      "thisWeek": 450.20,
      "lastMonth": 1850.75
    }
  }
}
```

**Implementation Notes:**
- Fetch all accounts for the authenticated user
- Fetch recent transactions (last 10) across all accounts
- Calculate total balance from all accounts
- Aggregate spending analytics

---

## Account Management

### GET `/api/accounts`

Get all accounts for the authenticated user.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "accountId1",
      "name": "Premium Checking",
      "balance": 12450.00,
      "lastFour": "4589",
      "accountNumber": "123456789012",
      "routingNumber": "123456789",
      "interestRate": 0.05,
      "openedDate": "2019-10-12",
      "accountType": "checking",
      "ownership": "Individual",
      "monthlyFee": 0.00,
      "overdraftLimit": 500.00,
      "dailyTransferLimit": 5000.00,
      "status": "active"
    }
  ]
}
```

### GET `/api/accounts/:accountId`

Get details for a specific account.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "accountId1",
    "name": "Premium Checking",
    "balance": 12450.00,
    "lastFour": "4589",
    "accountNumber": "123456789012",
    "routingNumber": "123456789",
    "interestRate": 0.05,
    "openedDate": "2019-10-12",
    "accountType": "checking",
    "ownership": "Individual",
    "monthlyFee": 0.00,
    "overdraftLimit": 500.00,
    "dailyTransferLimit": 5000.00,
    "status": "active"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Account not found"
}
```

### POST `/api/accounts`

Create a new account for the authenticated user.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Request Body:**
```json
{
  "accountType": "savings",
  "name": "High Yield Savings"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "newAccountId",
    "accountNumber": "987654321098",
    "name": "High Yield Savings",
    "balance": 0.00,
    "accountType": "savings",
    "status": "active"
  }
}
```

**Implementation Notes:**
- Generate new 12-digit account number
- Set initial balance to 0.00
- Set default routing number (same for all accounts)
- Set account type-specific defaults (interest rates, limits, etc.)

---

## Account Balances

### GET `/api/accounts/:accountId/balance`

Get current balance for a specific account.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "accountId1",
    "balance": 12450.00,
    "availableBalance": 12450.00,
    "currency": "USD",
    "lastUpdated": "2024-01-28T10:30:00Z"
  }
}
```

### PATCH `/api/accounts/:accountId/balance`

Update account balance (used internally for transfers).

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Request Body:**
```json
{
  "amount": -100.00,
  "transactionType": "transfer",
  "referenceId": "TRX-1234-24"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "accountId1",
    "previousBalance": 12450.00,
    "newBalance": 12350.00,
    "amount": -100.00
  }
}
```

**Implementation Notes:**
- Use Firestore transactions to ensure atomic balance updates
- Validate sufficient funds before deducting
- Check daily transfer limits
- Record transaction history

---

## Transfers

### POST `/api/transfers/validate-beneficiary`

Validate a beneficiary account number before transfer.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Request Body:**
```json
{
  "accountNumber": "987654321098"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountNumber": "987654321098",
    "isValid": true,
    "beneficiaryName": "Jane Smith",
    "accountType": "checking"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Account not found",
  "data": {
    "isValid": false
  }
}
```

**Implementation Notes:**
- Query Firestore `accounts` collection by `accountNumber`
- Return beneficiary name and account type if found
- Do not return sensitive information
- Used for "Send to Person" transfers

---

### POST `/api/transfers/internal`

Transfer funds between user's own accounts.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Request Body:**
```json
{
  "fromAccountId": "accountId1",
  "toAccountId": "accountId2",
  "amount": 500.00,
  "frequency": "One-time Transfer",
  "scheduledDate": "2024-01-30"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactionId": "tx-123456",
    "referenceId": "TRX-1234-24",
    "fromAccount": {
      "id": "accountId1",
      "newBalance": 11950.00
    },
    "toAccount": {
      "id": "accountId2",
      "newBalance": 45700.50
    },
    "amount": 500.00,
    "status": "completed",
    "timestamp": "2024-01-28T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Insufficient funds"
}
```

**Implementation Flow:**
1. Validate both accounts belong to authenticated user
2. Check sufficient funds in source account
3. Check daily transfer limits
4. Use Firestore batch write/transaction:
   - Deduct amount from source account balance
   - Add amount to destination account balance
   - Create transaction record in `transactions` collection
5. Return transaction details

---

### POST `/api/transfers/send-to-person`

Transfer funds to another user's account (same bank).

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Request Body:**
```json
{
  "fromAccountId": "accountId1",
  "toAccountNumber": "987654321098",
  "amount": 250.00,
  "frequency": "One-time Transfer",
  "scheduledDate": "2024-01-30"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactionId": "tx-123457",
    "referenceId": "TRX-5678-24",
    "fromAccount": {
      "id": "accountId1",
      "newBalance": 12200.00
    },
    "toAccount": {
      "accountNumber": "987654321098",
      "beneficiaryName": "Jane Smith"
    },
    "amount": 250.00,
    "status": "completed",
    "timestamp": "2024-01-28T10:30:00Z"
  }
}
```

**Implementation Flow:**
1. Validate beneficiary account exists (lookup by `accountNumber`)
2. Validate source account belongs to authenticated user
3. Check sufficient funds
4. Check daily transfer limits
5. Use Firestore batch write/transaction:
   - Deduct amount from source account balance
   - Add amount to beneficiary account balance
   - Create transaction records for both accounts
6. Return transaction details (do not expose full beneficiary account details)

---

### GET `/api/transfers/history`

Get transfer history for authenticated user.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Query Parameters:**
- `accountId` (optional): Filter by account
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tx-123456",
        "referenceId": "TRX-1234-24",
        "type": "internal",
        "fromAccount": {
          "id": "accountId1",
          "lastFour": "4589"
        },
        "toAccount": {
          "id": "accountId2",
          "lastFour": "9012"
        },
        "amount": 500.00,
        "status": "completed",
        "timestamp": "2024-01-28T10:30:00Z"
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

---

## Loans

### GET `/api/loans`

Get all loans for the authenticated user.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "loanId1",
      "loanType": "personal",
      "principal": 10000.00,
      "interestRate": 5.99,
      "termMonths": 36,
      "monthlyPayment": 304.22,
      "remainingBalance": 8500.00,
      "status": "active",
      "openedDate": "2023-06-15",
      "nextPaymentDate": "2024-02-15"
    }
  ]
}
```

### POST `/api/loans/apply`

Submit a loan application.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Request Body:**
```json
{
  "loanType": "personal",
  "amount": 10000,
  "termMonths": 36,
  "employmentStatus": "Employed",
  "annualIncome": 50000,
  "loanPurpose": "Home Renovation"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "applicationId": "app-123456",
    "status": "pending",
    "message": "Application submitted successfully. A specialist will contact you within 1-2 business days."
  }
}
```

**Implementation Notes:**
- Store application in `loanApplications` collection
- Calculate estimated monthly payment based on loan type and rate
- Set status to "pending"
- Do not automatically approve loans (manual review process)

### GET `/api/loans/:loanId`

Get details for a specific loan.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "loanId1",
    "loanType": "personal",
    "principal": 10000.00,
    "interestRate": 5.99,
    "termMonths": 36,
    "monthlyPayment": 304.22,
    "remainingBalance": 8500.00,
    "paidAmount": 1500.00,
    "status": "active",
    "openedDate": "2023-06-15",
    "nextPaymentDate": "2024-02-15",
    "paymentHistory": [
      {
        "date": "2024-01-15",
        "amount": 304.22,
        "status": "paid"
      }
    ]
  }
}
```

### POST `/api/loans/:loanId/payments`

Record a loan payment.

**Headers:**
```
Authorization: Bearer {firebaseIdToken}
```

**Request Body:**
```json
{
  "amount": 304.22,
  "fromAccountId": "accountId1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay-123456",
    "loanId": "loanId1",
    "amount": 304.22,
    "previousBalance": 8500.00,
    "newBalance": 8195.78,
    "paymentDate": "2024-01-28T10:30:00Z"
  }
}
```

**Implementation Notes:**
- Deduct payment amount from specified account
- Update loan remaining balance
- Create payment record
- Update next payment date

---

## Data Models

### User Document (`users` collection)

```typescript
{
  uid: string; // Firebase Auth UID
  accountNumber: string; // 12-digit unique account number
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  ssn: string; // Encrypted/hashed
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Account Document (`accounts` collection)

```typescript
{
  id: string; // Document ID
  userId: string; // Reference to users.uid
  accountNumber: string; // 12-digit account number
  name: string; // e.g., "Premium Checking"
  accountType: "checking" | "savings" | "credit";
  balance: number; // Current balance in USD
  routingNumber: string | null;
  interestRate: number | null; // Annual percentage
  openedDate: string; // ISO date string
  ownership: "Individual" | "Joint";
  monthlyFee: number;
  overdraftLimit: number | null;
  dailyTransferLimit: number | null;
  status: "active" | "closed" | "suspended";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Transaction Document (`transactions` collection)

```typescript
{
  id: string; // Document ID
  referenceId: string; // e.g., "TRX-1234-24"
  type: "internal" | "send-to-person" | "deposit" | "withdrawal";
  fromAccountId: string; // Reference to accounts.id
  toAccountId?: string; // Reference to accounts.id (for internal transfers)
  toAccountNumber?: string; // For send-to-person transfers
  amount: number; // Positive for deposits, negative for withdrawals
  status: "pending" | "completed" | "failed" | "cancelled";
  frequency?: "One-time Transfer" | "Weekly" | "Monthly";
  scheduledDate?: string; // ISO date string
  merchant?: string; // For purchases
  category?: string; // e.g., "Food", "Transport"
  timestamp: Timestamp;
  createdAt: Timestamp;
}
```

### Loan Application Document (`loanApplications` collection)

```typescript
{
  id: string; // Document ID
  userId: string; // Reference to users.uid
  loanType: "personal" | "auto" | "mortgage" | "small-business";
  amount: number;
  termMonths: number;
  interestRate: number; // Based on loan type
  monthlyPayment: number; // Calculated
  employmentStatus: string;
  annualIncome: number;
  loanPurpose: string;
  status: "pending" | "approved" | "rejected" | "active" | "paid-off";
  openedDate: string; // ISO date string
  approvedDate?: string; // ISO date string
  nextPaymentDate?: string; // ISO date string
  remainingBalance?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Loan Payment Document (`loanPayments` collection)

```typescript
{
  id: string; // Document ID
  loanId: string; // Reference to loanApplications.id
  userId: string; // Reference to users.uid
  amount: number;
  fromAccountId: string; // Reference to accounts.id
  paymentDate: Timestamp;
  status: "completed" | "failed";
  createdAt: Timestamp;
}
```

---

## Error Handling

All API endpoints follow a consistent error response format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" // Optional error code
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET, PUT, PATCH requests
- `201 Created`: Successful POST requests that create resources
- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission for the resource
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side errors

### Error Examples

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Invalid account number format",
  "code": "VALIDATION_ERROR"
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Account not found",
  "code": "NOT_FOUND"
}
```

**Insufficient Funds (400):**
```json
{
  "success": false,
  "error": "Insufficient funds",
  "code": "INSUFFICIENT_FUNDS",
  "data": {
    "availableBalance": 100.00,
    "requestedAmount": 500.00
  }
}
```

---

## Security Considerations

1. **Authentication**: All endpoints (except registration and login) require Firebase Auth token
2. **Authorization**: Users can only access their own data
3. **Input Validation**: Validate all input data on the server side
4. **Account Number Uniqueness**: Ensure 12-digit account numbers are unique
5. **Balance Updates**: Use Firestore transactions for atomic balance updates
6. **Rate Limiting**: Implement rate limiting for transfer endpoints
7. **SSN Encryption**: Store SSN encrypted/hashed in Firestore
8. **Password Hashing**: Use Firebase Auth password hashing (automatic)

---

## Implementation Checklist

### Phase 1: Authentication & Registration
- [ ] Set up Firebase project and Firestore database
- [ ] Configure Firebase Authentication
- [ ] Implement `/api/auth/register` endpoint
- [ ] Implement account number generation (12 digits, unique)
- [ ] Implement `/api/auth/login` endpoint
- [ ] Create user document structure in Firestore

### Phase 2: Account Management
- [ ] Implement `/api/accounts` GET endpoint
- [ ] Implement `/api/accounts/:accountId` GET endpoint
- [ ] Implement `/api/accounts` POST endpoint
- [ ] Implement `/api/accounts/:accountId/balance` GET endpoint
- [ ] Create account document structure in Firestore

### Phase 3: Transfers
- [ ] Implement `/api/transfers/validate-beneficiary` endpoint
- [ ] Implement `/api/transfers/internal` endpoint
- [ ] Implement `/api/transfers/send-to-person` endpoint
- [ ] Implement balance update logic with Firestore transactions
- [ ] Implement transaction history endpoint
- [ ] Create transaction document structure in Firestore

### Phase 4: Dashboard & Analytics
- [ ] Implement `/api/dashboard/overview` endpoint
- [ ] Aggregate account balances
- [ ] Fetch recent transactions
- [ ] Calculate spending analytics

### Phase 5: Loans
- [ ] Implement `/api/loans` GET endpoint
- [ ] Implement `/api/loans/apply` POST endpoint
- [ ] Implement `/api/loans/:loanId` GET endpoint
- [ ] Implement `/api/loans/:loanId/payments` POST endpoint
- [ ] Create loan application and payment document structures

### Phase 6: Error Handling & Security
- [ ] Implement consistent error handling middleware
- [ ] Add input validation for all endpoints
- [ ] Implement authorization checks
- [ ] Add rate limiting
- [ ] Set up Firestore security rules

---

## Firestore Security Rules Example

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
    }
    
    // Users can only access their own transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        (resource.data.fromAccountId in get(/databases/$(database)/documents/accounts/$(resource.data.fromAccountId)).data.userId == request.auth.uid ||
         resource.data.toAccountId in get(/databases/$(database)/documents/accounts/$(resource.data.toAccountId)).data.userId == request.auth.uid);
      allow create: if request.auth != null;
    }
    
    // Users can only access their own loans
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

---

## Notes

- All monetary values are stored as numbers (not strings) in USD
- All dates are stored as ISO 8601 strings or Firestore Timestamps
- Account numbers are 12-digit strings (no dashes or spaces)
- Transfer amounts are always positive numbers; direction is determined by account context
- Use Firestore transactions for any operations that modify multiple documents atomically
- Implement proper logging for all financial transactions
- Consider implementing audit trails for compliance

---

## Future Enhancements

- Scheduled/recurring transfers
- Transfer limits and fraud detection
- Account statements generation
- Email notifications for transactions
- Multi-currency support
- Account closure functionality
- Interest calculation and accrual
- Loan approval workflow automation
