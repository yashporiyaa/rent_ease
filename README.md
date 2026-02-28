# RentEase

RentEase is a full-stack rental management platform for managing customers, inventory items, bookings, invoices, receipts, returns, and subscription billing.

## Tech Stack

- `UI`: Next.js 16, React 19, TypeScript, Tailwind CSS
- `API`: NestJS 11, TypeScript, Prisma, PostgreSQL
- `Auth`: Supabase
- `Payments`: Stripe

## Monorepo Structure

```text
rent-ease/
  backend/   # NestJS API + Prisma
  ui/        # Next.js frontend
```

## Core Features

- Authentication (signup/login/logout, password reset)
- Customer and item management
- Rental lifecycle (create, delivery, return, calendar)
- Invoice and PDF generation (classic template)
- Receipt and payment tracking
- Subscription billing with Stripe Checkout + webhooks
- Settings/profile management (company details, logo, tax)

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database
- Supabase project
- Stripe account (for subscription billing)

## Environment Variables

### Backend (`backend/.env`)

Required:

- `DATABASE_URL`
- `PORT` (default `3001`)
- `FRONTEND_URL` (example: `http://localhost:3000`)
- `CORS_ORIGIN` (comma-separated allowed origins)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Optional:

- `COOKIE_SECURE` (`true`/`false`)
- `COOKIE_SAME_SITE` (`lax`/`strict`/`none`)

### UI (`ui/.env`)

- `NEXT_PUBLIC_API_URL` (example: `http://localhost:3001`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local Development

### 1. Install dependencies

```bash
cd backend && npm install
cd ../ui && npm install
```

### 2. Run backend

```bash
cd backend
npm run start:dev
```

### 3. Run frontend

```bash
cd ui
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:3001`

## Build Commands

### Backend

```bash
cd backend
npm run build
```

### UI

```bash
cd ui
npm run build
```

## Stripe Notes

- Ensure backend env contains valid Stripe keys and `STRIPE_PRICE_ID`.
- Configure Stripe webhook endpoint to:
  - `POST /stripe/webhook`
- Use the webhook signing secret as `STRIPE_WEBHOOK_SECRET`.
- Ensure deployed frontend domain is included in backend CORS config.

## Deployment Notes

- Deploy `ui` and `backend` separately.
- In production, set `NEXT_PUBLIC_API_URL` in frontend hosting.
- Set backend `FRONTEND_URL` to the deployed frontend URL.
- Keep `CORS_ORIGIN` aligned with deployed frontend domains.

## License

Private project. All rights reserved.
