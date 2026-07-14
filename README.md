# Khatabook Clone (MERN Stack)

A digital ledger app for tracking customer credit/debit transactions, similar to Khatabook.

## Features
- JWT authentication (register/login)
- Add customers with an opening balance
- Record "You Gave" (debit) and "You Got" (credit) entries per customer
- Auto-calculated running balance and ledger history
- Dashboard summary: total "You'll Get" vs "You'll Give"
- Search customers
- Mobile-first, Khatabook-style UI (Tailwind CSS)

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

## Project Structure
```
khatabook-app/
├── backend/
│   ├── config/db.js
│   ├── models/ (User, Customer, Transaction)
│   ├── controllers/
│   ├── routes/
│   ├── middleware/auth.js
│   └── server.js
└── frontend/
    └── src/
        ├── pages/ (Login, Register, Dashboard, CustomerLedger)
        ├── components/ (Navbar, AddCustomerModal, AddTransactionModal)
        ├── context/AuthContext.jsx
        └── api/axios.js
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Backend
```bash
cd backend
cp .env.example .env
# edit .env and set MONGO_URI + JWT_SECRET
npm install
npm run dev   # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
# edit VITE_API_URL if backend runs elsewhere
npm install
npm run dev   # starts on http://localhost:5173
```

Open http://localhost:5173, register an account, and start adding customers.

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user (protected) |
| GET | /api/customers | List customers with balances |
| POST | /api/customers | Add a customer |
| GET | /api/customers/:id | Get one customer |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer + its transactions |
| GET | /api/customers/:id/transactions | Ledger for a customer |
| POST | /api/transactions | Add "you_gave" / "you_got" entry |
| PUT | /api/transactions/:id | Edit entry |
| DELETE | /api/transactions/:id | Delete entry |

All `/api/customers` and `/api/transactions` routes require `Authorization: Bearer <token>`.

## Notes
- Balance logic: `balance = openingBalance + Σ(you_gave) - Σ(you_got)`. Positive = customer owes you ("You'll get"); negative = you owe the customer ("You'll give").
- This is a learning/starter project — for production, add rate limiting, input validation (e.g. Joi/Zod), HTTPS, refresh tokens, and pagination on transaction lists.
