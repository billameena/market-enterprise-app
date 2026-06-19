# Enterprise Multi-Vendor E-Commerce Marketplace — Architecture Document

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  React SPA   │  │ Mobile (PWA) │  │ Vendor Portal│  │  Admin Dashboard │   │
│  │  (Vite+TS)   │  │              │  │              │  │                  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼─────────────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                 │                   │
          ▼                 ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NGINX REVERSE PROXY / CDN                              │
│               SSL Termination · Rate Limiting · Static Assets                    │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          ▼                            ▼                            ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────────┐
│   REST API       │        │  WebSocket       │        │   Static Assets      │
│   Express/TS     │        │  Socket.IO        │        │   Cloudinary CDN     │
│   /api/v1/*      │        │  :3001           │        │                      │
└────────┬─────────┘        └────────┬─────────┘        └──────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │Auth Module │  │  Products  │  │  Orders    │  │ Payments   │  │Analytics │ │
│  │            │  │  Module    │  │  Module    │  │  Module    │  │ Module   │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Users     │  │  Vendors   │  │  Cart      │  │  Coupons   │  │Notifs    │ │
│  │  Module    │  │  Module    │  │  Module    │  │  Module    │  │ Module   │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │
          ┌────────────────────────┼───────────────────────────┐
          ▼                        ▼                           ▼
┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────────────┐
│   PostgreSQL     │    │   Redis Cluster       │    │   BullMQ Queues          │
│   (Primary DB)   │    │   Cache + Sessions    │    │   Email / Notifications  │
│   Prisma ORM     │    │   Pub/Sub             │    │   Order Processing       │
└──────────────────┘    └──────────────────────┘    └──────────────────────────┘
```

## 2. Component Interactions

### Request Flow

```
Client Request
     │
     ▼
Nginx (SSL termination, rate limit headers)
     │
     ▼
Express App
     │
     ├── Helmet (security headers)
     ├── CORS middleware
     ├── Rate Limiter (express-rate-limit + Redis store)
     ├── Body Parser / JSON
     ├── Request Logger (Winston)
     ├── Auth Middleware (JWT verify)
     ├── RBAC Middleware (role check)
     ├── Validation Middleware (Zod)
     ├── Audit Middleware (log mutations)
     │
     ▼
Route Handler → Controller → Service → Repository → Prisma → PostgreSQL
                                  │
                                  ├── Redis (cache read/write)
                                  ├── BullMQ (enqueue jobs)
                                  └── Socket.IO (emit events)
     │
     ▼
Standard API Response { success, data, message, meta }
```

### Module Dependencies

```
Auth ──────────────────────────────► Users
  │                                    │
  └──────► Sessions (Redis)            └──► Addresses
                                            │
Products ──► Categories                     └──► Wishlist
   │     ──► Tags
   │     ──► Inventory
   │     ──► Images (Cloudinary)
   │     ──► Variants
   │     ──► Attributes
   │
Cart ───────────────────────────────► Products
   │                                   │
   ▼                                   ▼
Orders ─────────────────────────────► Payments (Stripe)
   │                                   │
   ├──► OrderItems                     └──► PaymentRefunds
   ├──► OrderStatusHistory
   ├──► ShippingAddress
   └──► Notifications (email + push)

Vendors ──► Store ──► Products
        ──► Analytics
        ──► Payouts

Coupons ──► CouponUsage ──► Orders

Reviews ──► Products
        ──► ReviewReplies (Vendors)
```

## 3. Security Architecture

### Authentication Flow

```
Register:
  POST /auth/register
    → Validate input (Zod)
    → Check email uniqueness
    → Hash password (bcrypt, rounds=12)
    → Create User record
    → Generate email verification token (crypto.randomBytes)
    → Send verification email (BullMQ job)
    → Return 201 (no tokens yet — must verify email)

Login:
  POST /auth/login
    → Validate credentials
    → Check account lock (Redis key: lock:userId)
    → Verify password (bcrypt.compare)
    → On failure: increment attempts (Redis INCR, TTL 30min)
    →   5 failures → set lock key TTL 30min
    → On success: clear attempts
    → Create UserSession record (device, IP, userAgent)
    → Sign accessToken  (JWT, 15min, RS256)
    → Sign refreshToken (JWT, 7 days, RS256)
    → Store refreshToken hash in UserSession
    → Return both tokens

Token Refresh:
  POST /auth/refresh
    → Verify refreshToken signature
    → Load UserSession by tokenId (jti claim)
    → Compare stored hash
    → ROTATE: invalidate old session, create new session
    → Issue new accessToken + refreshToken pair

Logout:
  POST /auth/logout
    → Delete UserSession record (invalidate refresh token)
    → Return 204
```

### Authorization Layers

```
Layer 1: JWT Verification (all protected routes)
  - Verify signature
  - Check expiry
  - Load user from DB (with role)

Layer 2: RBAC (role-based)
  SUPER_ADMIN > ADMIN > VENDOR > CUSTOMER > SUPPORT

Layer 3: Resource Ownership
  - Vendors can only manage own products/orders
  - Customers can only see own orders/profile

Layer 4: Input Validation
  - Zod schemas on all mutation endpoints
  - SQL injection protected by Prisma parameterized queries
  - XSS prevented by response headers (helmet)
```

### Security Headers (Helmet)

```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
HSTS (production only)
```

## 4. Caching Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                     Redis Cache Layers                        │
│                                                              │
│  L1: Session Cache                                           │
│    Key: session:{userId}:{sessionId}                         │
│    TTL: 15 minutes (access token lifetime)                   │
│    Value: { userId, role, permissions }                      │
│                                                              │
│  L2: Entity Cache                                            │
│    Key: product:{id}           TTL: 30 min                   │
│    Key: category:tree          TTL: 60 min                   │
│    Key: vendor:{id}            TTL: 30 min                   │
│    Key: coupon:{code}          TTL: 10 min                   │
│                                                              │
│  L3: List/Search Cache                                       │
│    Key: products:list:{hash}   TTL: 5 min                    │
│    Key: search:{query}:{page}  TTL: 2 min                    │
│    Key: featured:products      TTL: 15 min                   │
│                                                              │
│  L4: Counter Cache                                           │
│    Key: cart:{userId}:count    TTL: Session                  │
│    Key: notif:{userId}:unread  TTL: 1 hour                   │
│                                                              │
│  L5: Rate Limit Store                                        │
│    Key: rl:{ip}:{route}        TTL: Window                   │
│    Key: lock:{userId}          TTL: 30 min                   │
│                                                              │
│  Cache Invalidation:                                         │
│    - On mutation: delete relevant keys                       │
│    - Pattern delete: SCAN + DEL for product:* on bulk update │
│    - Event-driven: BullMQ cache invalidation job             │
└──────────────────────────────────────────────────────────────┘
```

## 5. Real-Time Architecture

```
Client ──── WebSocket ────► Socket.IO Server
                               │
                    ┌──────────┼──────────────┐
                    ▼          ▼              ▼
              Auth Check   Namespace       Room Join
              (JWT on       /orders        user:{id}
               handshake)   /notifs        vendor:{id}
                            /admin         order:{id}

Events:
  Server → Client:
    notification:new      { notification }
    order:status_changed  { orderId, status }
    order:item_shipped    { orderId, trackingNumber }
    cart:updated          { count }
    product:back_in_stock { productId }
    payment:confirmed     { orderId }

  Client → Server:
    join:order_room       { orderId }
    leave:order_room      { orderId }
    mark:notification_read { notificationId }

Redis Pub/Sub for horizontal scaling:
  Channel: notifications:{userId}
  Channel: orders:{orderId}
  Channel: vendor:{vendorId}
  → Socket.IO Redis Adapter broadcasts to all server instances
```

## 6. Queue Architecture

```
BullMQ Queues (Redis-backed):

┌─────────────────────────────────────────────────────────────┐
│  Queue: email-queue                                          │
│    Jobs:                                                     │
│      - send-verification-email    (priority: HIGH)           │
│      - send-password-reset        (priority: HIGH)           │
│      - send-order-confirmation    (priority: NORMAL)         │
│      - send-order-shipped         (priority: NORMAL)         │
│      - send-vendor-approved       (priority: NORMAL)         │
│      - send-weekly-digest         (priority: LOW)            │
│    Workers: 3 concurrent                                     │
│    Retry: 3 attempts, exponential backoff                    │
│    Failure: DLQ email-queue:failed                           │
│                                                              │
│  Queue: notification-queue                                   │
│    Jobs:                                                     │
│      - push-notification          (priority: HIGH)           │
│      - in-app-notification        (priority: NORMAL)         │
│      - vendor-payout-notify       (priority: NORMAL)         │
│    Workers: 2 concurrent                                     │
│                                                              │
│  Queue: order-queue                                          │
│    Jobs:                                                     │
│      - process-payment            (priority: CRITICAL)       │
│      - update-inventory           (priority: HIGH)           │
│      - generate-invoice           (priority: NORMAL)         │
│      - vendor-commission          (priority: NORMAL)         │
│    Workers: 5 concurrent                                     │
│                                                              │
│  Queue: analytics-queue                                      │
│    Jobs:                                                     │
│      - record-product-view        (priority: LOW)            │
│      - aggregate-daily-stats      (priority: LOW, cron)      │
│    Workers: 2 concurrent                                     │
└─────────────────────────────────────────────────────────────┘
```

## 7. Data Flow Diagrams

### Order Creation Flow

```
Customer → POST /orders
  │
  ├── Validate cart (items in stock, prices current)
  ├── Apply coupon (validate, check usage limit)
  ├── Calculate totals (subtotal, discount, tax, shipping)
  ├── BEGIN TRANSACTION
  │     ├── Create Order record
  │     ├── Create OrderItems
  │     ├── Create ShippingAddress
  │     ├── Decrement inventory (ProductInventory)
  │     ├── Mark CouponUsage
  │     ├── Clear Cart
  │     └── COMMIT
  ├── Enqueue: process-payment job
  ├── Enqueue: send-order-confirmation email
  ├── Emit: order:created (socket)
  └── Return 201 { order }

Payment Processing (background job):
  ├── Stripe PaymentIntent creation
  ├── On success:
  │     ├── Update Order.paymentStatus = PAID
  │     ├── Create Payment record
  │     ├── Enqueue: vendor-commission job
  │     ├── Emit: payment:confirmed (socket)
  │     └── Enqueue: order-confirmation email
  └── On failure:
        ├── Update Order.status = PAYMENT_FAILED
        ├── Restore inventory
        └── Notify customer
```

## 8. API Versioning Strategy

All APIs are versioned under `/api/v1/`. Breaking changes increment the version.
Non-breaking additions are backwards compatible within same version.

## 9. Deployment Architecture

```
Production:
  ┌─────────────────────────────────────────────────────┐
  │  Kubernetes Cluster                                  │
  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
  │  │ API Pods │  │ Worker   │  │  Socket.IO Pods  │  │
  │  │ (3x)     │  │ Pods(2x) │  │  (2x)            │  │
  │  └──────────┘  └──────────┘  └──────────────────┘  │
  │  ┌──────────────────────────────────────────────┐   │
  │  │ PostgreSQL (RDS Multi-AZ)                    │   │
  │  │ Redis Cluster (ElastiCache)                  │   │
  │  │ S3 + CloudFront (static assets)              │   │
  │  └──────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────┘
```
