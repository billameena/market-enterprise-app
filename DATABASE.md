# Database Design — Enterprise Multi-Vendor E-Commerce Marketplace

## 1. ER Diagram (ASCII)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   User       │──1:N──│  UserSession     │       │  UserAddress │
│──────────────│       │──────────────────│       │──────────────│
│ id (PK)      │       │ id               │  1:N  │ id           │
│ email        │──────►│ userId (FK)      │◄──────│ userId (FK)  │
│ password     │       │ refreshTokenHash │       │ street       │
│ firstName    │       │ deviceInfo       │       │ city         │
│ lastName     │       │ ipAddress        │       │ country      │
│ role (enum)  │       │ expiresAt        │       │ isDefault    │
│ isVerified   │       └──────────────────┘       └──────────────┘
│ isLocked     │
│ createdAt    │       ┌──────────────────┐
└──────┬───────┘       │   Vendor         │
       │               │──────────────────│
       │ 1:1           │ id               │
       └──────────────►│ userId (FK)      │
                       │ businessName     │
                       │ status (enum)    │      ┌──────────────┐
                       │ commissionRate   │──1:N─│    Store     │
                       └──────────────────┘      │──────────────│
                                                 │ id           │
                                                 │ vendorId(FK) │
                                                 │ name         │
                                                 │ slug         │
                                                 └──────┬───────┘
                                                        │
                                                        │ 1:N
                                                        ▼
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│  Category    │       │   Product        │◄──────│  ProductTag  │──►Tag
│──────────────│       │──────────────────│       └──────────────┘
│ id (PK)      │──1:N─►│ categoryId (FK)  │
│ name         │       │ storeId (FK)     │──1:N──► ProductImage
│ slug         │       │ vendorId (FK)    │──1:N──► ProductVariant
│ parentId(FK) │       │ name             │──1:N──► ProductAttribute
│ isActive     │       │ slug             │──1:N──► ProductInventory
└──────────────┘       │ price            │
                       │ comparePrice     │
                       │ status (enum)    │
                       └──────┬───────────┘
                              │
                    ┌─────────┼────────────┐
                    ▼         ▼            ▼
             ┌──────────┐ ┌────────┐ ┌──────────┐
             │CartItem  │ │Review  │ │OrderItem │
             └──────────┘ └────────┘ └──────────┘

┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    Cart      │──1:N──│    CartItem      │       │  Order           │
│──────────────│       │──────────────────│       │──────────────────│
│ id           │       │ id               │       │ id               │
│ userId (FK)  │       │ cartId (FK)      │       │ userId (FK)      │
│ sessionId    │       │ productId (FK)   │       │ orderNumber      │
│ expiresAt    │       │ variantId (FK)   │       │ status (enum)    │
└──────────────┘       │ quantity         │       │ totalAmount      │
                       │ price            │       │ paymentStatus    │
                       └──────────────────┘       └──────┬───────────┘
                                                         │
                                          ┌──────────────┼──────────────┐
                                          ▼              ▼              ▼
                                    ┌──────────┐  ┌──────────┐  ┌────────────┐
                                    │OrderItem │  │ Payment  │  │StatusHistory│
                                    └──────────┘  └──────────┘  └────────────┘

┌──────────────┐       ┌──────────────────┐
│   Coupon     │──1:N──│  CouponUsage     │
│──────────────│       │──────────────────│
│ id           │       │ id               │
│ code (UQ)    │       │ couponId (FK)    │
│ type (enum)  │       │ userId (FK)      │
│ value        │       │ orderId (FK)     │
│ maxUses      │       │ usedAt           │
└──────────────┘       └──────────────────┘

┌──────────────┐       ┌──────────────────┐
│   Review     │──1:N──│  ReviewReply     │
│──────────────│       │──────────────────│
│ id           │       │ id               │
│ userId (FK)  │       │ reviewId (FK)    │
│ productId(FK)│       │ vendorId (FK)    │
│ rating       │       │ content          │
│ content      │       └──────────────────┘
│ isVerified   │
└──────────────┘

┌──────────────┐       ┌──────────────────┐
│  Wishlist    │──1:N──│  WishlistItem    │
│──────────────│       │──────────────────│
│ id           │       │ id               │
│ userId (FK)  │       │ wishlistId (FK)  │
│ name         │       │ productId (FK)   │
└──────────────┘       └──────────────────┘

┌──────────────────┐
│   Notification   │
│──────────────────│
│ id               │
│ userId (FK)      │
│ type (enum)      │
│ title            │
│ body             │
│ isRead           │
│ metadata (JSON)  │
└──────────────────┘

┌──────────────────┐
│   AuditLog       │
│──────────────────│
│ id               │
│ userId (FK)      │
│ action           │
│ resource         │
│ resourceId       │
│ oldValue (JSON)  │
│ newValue (JSON)  │
│ ipAddress        │
│ createdAt        │
└──────────────────┘
```

## 2. Table Descriptions

### Core User Tables

| Table | Purpose |
|-------|---------|
| User | Core authentication entity. Holds login credentials, profile, role, verification status. |
| UserSession | Refresh token store. Supports multi-device login, token rotation. |
| UserAddress | Saved delivery addresses. One default per user. |

### Vendor Tables

| Table | Purpose |
|-------|---------|
| Vendor | Vendor application & profile. Linked 1:1 to User. Tracks approval status and commission rate. |
| Store | A vendor's storefront. Vendors can have one primary store. Has slug for SEO-friendly URLs. |

### Product Tables

| Table | Purpose |
|-------|---------|
| Category | Hierarchical product categories (self-referencing parentId for tree structure). |
| Product | Core product entity. References store, vendor, category. Tracks status (DRAFT/ACTIVE/ARCHIVED). |
| ProductVariant | SKU-level variants (e.g. Red/XL). Each variant has its own price/inventory. |
| ProductAttribute | Attribute definitions per product (e.g. "Color", "Size"). |
| ProductAttributeValue | Values for each attribute (e.g. "Red", "Blue"). |
| ProductImage | Multiple images per product with ordering and alt text. |
| ProductInventory | Stock tracking per variant + location. Tracks reserved quantity for pending orders. |
| Tag | Flat tag taxonomy. |
| ProductTag | M:N join between Product and Tag. |

### Commerce Tables

| Table | Purpose |
|-------|---------|
| Cart | Shopping cart. Supports guest carts (no userId) via sessionId. Expires automatically. |
| CartItem | Individual product + variant in cart. Stores snapshot price at time of add. |
| Order | Customer purchase. Immutable once placed (append-only status changes). |
| OrderItem | Line items. Stores snapshot of product name/price at purchase time. |
| OrderStatusHistory | Append-only audit trail of order status transitions with timestamps. |
| ShippingAddress | Snapshot of delivery address at order creation (copied from UserAddress). |
| Payment | Payment record tied to Stripe PaymentIntent. |
| PaymentRefund | Refund records linked to payments. |
| Coupon | Discount codes. Supports PERCENTAGE, FIXED, FREE_SHIPPING types. |
| CouponUsage | Tracks per-user coupon usage to enforce per-user limits. |

### Content Tables

| Table | Purpose |
|-------|---------|
| Review | Customer product reviews with rating 1-5. |
| ReviewReply | Vendor replies to reviews. One reply per review per vendor. |
| Wishlist | Named wishlists (customers can have multiple). |
| WishlistItem | Products in a wishlist. |
| Notification | In-app notification inbox. JSON metadata for flexible payloads. |
| AuditLog | Security and compliance audit trail for all mutations. |
| CmsPage | Static content pages (About, Terms, Privacy). |
| Banner | Homepage/category promotional banners. |
| Blog | Blog posts with rich content. |
| Faq | FAQ entries with categories. |

## 3. Index Strategy

```sql
-- User indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_created_at ON "User"("createdAt");

-- UserSession indexes
CREATE INDEX idx_session_user_id ON "UserSession"("userId");
CREATE INDEX idx_session_expires_at ON "UserSession"("expiresAt");

-- Product indexes
CREATE INDEX idx_product_store ON "Product"("storeId");
CREATE INDEX idx_product_vendor ON "Product"("vendorId");
CREATE INDEX idx_product_category ON "Product"("categoryId");
CREATE INDEX idx_product_status ON "Product"(status);
CREATE INDEX idx_product_slug ON "Product"(slug);
CREATE INDEX idx_product_price ON "Product"(price);
CREATE INDEX idx_product_created ON "Product"("createdAt" DESC);

-- Full-text search on products
CREATE INDEX idx_product_fts ON "Product"
  USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));

-- ProductInventory indexes
CREATE UNIQUE INDEX idx_inventory_variant ON "ProductInventory"("variantId", location);
CREATE INDEX idx_inventory_sku ON "ProductInventory"(sku);

-- Order indexes
CREATE INDEX idx_order_user ON "Order"("userId");
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_order_created ON "Order"("createdAt" DESC);
CREATE UNIQUE INDEX idx_order_number ON "Order"("orderNumber");

-- Payment indexes
CREATE INDEX idx_payment_order ON "Payment"("orderId");
CREATE INDEX idx_payment_stripe ON "Payment"("stripePaymentIntentId");

-- Review indexes
CREATE INDEX idx_review_product ON "Review"("productId");
CREATE INDEX idx_review_user ON "Review"("userId");
CREATE UNIQUE INDEX idx_review_unique ON "Review"("userId", "productId");

-- AuditLog indexes
CREATE INDEX idx_audit_user ON "AuditLog"("userId");
CREATE INDEX idx_audit_resource ON "AuditLog"(resource, "resourceId");
CREATE INDEX idx_audit_created ON "AuditLog"("createdAt" DESC);

-- Notification indexes
CREATE INDEX idx_notif_user ON "Notification"("userId");
CREATE INDEX idx_notif_unread ON "Notification"("userId", "isRead") WHERE "isRead" = false;

-- Cart indexes
CREATE INDEX idx_cart_user ON "Cart"("userId");
CREATE INDEX idx_cart_session ON "Cart"("sessionId");
CREATE INDEX idx_cart_expires ON "Cart"("expiresAt");
```

## 4. Database Design Decisions

1. **Soft Deletes**: Products, Categories, and Users use `deletedAt` (nullable timestamp) for soft deletion to preserve referential integrity in orders.

2. **Price Snapshots**: OrderItem stores `unitPrice` and `productName` at the time of purchase so historical orders remain accurate if product prices change.

3. **Inventory Reservation**: `reservedQuantity` in ProductInventory prevents overselling during checkout. Reservation is created when order is placed, released when payment fails or order is cancelled.

4. **Hierarchical Categories**: Self-referencing `parentId` supports unlimited depth. Materialized path or nested sets can be added for performance with deep trees.

5. **UUID Primary Keys**: All tables use UUID primary keys (`cuid()` via Prisma) to prevent enumeration attacks and support distributed IDs.

6. **JSON Fields**: `metadata` fields use `Json` type for flexible, schema-less data (notification payloads, audit diffs, product specifications).

7. **Enum Types**: Role, status enums are defined in Prisma and mapped to PostgreSQL enum types for type safety and query optimization.
