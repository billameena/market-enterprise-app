# Enterprise Multi-Vendor E-Commerce Marketplace

A production-grade multi-vendor marketplace (Amazon/Flipkart/Etsy style) built with React 19, Node.js, TypeScript, PostgreSQL, and Redis.

---

## Prerequisites

Make sure the following are installed on your machine before starting.

| Tool | Version | Check |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | 9+ | `npm -v` |
| Docker | Latest | `docker -v` |
| Docker Compose | v2+ | `docker compose version` |
| Git | Any | `git --version` |

> **No local PostgreSQL or Redis needed** — Docker Compose starts them for you.

---

## Project Structure

```
Enterprice-App/
├── backend/          ← Node.js + Express + TypeScript API
├── frontend/         ← React 19 + Vite + TypeScript UI
├── nginx/            ← Nginx reverse proxy config
├── docker-compose.yml
├── ARCHITECTURE.md
├── DATABASE.md
└── ROADMAP.md
```

---

## Local Development Setup

Follow these steps in order. Each step must complete successfully before the next.

---

### Step 1 — Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Enterprice-App

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2 — Configure Environment Variables

**Backend:**

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in the required values. The minimum required values for local development are marked below:

```env
# ── Application ─────────────────────────────────────
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# ── Database (Docker will create this automatically) ─
DATABASE_URL=postgresql://postgres:password@localhost:5432/marketplace_db

# ── Redis (Docker will start this automatically) ─────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ── JWT (REQUIRED — generate keys in Step 3) ─────────
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# ── Email (use MailHog for local — no real email needed) ──
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=

# ── Cloudinary (optional for local — skip image uploads) ──
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ── Stripe (use test keys from dashboard.stripe.com) ──
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
```

**Frontend:**

```bash
cd frontend
cp .env.example .env
```

The default values in `frontend/.env` work out of the box for local development:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx    ← paste your Stripe test key
VITE_APP_NAME="Enterprise Marketplace"
```

---

### Step 3 — Generate JWT Keys

The backend uses RSA-256 asymmetric JWT signing. Run this once to generate your key pair:

```bash
cd backend

# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key from private key
openssl rsa -in private.pem -pubout -out public.pem

# Print keys formatted for .env (copy the output)
echo "JWT_PRIVATE_KEY=\"$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private.pem)\""
echo "JWT_PUBLIC_KEY=\"$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' public.pem)\""
```

Copy the two printed lines and paste them into `backend/.env`, replacing the placeholder values.

Clean up the key files after copying to `.env`:

```bash
rm private.pem public.pem
```

---

### Step 4 — Start Infrastructure (PostgreSQL + Redis + MailHog)

```bash
# From the project root (Enterprice-App/)
docker compose up postgres redis mailhog -d
```

Wait about 10 seconds for PostgreSQL to be fully ready. Verify:

```bash
docker compose ps
```

You should see `postgres`, `redis`, and `mailhog` all showing `running` or `healthy`.

---

### Step 5 — Run Database Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run all migrations (creates all tables)
npx prisma migrate dev --name init
```

Expected output: `Your database is now in sync with your schema.`

Optionally, open Prisma Studio to browse the database visually:

```bash
npx prisma studio
# Opens at http://localhost:5555
```

---

### Step 6 — Start the Backend Server

Open a new terminal window:

```bash
cd backend
npm run dev
```

Expected output:
```
[info] Server running on port 3000
[info] Database connected
[info] Redis connected
[info] BullMQ workers started
```

Verify the API is running:
```bash
curl http://localhost:3000/api/v1/health
# Should return: {"success":true,"message":"OK"}
```

---

### Step 7 — Start the Frontend Dev Server

Open another new terminal window:

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Step 8 — Open the App

| Service | URL | Description |
|---|---|---|
| Frontend | http://localhost:5173 | React app |
| Backend API | http://localhost:3000/api/v1 | REST API |
| MailHog | http://localhost:8025 | Catch all dev emails |
| Prisma Studio | http://localhost:5555 | Database browser |

---

## Available Scripts

### Backend (`/backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `/dist` |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run Jest test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npx prisma migrate dev` | Apply new migrations in development |
| `npx prisma migrate deploy` | Apply migrations in production |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma studio` | Open visual database browser at :5555 |
| `npx prisma db seed` | Seed the database with sample data |
| `npx prisma migrate reset` | Drop all tables and re-run migrations (dev only) |

### Frontend (`/frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at :5173 |
| `npm run build` | Build for production into `/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Run ESLint |

---

## Running with Docker Compose (Full Stack)

To run the entire stack (backend + frontend + nginx + postgres + redis) in Docker:

```bash
# From the project root
cp backend/.env.example backend/.env
# Fill in required values in backend/.env

docker compose up -d
```

Access the app at **http://localhost** (Nginx proxies everything).

To stop:
```bash
docker compose down
```

To stop and remove volumes (wipe database):
```bash
docker compose down -v
```

---

## API Overview

All endpoints are prefixed with `/api/v1`.

| Module | Base Path | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Register, login, logout, refresh token, forgot/reset password |
| Users | `/api/v1/users` | Profile, addresses, wishlist, order history |
| Vendors | `/api/v1/vendors` | Vendor registration, store management |
| Products | `/api/v1/products` | CRUD, variants, images, search |
| Categories | `/api/v1/categories` | Category tree |
| Cart | `/api/v1/cart` | Add/remove/update cart items |
| Orders | `/api/v1/orders` | Place orders, track status |
| Payments | `/api/v1/payments` | Stripe payment intents, webhooks |
| Reviews | `/api/v1/reviews` | Product reviews and ratings |
| Coupons | `/api/v1/coupons` | Apply discount codes |
| Notifications | `/api/v1/notifications` | In-app notification inbox |
| Analytics | `/api/v1/analytics` | Admin and vendor dashboards |

Health check: `GET /api/v1/health`

---

## User Roles

| Role | Access |
|---|---|
| `CUSTOMER` | Browse products, place orders, write reviews |
| `VENDOR` | Manage own store, products, orders, view analytics |
| `SUPPORT` | View all orders, assist customers |
| `ADMIN` | Manage users, approve vendors/products, full analytics |
| `SUPER_ADMIN` | Full system access including CMS and config |

---

## Troubleshooting

**PostgreSQL connection refused**
```bash
# Check if postgres container is running
docker compose ps
# Restart if needed
docker compose restart postgres
```

**Redis connection refused**
```bash
docker compose restart redis
```

**Prisma client not found / P1001 error**
```bash
cd backend
npx prisma generate    # regenerate client
npx prisma migrate dev # re-run migrations
```

**JWT error: invalid key**
- Re-run Step 3 to regenerate keys
- Make sure the key values in `.env` have `\n` between lines (not literal newlines)
- The key must start with `"-----BEGIN RSA PRIVATE KEY-----\n`

**Port already in use**
```bash
# Find and kill the process using port 3000 or 5173
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Frontend can't reach backend (CORS error)**
- Confirm `FRONTEND_URL=http://localhost:5173` is set in `backend/.env`
- Confirm `VITE_API_URL=http://localhost:3000/api/v1` is set in `frontend/.env`
- Restart the backend after changing `.env`

**Emails not arriving**
- MailHog catches all dev emails at http://localhost:8025
- Confirm `SMTP_HOST=localhost` and `SMTP_PORT=1025` in `backend/.env`

---

## Tech Stack Summary

**Backend:** Node.js 20 · Express.js · TypeScript · PostgreSQL 16 · Prisma ORM · Redis · BullMQ · Socket.io · Stripe · Cloudinary · Nodemailer · Winston · Zod · JWT RS256

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · TanStack Router · TanStack Query · TanStack Table · React Hook Form · Zod · Zustand · Axios · Recharts · Socket.io Client

**DevOps:** Docker · Docker Compose · Nginx · GitHub Actions




Database is now seeded with:
     
  ┌────────────┬───────┬───────────────────────────────────────┐
  │    Type    │ Count │                Details                │
  ├────────────┼───────┼───────────────────────────────────────┤
  │ Users      │ 6     │ Super Admin, Admin, 2 Vendors, 2      │
  │            │       │ Customers                             │
  ├────────────┼───────┼───────────────────────────────────────┤
  │ Vendors    │ 2     │ TechStore Pro (8.5% commission),      │
  │            │       │ Fashion Hub (10%)                     │
  ├────────────┼───────┼───────────────────────────────────────┤
  │ Categories │ 9     │ Electronics, Fashion, Home, Sports +  │
  │            │       │ 5 subcategories                       │
  ├────────────┼───────┼───────────────────────────────────────┤
  │            │       │ iPhones, MacBook, Dell XPS, Sony      │
  │ Products   │ 8     │ headphones, JBL speaker, T-shirts,    │
  │            │       │ dress                                 │
  ├────────────┼───────┼───────────────────────────────────────┤
  │ Coupons    │ 5     │ WELCOME10, SAVE20, FREESHIP, TECH15,  │
  │            │       │ SUMMER25                              │
  ├────────────┼───────┼───────────────────────────────────────┤
  │ Banners    │ 3     │ Hero + category banners               │
  ├────────────┼───────┼───────────────────────────────────────┤
  │ FAQs       │ 5     │ Orders, Returns, Vendors, Payments    │
  │            │       │ topics                                │
  ├────────────┼───────┼───────────────────────────────────────┤
  │ CMS Pages  │ 3     │ About, Privacy Policy, Terms          │
  └────────────┴───────┴───────────────────────────────────────┘

  Login credentials:
  Super Admin:  superadmin@marketplace.com / SuperAdmin@123
  Admin:        admin@marketplace.com / Admin@123
  Vendor:       vendor@techstore.com / Vendor@123
  Customer:     john.doe@example.com / Customer@123
  
  To re-seed any time: cd backend && npx prisma db seed


Code changes are done. Now here's the complete
  step-by-step deployment guide:

  ---
  Free Deployment Guide

  Step 1 — Push to GitHub

  Your code needs to be on GitHub for Vercel and Render
  to pull from it.

  cd /home/mbilla/Desktop/full-stack/Enterprice-App
  git init
  git add .
  git commit -m "initial commit"
  # Create a repo at github.com, then:
  git remote add origin https://github.com/YOUR_USERNAME
  /enterprise-marketplace.git
  git push -u origin main

  ---
  Step 2 — Upstash (Free Redis)
  
  1. Go to upstash.com → sign up free → Create Database
  2. Choose region: ap-northeast-1 (same as your
  Supabase region)
  3. After creation, click the database → Details tab
  4. You'll see:
    - Endpoint → this is your REDIS_HOST
    - Port → REDIS_PORT (usually 6379)
    - Password → REDIS_PASSWORD
    - TLS is always enabled on Upstash → REDIS_TLS=true
  (already set in render.yaml)

  ---
  Step 3 — Deploy Backend on Render

  1. Go to render.com → sign up free with GitHub
  2. Click New → Web Service → connect your GitHub repo
  3. Render will auto-detect render.yaml and pre-fill
  settings
  4. Set these environment variables in the Render
  dashboard (the sync: false ones):

  ┌───────────────┬─────────────────────────────────┐
  │   Variable    │              Value              │
  ├───────────────┼─────────────────────────────────┤
  │ DATABASE_URL  │ Your Supabase Session Pooler    │
  │               │ URL from .env                   │
  ├───────────────┼─────────────────────────────────┤
  │ REDIS_HOST    │ Upstash endpoint                │
  ├───────────────┼─────────────────────────────────┤
  │ REDIS_PORT    │ 6379                            │
  ├───────────────┼─────────────────────────────────┤
  │ REDIS_PASSWOR │ Upstash password                │
  │ D             │                                 │
  ├───────────────┼─────────────────────────────────┤
  │ JWT_PRIVATE_K │ Copy from your local            │
  │ EY            │ backend/.env                    │
  ├───────────────┼─────────────────────────────────┤
  │ JWT_PUBLIC_KE │ Copy from your local            │
  │ Y             │ backend/.env                    │
  ├───────────────┼─────────────────────────────────┤
  │ SESSION_SECRE │ Any random 32+ char string      │
  │ T             │                                 │
  ├───────────────┼─────────────────────────────────┤
  │ APP_URL       │ https://marketplace-api.onrende │
  │               │ r.com (your Render URL)         │
  ├───────────────┼─────────────────────────────────┤
  │ FRONTEND_URL  │ Set after Vercel deploy (step   │
  │               │ 4)                              │
  ├───────────────┼─────────────────────────────────┤
  │ CORS_ORIGINS  │ Set after Vercel deploy (step   │
  │               │ 4)                              │
  └───────────────┴─────────────────────────────────┘

  5. Click Deploy — first deploy takes ~5 minutes. Note
  your Render URL (e.g.,
  https://marketplace-api.onrender.com).

  ---
  Step 4 — Deploy Frontend on Vercel

  1. Go to vercel.com → sign up free with GitHub
  2. Click New Project → import your repo
  3. Framework: Vite (auto-detected)
  4. Root Directory: frontend
  5. Set these Environment Variables:

  ┌───────────────────┬─────────────────────────────┐
  │     Variable      │            Value            │
  ├───────────────────┼─────────────────────────────┤
  │ VITE_API_URL      │ https://marketplace-api.onr │
  │                   │ ender.com/api/v1            │
  ├───────────────────┼─────────────────────────────┤
  │ VITE_SOCKET_URL   │ https://marketplace-api.onr │
  │                   │ ender.com                   │
  ├───────────────────┼─────────────────────────────┤
  │ VITE_STRIPE_PUBLI │ pk_test_your-stripe-publish │
  │ SHABLE_KEY        │ able-key                    │
  └───────────────────┴─────────────────────────────┘

  6. Click Deploy — takes ~2 minutes. Note your Vercel
  URL (e.g., https://your-app.vercel.app).

  ---
  Step 5 — Update CORS on Render

  Go back to Render → your service → Environment →
  update:

  ┌──────────────┬─────────────────────────────┐
  │   Variable   │            Value            │
  ├──────────────┼─────────────────────────────┤
  │ FRONTEND_URL │ https://your-app.vercel.app │
  ├──────────────┼─────────────────────────────┤
  │ CORS_ORIGINS │ https://your-app.vercel.app │
  └──────────────┴─────────────────────────────┘

  Save → Render auto-redeploys.

  ---
  Free Tier Limits to Know

  ┌──────────┬────────────────────┬─────────────────┐
  │ Service  │       Limit        │     Impact      │
  ├──────────┼────────────────────┼─────────────────┤
  │          │                    │ First request   │
  │ Render   │ Spins down after   │ after idle      │
  │          │ 15 min idle        │ takes ~30-60s   │
  │          │                    │ to wake up      │
  ├──────────┼────────────────────┼─────────────────┤
  │          │ Project pauses     │ Unpause         │
  │ Supabase │ after 1 week with  │ manually in     │
  │          │ no traffic         │ dashboard       │
  ├──────────┼────────────────────┼─────────────────┤
  │ Upstash  │ 10,000 Redis       │ Enough for      │
  │          │ commands/day       │ demo/dev use    │
  ├──────────┼────────────────────┼─────────────────┤
  │          │                    │ Effectively     │
  │ Vercel   │ 100GB              │ unlimited for a │
  │          │ bandwidth/month    │  portfolio      │
  │          │                    │ project         │
  └──────────┴────────────────────┴─────────────────┘

  Optional Free Email (instead of skipping emails)

  Sign up at resend.com (free: 100 emails/day) → set
  SMTP_HOST=smtp.resend.com, SMTP_PORT=465,
  SMTP_USER=resend, SMTP_PASSWORD=your-api-key.



Code Change 1 — backend/src/configs/redis.ts
  
  What: Added a new getBullMQConnection() helper
  function.

  export function getBullMQConnection() {
    const conn = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
    if (env.REDIS_TLS) conn['tls'] = {};
    return conn;
  }

  Why it was required:
  - The free Redis service (Upstash) requires TLS
  (encrypted connection). Without TLS, Upstash rejects
  the connection entirely.
  - The existing redis client already had TLS support,
  but BullMQ (the job queue) creates its own separate 
  Redis connections — it doesn't reuse the main redis
  client.
  - All 3 job files were hardcoding { host, port, 
  password } with no TLS, so they would fail silently on
   Upstash.
  - maxRetriesPerRequest: null is also required by
  BullMQ — without it, BullMQ throws a warning and may
  behave incorrectly in production.

  ---
  Code Change 2 — email.job.ts, notification.job.ts, 
  ai.job.ts
  
  What: Replaced the hardcoded inline Redis connection
  objects in all 3 files with getBullMQConnection().

  Before (in each file, 2 places — Queue and Worker):
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    // no TLS — Upstash rejects this
  }

  After:
  connection: getBullMQConnection()  // TLS included 
  when REDIS_TLS=true

  Why it was required:
  - There are 3 job queues × 2 connection blocks each =
  6 places all with the same bug. Rather than fixing
  each individually and risking missing one, a single
  shared function fixes all of them at once. 
  - If you ever add a 4th queue, it automatically gets
  TLS support too.

  ---
  Code Change 3 — render.yaml

  What: Rewrote the entire file to match the actual
  environment variable names used in your backend code.

  Why it was required:
  The old render.yaml was out of sync with your actual
  env.ts schema. It had wrong variable names:

  ┌──────────────────────────┬───────────────────────┐
  │       Old (wrong)        │        Correct        │
  ├──────────────────────────┼───────────────────────┤
  │ ACCESS_TOKEN_PRIVATE_KEY │ JWT_PRIVATE_KEY       │
  ├──────────────────────────┼───────────────────────┤
  │ ACCESS_TOKEN_PUBLIC_KEY  │ JWT_PUBLIC_KEY        │
  ├──────────────────────────┼───────────────────────┤
  │ CORS_ORIGIN              │ CORS_ORIGINS          │
  ├──────────────────────────┼───────────────────────┤
  │                          │ REDIS_HOST +          │
  │ REDIS_URL                │ REDIS_PORT +          │
  │                          │ REDIS_PASSWORD +      │
  │                          │ REDIS_TLS             │
  └──────────────────────────┴───────────────────────┘

  If you had deployed with the old file, the backend
  would crash immediately on startup because Zod (your
  env validator in env.ts) would report JWT_PRIVATE_KEY 
  is required and call process.exit(1).

  The new file lists every env var that env.ts expects,
  with sync: false for the secret/unique ones (those you
   fill in manually on the Render dashboard) and
  hardcoded value: for the ones that are the same
  everywhere.

  ---
  How to Access the App After Deployment

  You'll have two URLs once deployed:

  Your frontend (the actual app users visit)

  https://your-app-name.vercel.app
  This is what you share with people. It serves the full
   React app — home page, product listings, cart,
  checkout, vendor dashboard, admin panel, everything.

  Your backend API (not visited directly by users)

  https://marketplace-api.onrender.com
  The frontend talks to this behind the scenes. You can
  confirm it's running by opening:
  https://marketplace-api.onrender.com/api/v1/health
  You should see a JSON response like { "status": "ok" 
  }.

  ---
  First time after deployment — what to expect

  1. Open your Vercel URL → the app loads (fast, Vercel
  CDN)
  2. Try to log in → the frontend sends a request to
  Render
    - If Render has been idle for 15+ minutes, the first
   request takes ~45 seconds while the server wakes up.
  This is the only free-tier limitation you'll notice
  day-to-day.
    - After it wakes up, everything is fast.
  3. Supabase — if the project has been inactive for a
  week, Supabase pauses it. You'll get a database error.
   Fix: go to supabase.com → your project → click
  Restore.

  The URL your users bookmark

  https://your-app-name.vercel.app
  That's the only URL that matters for day-to-day use.
  Everything else (Render, Supabase, Upstash) is
  infrastructure that runs in the background.

✻ Brewed for 26s

❯ another doubt once I deploy the app do we need to do  
  actual payment for order processing                   
  
● Let me check exactly how your app handles payment when
   Stripe isn't configured:

● Bash(find /home/mbilla/Desktop/full-stack/Enterprice-A
      pp/backend/src -name "*.ts" | xargs grep -l
      "clientSecret\|mock_\|stripe" 2>/dev/null)
  ⎿  /home/mbilla/Desktop/full-stack/Enterprice-App
     /backend/src/modules/orders/orders.types.ts
     /home/mbilla/Desktop/full-stack/Enterprice-App
     … +10 lines (ctrl+o to expand)

  Read 2 files (ctrl+o to expand)

● Good news — your app is already built to handle all
  three scenarios. Here's the full picture:

  ---
  No, you don't need real payments
  
  Your backend has this function in
  orders.service.ts:19:

  function isStripeConfigured(): boolean {
    const key = env.STRIPE_SECRET_KEY ?? '';
    return key.startsWith('sk_') && key.length > 40;
  }

  Based on this, the app has 3 modes that work
  automatically:

  ---
  Mode 1 — Demo Mode (what you have right now, zero 
  setup)
  
  When STRIPE_SECRET_KEY is the placeholder
  sk_test_your-stripe-secret-key, isStripeConfigured()
  returns false. The backend returns clientSecret = 
  "mock_<orderId>" instead of hitting Stripe.

  Your frontend at CheckoutForm.tsx:194 detects this:
  {clientSecret.startsWith('mock_') ? (
    // Shows a yellow banner: "Demo Mode — Stripe not 
  configured"
    // Shows a single "Complete Order (Demo)" button
    // Clicking it marks the order as PAID immediately —
   no card needed
  
  Result: Orders complete end-to-end, payment shows as
  PAID, vendor sees the order, everything works — with a
   single button click and no payment at all. Perfect
  for demos and portfolios.

  ---
  Mode 2 — Stripe Test Mode (free, fake card numbers, no
   real money)
  
  Sign up at stripe.com (free, no business verification
  needed). Get your test keys — they look like
  sk_test_51... (real format, long enough to pass
  isStripeConfigured()).

  Set on Render:
  STRIPE_SECRET_KEY=sk_test_51...your-real-test-key...
  STRIPE_PUBLISHABLE_KEY=pk_test_51...your-real-test-key
  ...
  
  Set on Vercel:
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
  
  Now the real Stripe card form appears. Use these fake 
  card numbers — no real money ever moves:

  ┌─────────────────────┬─────────────────────────┐
  │     Card Number     │         Result          │
  ├─────────────────────┼─────────────────────────┤
  │ 4242 4242 4242 4242 │ Payment succeeds        │
  ├─────────────────────┼─────────────────────────┤
  │ 4000 0000 0000 0002 │ Card declined           │
  ├─────────────────────┼─────────────────────────┤
  │ 4000 0025 0000 3155 │ Requires 3D Secure auth │
  └─────────────────────┴─────────────────────────┘

  Any future expiry date and any 3-digit CVV work.

  ---
  Mode 3 — Live Mode (real money, needs business setup)

  Requires Stripe account verification with business
  details, bank account, etc. Only needed if you're
  actually selling products to real customers.

  ---
  Summary

  ┌──────────────┬─────────────────┬────────────────┐
  │  Situation   │   What to do    │      Cost      │
  ├──────────────┼─────────────────┼────────────────┤
  │ Portfolio /  │ Nothing — Demo  │                │
  │ showing to   │ Mode works      │ Free           │
  │ someone      │                 │                │
  ├──────────────┼─────────────────┼────────────────┤
  │ Testing the  │ Get Stripe test │                │
  │ full payment │  keys (just     │ Free           │
  │  UI          │ sign up)        │                │
  ├──────────────┼─────────────────┼────────────────┤
  │ Real         │ Stripe live     │ Stripe takes   │
  │ customers,   │ keys + business │ 2.9% + 30¢ per │
  │ real money   │  verification   │  transaction   │
  └──────────────┴─────────────────┴────────────────┘

  For deployment right now, Demo Mode is perfectly fine.
   Just leave
  STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key as-is
   on Render and orders will complete with the yellow
  "Demo Mode" button.
