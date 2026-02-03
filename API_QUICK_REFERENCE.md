# VyrBank API Quick Reference

## Base URL
```
/api/{endpoint}
```

## Authentication
All endpoints (except registration and login) require:
```
Authorization: Bearer {firebaseIdToken}
```

---

## Endpoints Summary

### Authentication

| Method | Endpoint | Auth Required | Description |
|-------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register new user, generates 12-digit account number |
| POST | `/api/auth/login` | No | Login with account number and password |

### Accounts

| Method | Endpoint | Auth Required | Description |
|-------|----------|---------------|-------------|
| GET | `/api/accounts` | Yes | Get all user accounts |
| GET | `/api/accounts/:accountId` | Yes | Get specific account details |
| POST | `/api/accounts` | Yes | Create new account |
| GET | `/api/accounts/:accountId/balance` | Yes | Get account balance |
| PATCH | `/api/accounts/:accountId/balance` | Yes | Update balance (internal use) |

### Transfers

| Method | Endpoint | Auth Required | Description |
|-------|----------|---------------|-------------|
| POST | `/api/transfers/validate-beneficiary` | Yes | Validate account number, return beneficiary name |
| POST | `/api/transfers/internal` | Yes | Transfer between own accounts |
| POST | `/api/transfers/send-to-person` | Yes | Transfer to another user's account |
| GET | `/api/transfers/history` | Yes | Get transfer history |

### Dashboard

| Method | Endpoint | Auth Required | Description |
|-------|----------|---------------|-------------|
| GET | `/api/dashboard/overview` | Yes | Get dashboard summary data |

### Loans

| Method | Endpoint | Auth Required | Description |
|-------|----------|---------------|-------------|
| GET | `/api/loans` | Yes | Get all user loans |
| GET | `/api/loans/:loanId` | Yes | Get specific loan details |
| POST | `/api/loans/apply` | Yes | Submit loan application |
| POST | `/api/loans/:loanId/payments` | Yes | Record loan payment |

---

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "accountType": "checking"
}

Response: {
  "success": true,
  "data": {
    "accountNumber": "123456789012"
  }
}
```

### Internal Transfer
```bash
POST /api/transfers/internal
Authorization: Bearer {token}
{
  "fromAccountId": "acc1",
  "toAccountId": "acc2",
  "amount": 500.00
}

Response: {
  "success": true,
  "data": {
    "referenceId": "TRX-1234-24",
    "fromAccount": { "newBalance": 11950.00 },
    "toAccount": { "newBalance": 45700.50 }
  }
}
```

### Send to Person
```bash
POST /api/transfers/send-to-person
Authorization: Bearer {token}
{
  "fromAccountId": "acc1",
  "toAccountNumber": "987654321098",
  "amount": 250.00
}

Response: {
  "success": true,
  "data": {
    "referenceId": "TRX-5678-24",
    "toAccount": {
      "beneficiaryName": "Jane Smith"
    }
  }
}
```

### Validate Beneficiary
```bash
POST /api/transfers/validate-beneficiary
Authorization: Bearer {token}
{
  "accountNumber": "987654321098"
}

Response: {
  "success": true,
  "data": {
    "isValid": true,
    "beneficiaryName": "Jane Smith"
  }
}
```

---

## Data Models

### Account
```typescript
{
  id: string;
  userId: string;
  accountNumber: string; // 12 digits
  name: string;
  accountType: "checking" | "savings" | "credit";
  balance: number;
  routingNumber: string;
  interestRate: number;
  status: "active" | "closed";
}
```

### Transaction
```typescript
{
  id: string;
  referenceId: string; // "TRX-1234-24"
  type: "internal" | "send-to-person";
  fromAccountId: string;
  toAccountId?: string;
  toAccountNumber?: string;
  amount: number; // negative for outgoing
  status: "completed" | "pending" | "failed";
  timestamp: Timestamp;
}
```

### User
```typescript
{
  uid: string;
  accountNumber: string; // 12 digits
  email: string;
  firstName: string;
  lastName: string;
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `NOT_FOUND` | 404 | Resource not found |
| `INSUFFICIENT_FUNDS` | 400 | Not enough balance |
| `TRANSFER_ERROR` | 400 | Transfer failed |

---

## Key Implementation Notes

1. **Account Number**: 12-digit random number, must be unique
2. **Balance Updates**: Use Firestore transactions for atomicity
3. **Transfer Flow**:
   - Validate beneficiary account exists
   - Check sufficient funds
   - Check daily limits
   - Update balances atomically
   - Create transaction records
4. **Authentication**: Firebase Auth token in Authorization header
5. **Data Storage**: All data in Firestore collections

---

## Firestore Collections

- `users` - User profiles
- `accounts` - Bank accounts
- `transactions` - Transfer/payment records
- `loanApplications` - Loan applications
- `loanPayments` - Loan payment records

---

## Transfer Types

1. **Internal**: Between user's own accounts
2. **Send to Person**: To another user's account (same bank)

Note: Wire transfers to other banks are not implemented.
