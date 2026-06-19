# Enterprise Marketplace — Backend Architecture & Flows

> Complete reference for all backend flows, job processing, real-time events, and Supabase migration.

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Products Loading Flow](#3-products-loading-flow)
4. [Cart Flow](#4-cart-flow)
5. [Order Creation Flow](#5-order-creation-flow)
6. [Checkout & Payment Flow](#6-checkout--payment-flow)
7. [Order Status Tracking](#7-order-status-tracking)
8. [BullMQ Job Queue System](#8-bullmq-job-queue-system)
9. [Socket.io Real-Time Events](#9-socketio-real-time-events)
10. [Automating Order Status](#10-automating-order-status)
11. [Supabase Migration Guide](#11-supabase-migration-guide)

---

## 1. Tech Stack Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React 19)                │
│         Vite · TanStack Router · TanStack Query      │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP + WebSocket
┌───────────────────────▼─────────────────────────────┐
│              Backend (Node.js + Express)             │
│         TypeScript · Prisma ORM · Socket.io          │
└──────┬──────────────────────────┬───────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│  PostgreSQL  │          │     Redis        │
│  (Database)  │          │  (Cache + Queue) │
└─────────────┘          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │    BullMQ        │
                          │  (Job Workers)   │
                          └─────────────────┘
```

### Infrastructure (Docker Compose)

| Service | Container | Port | Purpose |
|---|---|---|---|
| PostgreSQL 16 | marketplace_postgres | 5432 | Primary database |
| Redis 7 | marketplace_redis | 6379 | Cache + BullMQ queue storage |
| Backend (Node) | marketplace_backend | 3000 | API server |
| Frontend (React) | marketplace_frontend | 5173 | UI dev server |
| MailHog | marketplace_mailhog | 8025 | Local email UI |

### Key Environment Variables

```env
DATABASE_URL=postgresql://...       # PostgreSQL connection
REDIS_HOST=localhost                 # Redis for BullMQ + cache
REDIS_PASSWORD=redis_secret
JWT_PRIVATE_KEY=...                  # RS256 private key (sign tokens)
JWT_PUBLIC_KEY=...                   # RS256 public key (verify tokens)
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
STRIPE_SECRET_KEY=sk_test_...        # Payment processing
STRIPE_WEBHOOK_SECRET=whsec_...      # Webhook signature verification
GEMINI_API_KEY=...                   # AI description generation
PLATFORM_TAX_RATE=8                  # 8% tax on all orders
FREE_SHIPPING_THRESHOLD=50           # Free shipping over $50
```

---

## 2. Authentication Flow

### 2.1 Registration

```
POST /api/v1/auth/register
Body: { email, password, firstName, lastName }
```

```
1. Check if email already exists → 409 Conflict if yes
2. hashPassword(password)        → bcrypt with 12 salt rounds
3. generateSecureToken(32)       → email verification token
4. prisma.user.create({
     email, hashedPassword, firstName, lastName,
     emailVerificationToken, emailVerificationExpiry: +24h,
     role: 'CUSTOMER'            → default role
   })
5. emailQueue.add('send-verification-email', { to, verificationUrl })
   → BullMQ queues the job, email sends in background
6. Return 201: "Check your email to verify your account"
```

### 2.2 Login

```
POST /api/v1/auth/login
Body: { email, password }
```

```
1. repo.findUserByEmail(email)
   → 401 if not found (generic message to prevent email enumeration)

2. Check account lock:
   isLocked=true AND lockUntil > now?
   → 401 "Account locked, try again in X minutes"

3. comparePassword(input, user.passwordHash)
   → WRONG: incrementFailedLoginAttempts()
            if attempts >= 5: lockAccount(lockUntil: +30min)
   → RIGHT:  resetFailedLoginAttempts()

4. Create UserSession in DB:
   {
     userId,
     refreshTokenHash: SHA256(rawToken),  ← hash stored, not raw
     deviceInfo, ipAddress, userAgent,
     expiresAt: +7 days
   }

5. Issue token pair:
   accessToken  = RS256 JWT { sub: userId, email, role, sessionId }  → expires 15min
   refreshToken = RS256 JWT { sub: userId, sessionId, jti: rawToken } → expires 7 days

6. Update user: lastLoginAt, lastLoginIp

7. Return: { user: { id, email, firstName, lastName, role, avatarUrl }, tokens }
```

### 2.3 Token Refresh

```
POST /api/v1/auth/refresh
Body: { refreshToken }
```

```
1. verifyRefreshToken(token)              → decode JWT, check expiry
2. findSessionById(payload.sessionId)    → session must exist in DB
3. SHA256(payload.jti) === session.refreshTokenHash?
   → NO: Token reuse detected!
         invalidateAllUserSessions(userId)  ← security: wipe everything
         401 "Refresh token reuse detected"
   → YES: Continue

4. invalidateSession(oldSessionId)       ← rotation: old session deleted
5. Create new session with new token hash
6. Issue new accessToken + refreshToken
7. Return new token pair
```

**Why rotation?** If an attacker steals a refresh token and tries to use it after you already used it, the server detects the reuse and logs you out of ALL devices immediately.

### 2.4 Authentication Middleware

Every protected route runs this:

```
Authorization: Bearer <accessToken>
       ↓
verifyAccessToken(token)
  → Decode RS256 JWT with public key
  → Check expiry
  → Attach { userId, role, sessionId } to req.user
       ↓
Route handler runs with req.user populated
```

### 2.5 Role-Based Access Control

```
requireRole('ADMIN')   → blocks anyone without ADMIN or SUPER_ADMIN role
requireRole('VENDOR')  → blocks non-vendors
```

---

## 3. Products Loading Flow

### 3.1 Public Product Listing

```
GET /api/v1/products?page=1&categoryId=...&search=laptop&minPrice=100
```

```
1. Parse query params (page, limit, categoryId, search, minPrice, maxPrice,
                       sortBy, sortOrder, isFeatured)

2. Expand categoryId to include ALL subcategories:
   getCategoryDescendantIds(categoryId)
   → recursive query through category tree
   → e.g. "Electronics" expands to ["Laptops", "Phones", "Tablets", ...]

3. Build Prisma WHERE clause:
   {
     status: 'ACTIVE',         ← ONLY active products visible to public
     deletedAt: null,          ← soft-delete filter
     categoryId: { in: [...descendantIds] },
     price: { gte: minPrice, lte: maxPrice },
     OR: [
       { name: { contains: search } },
       { description: { contains: search } }
     ]
   }

4. prisma.product.findMany({
     where, skip, take,
     orderBy: { [sortBy]: sortOrder },
     include: {
       images: { where: { isPrimary: true }, take: 1 },
       inventory: true,
       vendor: { select: { id, businessName } },
       store: { select: { id, name, slug } },
       category: true
     }
   })

5. Cache result in Redis for 30 minutes
   → Same query hits Redis next time, PostgreSQL not touched

6. Return { data: products[], total, page, pageSize, totalPages }
```

### 3.2 Product Status Lifecycle

```
DRAFT                → created by vendor, invisible to customers
  ↓ (vendor saves/edits)
PENDING_REVIEW       → in admin review queue
  ↓ (admin approves)
ACTIVE               → visible on storefront, purchasable
  ↓ (admin rejects / vendor archives)
REJECTED / ARCHIVED  → hidden from storefront
```

### 3.3 Redis Caching Strategy

```
Individual product:   cache key = "marketplace:product:{id}"    TTL = 30min
Product list:         NOT cached (too many filter combinations)
Category tree:        cache key = "marketplace:categories:tree"  TTL = 60min

Cache invalidation:
  → When vendor updates a product:  cache.del("marketplace:product:{id}")
  → When admin approves product:    cache.del("marketplace:product:{id}")
```

---

## 4. Cart Flow

### 4.1 Guest vs Authenticated Cart

```
Guest user:
  x-session-id header (UUID generated in browser localStorage)
  → Cart stored in DB linked to sessionId
  → Expires after 7 days

Logged-in user:
  JWT Bearer token
  → Cart stored in DB linked to userId
  → Persists until checkout

On login:
  POST /api/v1/cart/merge
  → Merges guest cart items into user cart
  → Guest cart deleted
```

### 4.2 Add to Cart

```
POST /api/v1/cart/items
Body: { productId, quantity, variantId? }
```

```
1. getOrCreateCart(userId or sessionId)

2. Validate product:
   prisma.product.findUnique({
     where: { id: productId, status: 'ACTIVE', deletedAt: null }
   })
   → 404 if not found or not active

3. Stock check:
   If has variants:  variant.stock >= requestedQuantity?
   If no variants:   inventory.quantity - inventory.reservedQuantity >= quantity?
   If insufficient AND allowBackorder=false → 400 "Insufficient stock"

4. repo.addItem(cartId, { productId, quantity, price: product.price })
   IMPORTANT: price is SNAPSHOTTED at add time
   → Even if vendor changes price later, cart keeps original price

5. Return full cart summary with recalculated totals
```

### 4.3 Cart Summary Calculation

```
subtotal       = Σ (item.price × item.quantity)
discountAmount = coupon type?
                   PERCENTAGE:   subtotal × (couponValue / 100)
                                 capped at maxDiscountAmount
                   FIXED_AMOUNT: min(couponValue, subtotal)
                   FREE_SHIPPING: discountAmount = 0 (affects shipping only)
taxableAmount  = subtotal - discountAmount
taxAmount      = taxableAmount × 0.08  (8% from PLATFORM_TAX_RATE env)
shippingAmount = coupon FREE_SHIPPING? 0
                 subtotal >= $50?       0  (FREE_SHIPPING_THRESHOLD)
                 else                  $5.99
total          = taxableAmount + taxAmount + shippingAmount
```

---

## 5. Order Creation Flow

```
POST /api/v1/orders
Body: { shippingAddress: { firstName, lastName, addressLine1, city, state, postalCode, country } }
```

```
1. cartService.getCart(userId)
   → Builds full cart summary with all items, prices, totals
   → 400 if cart is empty

2. Resolve vendorId per product:
   prisma.product.findMany({ where: { id: { in: productIds } }, select: { id, vendorId } })
   → Map<productId → vendorId>
   → Needed so each OrderItem knows which vendor it belongs to

3. generateOrderNumber()  →  "ORD-XXXXXXXX-XXXXXX"  (unique, human-readable)

4. prisma.$transaction([...])   ← ATOMIC — all succeed or all roll back
   ┌──────────────────────────────────────────────────────┐
   │  a. order.create({                                    │
   │       userId, orderNumber,                            │
   │       subtotal, discountAmount, taxAmount,            │
   │       shippingAmount, totalAmount,                    │
   │       status: 'PENDING',                              │
   │       shippingAddress: { create: { ...addr } },       │
   │       items: {                                        │
   │         create: cartItems.map(item => ({              │
   │           productId, variantId,                       │
   │           vendorId,          ← from Map above         │
   │           productName,       ← SNAPSHOT               │
   │           sku,               ← SNAPSHOT               │
   │           imageUrl,          ← SNAPSHOT               │
   │           unitPrice,         ← SNAPSHOT               │
   │           quantity, totalPrice                        │
   │         }))                                           │
   │       },                                              │
   │       statusHistory: { create: { status: 'PENDING' }} │
   │     })                                                │
   │                                                       │
   │  b. For each item:                                    │
   │     productInventory.update({                         │
   │       reservedQuantity: { increment: quantity }       │
   │     })         ← reserves stock (not deducted yet)    │
   │                                                       │
   │  c. cartItem.deleteMany()    ← clears the cart        │
   └──────────────────────────────────────────────────────┘

5. Create Stripe PaymentIntent:
   Stripe configured (real keys)?
     YES → stripe.paymentIntents.create({ amount, currency, metadata })
           → returns real clientSecret
     NO  → clientSecret = "mock_{orderId}"
           → frontend shows "Complete Order (Demo)" button

6. prisma.payment.create({
     orderId, method: 'STRIPE', status: 'PENDING',
     amount, stripePaymentIntentId
   })

7. Fire background jobs (non-blocking):
   emailQueue.add('send-order-confirmation', { orderId, userId })
   notificationQueue.add('in-app-notification', { type: 'ORDER_PLACED', ... })
   emitToUser(userId, 'order:created', { orderId, orderNumber })

8. Return: { orderId, orderNumber, clientSecret, amount }
```

**Why snapshots on OrderItem?**
Product names, prices, and images can change after the order is placed. Snapshots freeze the state at purchase time so the order history always reflects what the customer actually bought and paid.

---

## 6. Checkout & Payment Flow

### 6.1 Full Checkout Sequence

```
FRONTEND                          BACKEND                        STRIPE / DB
────────                          ───────                        ──────────────
Fill shipping address
        │
        ├──POST /orders ─────────► createOrder()
        │                              │
        │                         Validate cart
        │                         Create order (PENDING)
        │                         Reserve inventory
        │                         Clear cart
        │                         Create PaymentIntent ─────────► stripe.paymentIntents.create()
        │                              │                          Returns clientSecret
        │◄─────── { clientSecret } ────┘
        │
   clientSecret starts with "mock_"?
   ┌─── YES (Demo mode) ────────────────────────────────────────────────────┐
   │   Show "Complete Order (Demo)" button                                   │
   │   onClick → POST /payments/confirm { orderId, paymentIntentId: mock_X }│
   └────────────────────────────────────────────────────────────────────────┘
   ┌─── NO (Real Stripe) ───────────────────────────────────────────────────┐
   │   Render Stripe Elements card form                                      │
   │   Customer enters card → stripe.confirmPayment()                        │
   │   On success → POST /payments/confirm { orderId, paymentIntentId }      │
   └────────────────────────────────────────────────────────────────────────┘
        │
        ├──POST /payments/confirm ─► confirmPayment()
        │                              │
        │                         payment.update({ status: 'PAID' })
        │                         order.update({
        │                           paymentStatus: 'PAID',
        │                           status: 'CONFIRMED'      ← key transition
        │                         })
        │                         notificationQueue.add(PAYMENT_SUCCESS)
        │                         emitToUser('payment:confirmed')
        │◄─────── 200 OK ───────────┘
        │
   clearLocalCart()
   invalidateQueries(['cart', 'orders', 'vendor:orders'])
   navigate('/order-success')
```

### 6.2 Real Stripe Webhook Flow (Production)

In production, Stripe calls your backend directly when payment succeeds — you don't need the frontend to call `/payments/confirm`:

```
Customer pays with real card
        │
        ├──► Stripe processes payment
        │
        ├──► POST /api/v1/payments/webhook  (Stripe → your server)
        │    Header: stripe-signature: t=...,v1=...
        │
        │    handleWebhook():
        │      stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
        │      → verifies the call is genuinely from Stripe
        │
        │    event.type === 'payment_intent.succeeded'?
        │      → handlePaymentSuccess()
        │         payment.update({ status: 'PAID' })
        │         order.update({ status: 'CONFIRMED' })
        │         emailQueue.add('send-order-confirmation')
        │         emitToUser('payment:confirmed')
        │
        │    event.type === 'payment_intent.payment_failed'?
        │      → order.update({ status: 'PAYMENT_FAILED' })
```

### 6.3 Testing Webhooks Locally

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/v1/payments/webhook

# In another terminal, trigger a test event
stripe trigger payment_intent.succeeded
```

---

## 7. Order Status Tracking

### 7.1 Status State Machine

```
                    ┌─────────────────┐
                    │     PENDING      │  ← created on order
                    └────────┬────────┘
            payment success  │   payment failed
                    ┌────────▼────────┐   ┌──────────────────┐
                    │   CONFIRMED      │   │  PAYMENT_FAILED  │
                    └────────┬────────┘   └──────────────────┘
              vendor acts    │   vendor cancels
                    ┌────────▼────────┐
                    │   PROCESSING    │  ← vendor packs order
                    └────────┬────────┘
          vendor ships       │   vendor cancels
                    ┌────────▼────────┐
                    │    SHIPPED      │  ← tracking number entered
                    └────────┬────────┘
          carrier delivers   │
                    ┌────────▼────────┐
                    │   DELIVERED     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   COMPLETED     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    REFUNDED     │
                    └─────────────────┘
```

### 7.2 Status Update API

```
PATCH /api/v1/orders/:id/status
Body: { status, comment?, trackingNumber?, carrier? }
Role: VENDOR
```

```
1. repo.findById(orderId)
2. Check VALID_TRANSITIONS[currentStatus].includes(newStatus)
   → 400 if not allowed (e.g. SHIPPED → PENDING is blocked)
3. repo.update(orderId, {
     status: newStatus,
     shippedAt:    if SHIPPED
     deliveredAt:  if DELIVERED
     completedAt:  if COMPLETED
     cancelledAt:  if CANCELLED
   })
4. repo.addStatusHistory(orderId, newStatus, comment, changedBy)
   → Full audit trail in order_status_history table
5. notificationQueue.add('in-app-notification', {
     userId: order.userId,   ← notify the CUSTOMER, not vendor
     type: 'ORDER_CONFIRMED' / 'ORDER_SHIPPED' / etc.
   })
6. emitToUser(order.userId, 'order:status_changed', { orderId, status })
   → Customer's browser updates in real-time without refresh
```

### 7.3 Who Can Change What

| Transition | Triggered by | How |
|---|---|---|
| PENDING → CONFIRMED | System | Auto on payment confirmation |
| PENDING → PAYMENT_FAILED | System | Stripe webhook / payment failure |
| CONFIRMED → PROCESSING | Vendor | "Update" button in vendor dashboard |
| PROCESSING → SHIPPED | Vendor | "Update" + enter tracking number |
| SHIPPED → DELIVERED | Vendor | "Update" button |
| DELIVERED → COMPLETED | Vendor | "Update" button |
| Any → CANCELLED | Customer or Vendor | Only from PENDING or CONFIRMED |

---

## 8. BullMQ Job Queue System

### 8.1 Why BullMQ?

Without a queue, if email sending fails, the user gets an error. With BullMQ:
- Order creation succeeds immediately
- Email/notification is retried automatically on failure
- Slow tasks (email, PDF generation, AI) don't block the HTTP response

### 8.2 Architecture

```
                    ┌─────────────────────────────────────┐
                    │              Redis                    │
                    │                                       │
                    │  email-queue (list/sorted sets)       │
                    │  ┌──────────┬──────────┬──────────┐  │
                    │  │  Job 1   │  Job 2   │  Job 3   │  │
                    │  │ verify   │ order    │ reset    │  │
                    │  │ email    │ confirm  │ password │  │
                    │  └──────────┴──────────┴──────────┘  │
                    │                                       │
                    │  notification-queue                   │
                    │  ┌──────────┬──────────┐             │
                    │  │  Job 1   │  Job 2   │             │
                    │  │ ORDER    │ PAYMENT  │             │
                    │  │ PLACED   │ SUCCESS  │             │
                    │  └──────────┴──────────┘             │
                    └─────────────┬───────────────────────┘
                                  │  BLPOP (blocking pop)
                    ┌─────────────▼───────────────────────┐
                    │            Workers                    │
                    │  emailWorker (concurrency: 3)         │
                    │  notificationWorker (concurrency: 2)  │
                    └─────────────────────────────────────┘
```

### 8.3 Queue Definition (Producer side)

```typescript
// email.job.ts
export const emailQueue = new Queue('email-queue', {
  connection: {
    host: REDIS_HOST,      // localhost
    port: REDIS_PORT,      // 6379
    password: REDIS_PASSWORD
  },
  defaultJobOptions: {
    attempts: 3,           // retry up to 3 times on failure
    backoff: {
      type: 'exponential', // wait 5s, 10s, 20s between retries
      delay: 5000
    },
    removeOnComplete: 100, // keep last 100 completed jobs for inspection
    removeOnFail: 500      // keep last 500 failed jobs for debugging
  }
});
```

### 8.4 Adding a Job (anywhere in the app)

```typescript
// Inside auth.service.ts after user registers:
await emailQueue.add('send-verification-email', {
  to: user.email,
  name: user.firstName,
  verificationUrl: 'https://...'
});
// Returns immediately — email sends asynchronously
```

Redis stores this as:
```
Key:   bull:email-queue:1
Value: { name: "send-verification-email", data: { to, name, url }, timestamp, attempts: 0 }
```

### 8.5 Worker (Consumer side)

```typescript
// email.job.ts
const worker = new Worker('email-queue', async (job: Job) => {
  switch (job.name) {
    case 'send-verification-email':
      await sendEmail({ to, subject, html: buildVerificationTemplate() });
      break;
    case 'send-order-confirmation':
      // fetch order from DB, build HTML, send email
      break;
  }
}, {
  connection: redisConnection,
  concurrency: 3   // process 3 jobs simultaneously
});

worker.on('completed', (job) => logger.info('Done', { jobId: job.id }));
worker.on('failed', (job, err) => logger.error('Failed', { jobId: job.id, err }));
```

### 8.6 All Jobs in This App

| Queue | Job Name | Triggered From | What it Does |
|---|---|---|---|
| email-queue | send-verification-email | auth.service → register | Sends email verify link via SMTP |
| email-queue | send-password-reset | auth.service → forgotPassword | Sends reset link |
| email-queue | send-order-confirmation | orders.service, payments.service | Sends order receipt email |
| email-queue | vendor-approve | vendors.service → adminAction | Notifies vendor of approval |
| email-queue | vendor-reject | vendors.service → adminAction | Notifies vendor of rejection |
| notification-queue | in-app-notification | orders.service, payments.service | Creates record in notifications table |

### 8.7 Retry Behaviour

```
Job fails (e.g. SMTP server is down):
  Attempt 1 fails → wait 5 seconds
  Attempt 2 fails → wait 10 seconds
  Attempt 3 fails → wait 20 seconds
  → Job moved to "failed" set in Redis
  → logger.error() records it
  → Job payload kept for 500 jobs (for manual inspection/replay)
```

### 8.8 AI Description Generation (Special Case)

```
Vendor clicks "Generate with AI"
        │
        ├──POST /ai/generate-description ──► AI controller
        │                                      │
        │                               bullmq.add('generate-description', {
        │                                 name, category, userId
        │                               })
        │◄── 202 Accepted immediately ──┘
        │                                      │
        │                               Worker picks up job
        │                               Calls Gemini API (can take 5-30 seconds)
        │                               On success:
        │                               emitToUser(userId, 'AI_DESCRIPTION_READY', {
        │                                 description: "..."
        │                               })
        │◄── Socket.io event ────────────────┘
        │
   Frontend listener receives event
   Sets textarea value to generated description
   Clears "Generating..." spinner
```

---

## 9. Socket.io Real-Time Events

### 9.1 Connection & Authentication

```
Client connects:
  socket.handshake.auth.token = accessToken
        │
        ▼
  Server middleware:
    verifyAccessToken(token)
    → attach userId, role to socket.data
    → socket.join(`user:${userId}`)   ← auto-join personal room
```

### 9.2 Event Reference

| Event | Direction | Triggered When |
|---|---|---|
| `order:created` | Server → Client | Order placed successfully |
| `payment:confirmed` | Server → Client | Payment confirmed |
| `order:status_changed` | Server → Client | Vendor updates order status |
| `AI_DESCRIPTION_READY` | Server → Client | Gemini finishes generating |
| `join:vendor_room` | Client → Server | Vendor joins their order room |

### 9.3 Redis Adapter for Scaling

```typescript
io.adapter(createAdapter(redisPublisher, redisSubscriber));
```

With this, if you run multiple backend instances (horizontal scaling):
- Instance A handles the HTTP request and updates the DB
- Instance A publishes event to Redis
- All instances (A, B, C) receive it from Redis
- The instance that has the target socket sends it to the client

Without Redis adapter, events only reach sockets connected to the same process.

---

## 10. Automating Order Status

Currently vendors update orders manually. Here are three approaches to automate it:

### Option 1 — BullMQ Delayed Jobs (Best for local testing)

When payment is confirmed, chain delayed jobs:
```
CONFIRMED  →  (2 min delay)  →  PROCESSING
           →  (5 min delay)  →  SHIPPED
           →  (10 min delay) →  DELIVERED
```
Add delayed jobs inside `confirmPayment()` using `{ delay: 2 * 60 * 1000 }`.

### Option 2 — BullMQ Repeatable Cron (Best for production ops)

Run a job every few minutes to advance stale orders:
```
Every 5 min: scan orders WHERE status='CONFIRMED' AND updatedAt < now-10min
             → advance to PROCESSING
Every 5 min: scan orders WHERE status='PROCESSING' AND updatedAt < now-30min
             → advance to SHIPPED
```
Uses BullMQ `repeat: { pattern: '*/5 * * * *' }`.

### Option 3 — Shipping Carrier Webhooks (Real production)

FedEx / UPS / DHL post tracking events to your server:
```
POST /webhooks/fedex
event: "DELIVERED"
trackingNumber: "1Z999AA1234567890"
  → Find order by trackingNumber
  → Update status to DELIVERED
  → Notify customer via Socket.io
```

---

## 11. Supabase Migration Guide

### 11.1 What Supabase Provides

| Feature | Local Docker | Supabase |
|---|---|---|
| PostgreSQL | Self-managed | Fully managed, auto-backups |
| Connection pooling | Manual (PgBouncer) | Built-in PgBouncer |
| Dashboard | pgAdmin / TablePlus | Built-in Table Editor |
| Auth | Your JWT system | Optional (keep yours) |
| Realtime | Your Socket.io | Optional (keep yours) |
| Storage | Cloudinary | Optional (keep Cloudinary) |

You are only replacing the **PostgreSQL database** — everything else stays the same.

### 11.2 Two Connection Strings in Supabase

Supabase gives you two URLs — use the right one for the right purpose:

| Connection | Port | Use For |
|---|---|---|
| Direct `db.[ref].supabase.co` | 5432 | IPv6 only — avoid unless on IPv6 network |
| Session Pooler `aws-0-[region].pooler.supabase.com` | 5432 | Prisma migrations, pgAdmin, scripts ✓ |
| Transaction Pooler `aws-0-[region].pooler.supabase.com` | 6543 | App runtime DATABASE_URL ✓ |

**Rule of thumb:**
- `DATABASE_URL` in backend `.env` (app runtime) → **Transaction Pooler (6543)**
- Running `prisma migrate deploy` → **Session Pooler (5432)**
- Restoring data with `psql` → **Session Pooler (5432)**

### 11.3 Step-by-Step Migration

**Step 1 — Dump your local database**

```bash
docker exec marketplace_postgres pg_dump \
  -U marketplace -d marketplace \
  --no-owner --no-privileges \
  > ~/marketplace_backup.sql
```

**Step 2 — Create Supabase project**

1. Go to supabase.com → New Project
2. Note your **database password**
3. Go to Settings → Database → copy the **Session Pooler** connection string

**Step 3 — Install psql on your machine**

```bash
sudo apt update && sudo apt install postgresql-client -y
psql --version   # verify
```

**Step 4 — Push Prisma schema to Supabase**

Update `backend/.env` temporarily with Session Pooler URL:
```env
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

Then run:
```bash
cd /home/mbilla/Desktop/full-stack/Enterprice-App/backend
npx prisma migrate deploy
# or if no migrations folder:
npx prisma db push
```

**Step 5 — Restore your data**

```bash
psql "postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" \
  < ~/marketplace_backup.sql
```

**Step 6 — Update runtime DATABASE_URL**

After migration, switch to the **Transaction Pooler (6543)** for the app:
```env
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

The `?pgbouncer=true` tells Prisma to disable prepared statements (required for PgBouncer transaction mode).

**Step 7 — Verify**

```bash
npx prisma studio    # opens browser UI showing your Supabase tables with data
```

**Step 8 — Restart backend**

```bash
npm run dev
```

### 11.4 Environment Variables After Migration

```env
# Runtime (Transaction Pooler)
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Migrations only (Session Pooler) — use this when running prisma migrate deploy
# DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 11.5 What Stays on Local Docker

After moving the DB to Supabase, Redis still runs locally in Docker:

```bash
# Start only Redis (DB is now in Supabase)
docker compose up redis -d
```

Update `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_secret
```

For production Redis, use **Upstash** (serverless Redis) or **Redis Cloud** — same approach as Supabase, just update `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`.

### 11.6 Supabase Gotchas

| Issue | Cause | Fix |
|---|---|---|
| `P1001: Can't reach database` | Using direct URL on IPv4 network | Use Session Pooler URL |
| `prepared statement already exists` | PgBouncer transaction mode | Add `?pgbouncer=true` to URL |
| `prisma migrate deploy` fails | Using transaction pooler (6543) for migration | Use session pooler (5432) for migrations |
| Schema changes not reflected | Forgot to run `prisma generate` | Run `npx prisma generate` after schema change |

---

*Document generated for Enterprise Marketplace — Backend v1.0*
