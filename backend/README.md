# BeautyOnCall Backend

Express + Prisma backend for BeautyOnCall beauty on-demand app.

## 1) Setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npx prisma generate
```

Set your `.env` values (see `.env.example` for all keys).

## 2) Run

```bash
npm run dev
```

## 3) Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/otp/send`
- `POST /api/auth/otp/verify`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/payments/checkout`
- `POST /api/payments/confirm`
- `POST /api/payments/refund`
- `GET /api/wallet/me`
- `POST /api/wallet/topup`
- `POST /api/bookings`
- `GET /api/bookings?clientId=...`
- `PATCH /api/bookings/:id/reschedule`

## Notes

- Database: Supabase PostgreSQL
- Storage: Supabase Storage
- Geocoding: handled client-side with Apple MapKit (no backend geocoding needed)
