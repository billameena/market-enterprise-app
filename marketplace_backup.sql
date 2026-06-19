--
-- PostgreSQL database dump
--

\restrict NM9gUAviadodaCXiGSj9bHbtTMKXYaW8abKruXFtjfW1z7XWJodaj96U8OREWh7

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CouponType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CouponType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'FREE_SHIPPING'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER_PLACED',
    'ORDER_CONFIRMED',
    'ORDER_SHIPPED',
    'ORDER_DELIVERED',
    'ORDER_CANCELLED',
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED',
    'REVIEW_RECEIVED',
    'VENDOR_APPROVED',
    'VENDOR_REJECTED',
    'PRODUCT_APPROVED',
    'PRODUCT_REJECTED',
    'LOW_STOCK_ALERT',
    'COUPON_EXPIRING',
    'SYSTEM'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
    'PAYMENT_FAILED'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'STRIPE',
    'PAYPAL',
    'BANK_TRANSFER',
    'COD'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'ACTIVE',
    'REJECTED',
    'ARCHIVED'
);


--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PROCESSED',
    'REJECTED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'VENDOR',
    'CUSTOMER',
    'SUPPORT'
);


--
-- Name: VendorStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VendorStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    resource text NOT NULL,
    "resourceId" text,
    "oldValue" jsonb,
    "newValue" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id text NOT NULL,
    title text NOT NULL,
    "imageUrl" text NOT NULL,
    "mobileImageUrl" text,
    "linkUrl" text,
    "position" text NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startsAt" timestamp(3) without time zone,
    "endsAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: blogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blogs (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    "coverImageUrl" text,
    "authorId" text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id text NOT NULL,
    "userId" text,
    "sessionId" text,
    "couponId" text,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "imageUrl" text,
    "parentId" text,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cms_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cms_pages (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: coupon_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_usages (
    id text NOT NULL,
    "couponId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text NOT NULL,
    "usedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    "vendorId" text,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    type public."CouponType" NOT NULL,
    value numeric(10,2) NOT NULL,
    "minOrderAmount" numeric(10,2),
    "maxDiscountAmount" numeric(10,2),
    "maxUses" integer,
    "maxUsesPerUser" integer DEFAULT 1 NOT NULL,
    "currentUses" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startsAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "imageUrl" text,
    "actionUrl" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    "vendorId" text NOT NULL,
    "productName" text NOT NULL,
    "variantName" text,
    sku text NOT NULL,
    "imageUrl" text,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    "trackingNumber" text,
    "trackingUrl" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_history (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status public."OrderStatus" NOT NULL,
    comment text,
    "changedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderNumber" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "discountAmount" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "taxAmount" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "shippingAmount" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "couponId" text,
    notes text,
    "cancelReason" text,
    "cancelledAt" timestamp(3) without time zone,
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: payment_refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_refunds (
    id text NOT NULL,
    "paymentId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text,
    status public."RefundStatus" DEFAULT 'PENDING'::public."RefundStatus" NOT NULL,
    "stripeRefundId" text,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "orderId" text NOT NULL,
    method public."PaymentMethod" DEFAULT 'STRIPE'::public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "stripePaymentIntentId" text,
    "stripeChargeId" text,
    "stripeCustomerId" text,
    metadata jsonb,
    "failureReason" text,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: product_attribute_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_attribute_values (
    id text NOT NULL,
    "attributeId" text NOT NULL,
    "variantId" text NOT NULL,
    value text NOT NULL
);


--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_attributes (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    "altText" text,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    width integer,
    height integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_inventory (
    id text NOT NULL,
    "productId" text,
    "variantId" text,
    sku text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "reservedQuantity" integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer DEFAULT 5 NOT NULL,
    "trackInventory" boolean DEFAULT true NOT NULL,
    "allowBackorder" boolean DEFAULT false NOT NULL,
    location text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_tags (
    "productId" text NOT NULL,
    "tagId" text NOT NULL
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    price numeric(10,2) NOT NULL,
    "comparePrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    weight numeric(8,3),
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    "vendorId" text NOT NULL,
    "storeId" text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "shortDescription" text,
    sku text NOT NULL,
    price numeric(10,2) NOT NULL,
    "comparePrice" numeric(10,2),
    "costPrice" numeric(10,2),
    weight numeric(8,3),
    width numeric(8,2),
    height numeric(8,2),
    depth numeric(8,2),
    status public."ProductStatus" DEFAULT 'DRAFT'::public."ProductStatus" NOT NULL,
    "isDigital" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "requiresShipping" boolean DEFAULT true NOT NULL,
    "averageRating" numeric(3,2) DEFAULT 0.00 NOT NULL,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "totalSold" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "rejectionReason" text,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: review_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_replies (
    id text NOT NULL,
    "reviewId" text NOT NULL,
    "vendorId" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "orderId" text,
    rating integer NOT NULL,
    title text,
    content text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isApproved" boolean DEFAULT true NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "imageUrls" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: shipping_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_addresses (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    city text NOT NULL,
    state text NOT NULL,
    "postalCode" text NOT NULL,
    country text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stores (
    id text NOT NULL,
    "vendorId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "logoUrl" text,
    "bannerUrl" text,
    "contactEmail" text,
    "contactPhone" text,
    address text,
    "returnPolicy" text,
    "shippingPolicy" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    label text,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    city text NOT NULL,
    state text NOT NULL,
    "postalCode" text NOT NULL,
    country text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "refreshTokenHash" text NOT NULL,
    "deviceInfo" text,
    "ipAddress" text,
    "userAgent" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    "avatarUrl" text,
    role public."UserRole" DEFAULT 'CUSTOMER'::public."UserRole" NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "emailVerificationToken" text,
    "emailVerificationExpiry" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL,
    "lockUntil" timestamp(3) without time zone,
    "failedLoginAttempts" integer DEFAULT 0 NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "lastLoginIp" text,
    "passwordResetToken" text,
    "passwordResetExpiry" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id text NOT NULL,
    "userId" text NOT NULL,
    "businessName" text NOT NULL,
    "businessEmail" text NOT NULL,
    "businessPhone" text,
    description text,
    "logoUrl" text,
    "bannerUrl" text,
    website text,
    "taxId" text,
    status public."VendorStatus" DEFAULT 'PENDING'::public."VendorStatus" NOT NULL,
    "commissionRate" numeric(5,2) DEFAULT 10.00 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "totalRevenue" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    rating numeric(3,2) DEFAULT 0.00 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    "wishlistId" text NOT NULL,
    "productId" text NOT NULL,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlists (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text DEFAULT 'My Wishlist'::text NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "shareToken" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
de569aa0-d5d0-4fb6-b147-e16ee92cd15a	987057a746cae7396247369f5f91b9e18580883ec659818faadb0dddb056ca66	2026-06-10 11:10:48.820476+00	20260610111048_init	\N	\N	2026-06-10 11:10:48.112888+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", action, resource, "resourceId", "oldValue", "newValue", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banners (id, title, "imageUrl", "mobileImageUrl", "linkUrl", "position", "displayOrder", "isActive", "startsAt", "endsAt", "createdAt", "updatedAt") FROM stdin;
cmq7zokgd005ugs3ns00sesfd	Summer Tech Sale	https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920	\N	/products?categoryId=electronics&sort=discount	hero	1	t	\N	2026-07-10 11:32:26.892	2026-06-10 11:32:26.894	2026-06-10 11:32:26.894
cmq7zokgd005vgs3ngxgsc73i	New Fashion Arrivals	https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920	\N	/products?categoryId=fashion&sort=newest	hero	2	t	\N	\N	2026-06-10 11:32:26.894	2026-06-10 11:32:26.894
cmq7zokgd005wgs3nogex3sul	Shop Electronics	https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800	\N	/products?categoryId=electronics	category	1	t	\N	\N	2026-06-10 11:32:26.894	2026-06-10 11:32:26.894
\.


--
-- Data for Name: blogs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blogs (id, title, slug, excerpt, content, "coverImageUrl", "authorId", "isPublished", "metaTitle", "metaDescription", "publishedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, "cartId", "productId", "variantId", quantity, price, "createdAt", "updatedAt") FROM stdin;
cmq97dj2z0001k67sery6drkr	cmq802idn0001kpzv03o88kvl	cmq97bmzy001t9937vbe5iarj	\N	2	1799.00	2026-06-11 07:55:35.003	2026-06-12 06:10:30.557
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, "userId", "sessionId", "couponId", "expiresAt", "createdAt", "updatedAt") FROM stdin;
cmq801zk60000kpzvuy0e2gbh	\N	test-session-123	\N	2026-06-17 11:42:52.997	2026-06-10 11:42:52.999	2026-06-10 11:42:52.999
cmq802idn0001kpzv03o88kvl	\N	74dc1720-6796-43ac-a8cc-19dbe039a57d	\N	2026-06-17 11:43:17.384	2026-06-10 11:43:17.386	2026-06-10 11:43:17.386
cmq806flp0007kpzvv5glyadg	cmq7zoje70004gs3naiwg6fcv	\N	\N	\N	2026-06-10 11:46:20.413	2026-06-11 08:25:13.576
cmqhtzh5a000012t01cuajbw3	\N	c0e62987-8e58-4720-b25b-c770011305fa	\N	2026-06-24 08:50:39.884	2026-06-17 08:50:39.887	2026-06-17 08:50:39.887
cmqhuegd2000612t0zcrxebj1	cmq7zoigp0002gs3nrhpl06dm	\N	\N	\N	2026-06-17 09:02:18.71	2026-06-18 06:39:25.364
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, description, "imageUrl", "parentId", "displayOrder", "isActive", "metaTitle", "metaDescription", "createdAt", "updatedAt") FROM stdin;
cmq7zojww000egs3nwjayr834	Electronics	electronics	Gadgets, devices, and all things electronic.	https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400	\N	1	t	\N	\N	2026-06-10 11:32:26.192	2026-06-10 11:32:26.192
cmq7zojx7000fgs3negwlb1wk	Fashion	fashion	Clothing, footwear, and accessories.	https://images.unsplash.com/photo-1445205170230-053b83016050?w=400	\N	2	t	\N	\N	2026-06-10 11:32:26.203	2026-06-10 11:32:26.203
cmq7zojxe000ggs3nazu01b5m	Home & Living	home-living	Furniture, decor, and essentials for your home.	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400	\N	3	t	\N	\N	2026-06-10 11:32:26.21	2026-06-10 11:32:26.21
cmq7zojxm000hgs3nxi62zhes	Sports & Outdoors	sports-outdoors	Gear and equipment for active lifestyles.	https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400	\N	4	t	\N	\N	2026-06-10 11:32:26.218	2026-06-10 11:32:26.218
cmq7zojxs000jgs3nagks6u7d	Smartphones	smartphones	Latest smartphones from top brands.	\N	cmq7zojww000egs3nwjayr834	1	t	\N	\N	2026-06-10 11:32:26.224	2026-06-10 11:32:26.224
cmq7zojy0000lgs3n0mhj15gi	Laptops	laptops	Powerful laptops for work and play.	\N	cmq7zojww000egs3nwjayr834	2	t	\N	\N	2026-06-10 11:32:26.232	2026-06-10 11:32:26.232
cmq7zojy7000ngs3n60ptkapj	Audio	audio	Headphones, speakers and audio accessories.	\N	cmq7zojww000egs3nwjayr834	3	t	\N	\N	2026-06-10 11:32:26.24	2026-06-10 11:32:26.24
cmq7zojyf000pgs3na4c8rhn8	Men's Clothing	mens-clothing	Fashion for men.	\N	cmq7zojx7000fgs3negwlb1wk	1	t	\N	\N	2026-06-10 11:32:26.247	2026-06-10 11:32:26.247
cmq7zojyn000rgs3nkscht6ca	Women's Clothing	womens-clothing	Fashion for women.	\N	cmq7zojx7000fgs3negwlb1wk	2	t	\N	\N	2026-06-10 11:32:26.255	2026-06-10 11:32:26.255
cmq97bmtf00019937j2dn7lsn	Furniture	furniture	\N	\N	cmq7zojxe000ggs3nazu01b5m	1	t	\N	\N	2026-06-11 07:54:06.531	2026-06-11 07:54:06.531
cmq97bmtx00039937ng7rra5h	Kitchen & Appliances	kitchen-appliances	\N	\N	cmq7zojxe000ggs3nazu01b5m	2	t	\N	\N	2026-06-11 07:54:06.549	2026-06-11 07:54:06.549
cmq97bmu4000599370jie8me2	Home Decor	home-decor	\N	\N	cmq7zojxe000ggs3nazu01b5m	3	t	\N	\N	2026-06-11 07:54:06.556	2026-06-11 07:54:06.556
cmq97bmub00079937imj84402	Fitness Equipment	fitness-equipment	\N	\N	cmq7zojxm000hgs3nxi62zhes	1	t	\N	\N	2026-06-11 07:54:06.563	2026-06-11 07:54:06.563
cmq97bmuh00099937wxpv2krg	Outdoor Gear	outdoor-gear	\N	\N	cmq7zojxm000hgs3nxi62zhes	2	t	\N	\N	2026-06-11 07:54:06.569	2026-06-11 07:54:06.569
cmq97bmum000b9937kx7iusfp	Sportswear	sportswear	\N	\N	cmq7zojxm000hgs3nxi62zhes	3	t	\N	\N	2026-06-11 07:54:06.574	2026-06-11 07:54:06.574
cmq97bmus000d9937k64p07pj	Tablets	tablets	\N	\N	cmq7zojww000egs3nwjayr834	4	t	\N	\N	2026-06-11 07:54:06.58	2026-06-11 07:54:06.58
cmq97bmux000f9937qknd2de7	Accessories	accessories	\N	\N	cmq7zojx7000fgs3negwlb1wk	3	t	\N	\N	2026-06-11 07:54:06.585	2026-06-11 07:54:06.585
\.


--
-- Data for Name: cms_pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cms_pages (id, title, slug, content, "isPublished", "metaTitle", "metaDescription", "publishedAt", "createdAt", "updatedAt") FROM stdin;
cmq7zokgp0062gs3nxu9exc7b	About Us	about-us	<h1>About Marketplace</h1><p>We are a premier multi-vendor marketplace connecting buyers with trusted sellers worldwide.</p>	t	\N	\N	2026-06-10 11:32:26.905	2026-06-10 11:32:26.906	2026-06-10 11:32:26.906
cmq7zokgp0063gs3nu7pmmq8w	Privacy Policy	privacy-policy	<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your data.</p>	t	\N	\N	2026-06-10 11:32:26.905	2026-06-10 11:32:26.906	2026-06-10 11:32:26.906
cmq7zokgq0064gs3n290nxnyv	Terms of Service	terms-of-service	<h1>Terms of Service</h1><p>By using our marketplace, you agree to these terms and conditions.</p>	t	\N	\N	2026-06-10 11:32:26.905	2026-06-10 11:32:26.906	2026-06-10 11:32:26.906
\.


--
-- Data for Name: coupon_usages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupon_usages (id, "couponId", "userId", "orderId", "usedAt") FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupons (id, "vendorId", code, name, description, type, value, "minOrderAmount", "maxDiscountAmount", "maxUses", "maxUsesPerUser", "currentUses", "isActive", "startsAt", "expiresAt", "createdAt", "updatedAt") FROM stdin;
cmq7zokg6005pgs3nm8w9r5qt	\N	WELCOME10	Welcome Discount	10% off your first order	PERCENTAGE	10.00	50.00	50.00	1000	1	0	t	\N	2026-09-08 11:32:26.884	2026-06-10 11:32:26.886	2026-06-10 11:32:26.886
cmq7zokg6005qgs3ntwb3wqy0	\N	SAVE20	Save $20	$20 off on orders over $100	FIXED_AMOUNT	20.00	100.00	\N	500	1	0	t	\N	2026-08-09 11:32:26.884	2026-06-10 11:32:26.886	2026-06-10 11:32:26.886
cmq7zokg6005rgs3nt0in3888	\N	FREESHIP	Free Shipping	Free shipping on any order	FREE_SHIPPING	0.00	\N	\N	2000	3	0	t	\N	2026-07-10 11:32:26.884	2026-06-10 11:32:26.886	2026-06-10 11:32:26.886
cmq7zokg6005sgs3nk5snu5jo	\N	TECH15	Tech Sale 15%	15% off electronics — limited time	PERCENTAGE	15.00	200.00	150.00	300	1	0	t	2026-06-10 11:32:26.884	2026-06-24 11:32:26.884	2026-06-10 11:32:26.886	2026-06-10 11:32:26.886
cmq7zokg6005tgs3n1bq7o68q	\N	SUMMER25	Summer Fashion Sale	25% off all fashion items	PERCENTAGE	25.00	75.00	100.00	400	2	0	t	\N	2026-07-25 11:32:26.884	2026-06-10 11:32:26.886	2026-06-10 11:32:26.886
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faqs (id, question, answer, category, "displayOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
cmq7zokgl005xgs3naeef599v	How do I track my order?	Once your order is shipped, you will receive an email with a tracking number. You can also track your order from the Orders section in your account dashboard.	Orders	1	t	2026-06-10 11:32:26.901	2026-06-10 11:32:26.901
cmq7zokgl005ygs3n778ga8it	What is the return policy?	We accept returns within 30 days of delivery for most items in original condition. Some items like digital goods are non-refundable. Please check the vendor's store policy for specific items.	Returns	2	t	2026-06-10 11:32:26.901	2026-06-10 11:32:26.901
cmq7zokgl005zgs3nx3nkpggn	How do I become a vendor?	Click on "Sell on Marketplace" in the footer and complete the vendor registration form. Your application will be reviewed within 2-3 business days.	Vendors	3	t	2026-06-10 11:32:26.901	2026-06-10 11:32:26.901
cmq7zokgl0060gs3ng2zsfvsd	What payment methods are accepted?	We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and Cash on Delivery in select regions.	Payments	4	t	2026-06-10 11:32:26.901	2026-06-10 11:32:26.901
cmq7zokgl0061gs3nelof02ei	Is my payment information secure?	Yes, all payments are processed through Stripe with industry-standard SSL encryption. We never store your full card details.	Payments	5	t	2026-06-10 11:32:26.901	2026-06-10 11:32:26.901
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", type, title, body, "imageUrl", "actionUrl", "isRead", "readAt", metadata, "createdAt") FROM stdin;
cmq97umkb000n6vkiqjeh84jd	cmq7zoje70004gs3naiwg6fcv	ORDER_PLACED	Order Placed	Your order ORD-MQ97UMI1-54C15F has been placed successfully	\N	\N	f	\N	{"orderId": "cmq97umi8000e6vkic907cc3b"}	2026-06-11 08:08:52.668
cmq97v0m2000q6vkilhq8tech	cmq7zoje70004gs3naiwg6fcv	PAYMENT_SUCCESS	Payment Confirmed	Payment for order #ORD-MQ97UMI1-54C15F confirmed	\N	\N	f	\N	{"orderId": "cmq97umi8000e6vkic907cc3b"}	2026-06-11 08:09:10.874
cmq983klh00166vkihip91jap	cmq7zoje70004gs3naiwg6fcv	ORDER_PLACED	Order Placed	Your order ORD-MQ983KJU-1E94E1 has been placed successfully	\N	\N	f	\N	{"orderId": "cmq983kjy000z6vki4c5tx4cb"}	2026-06-11 08:15:50.021
cmq98b623000d82abp4v5ccrs	cmq7zoje70004gs3naiwg6fcv	ORDER_PLACED	Order Placed	Your order ORD-MQ98B604-D341FE has been placed successfully	\N	\N	f	\N	{"orderId": "cmq98b608000682abzapwuqsl"}	2026-06-11 08:21:44.427
cmq98b63o000e82abcwx48gwz	cmq7zoje70004gs3naiwg6fcv	PAYMENT_SUCCESS	Payment Confirmed	Payment for order #ORD-MQ98B604-D341FE confirmed	\N	\N	f	\N	{"orderId": "cmq98b608000682abzapwuqsl"}	2026-06-11 08:21:44.484
cmq98fnhd000q82abtukov40m	cmq7zoje70004gs3naiwg6fcv	ORDER_PLACED	Order Placed	Your order ORD-MQ98FNEV-9DF2DE has been placed successfully	\N	\N	f	\N	{"orderId": "cmq98fney000j82abwpfn84cz"}	2026-06-11 08:25:13.634
cmq98g9oi000r82abuwqvf9bb	cmq7zoje70004gs3naiwg6fcv	PAYMENT_SUCCESS	Payment Confirmed	Payment for order #ORD-MQ98FNEV-9DF2DE confirmed	\N	\N	f	\N	{"orderId": "cmq98fney000j82abwpfn84cz"}	2026-06-11 08:25:42.403
cmqi09w1j000pjsryle8xza7z	cmq7zoigp0002gs3nrhpl06dm	ORDER_PLACED	Order Placed	Your order ORD-MQI09VZV-C7E884 has been placed successfully	\N	\N	f	\N	{"orderId": "cmqi09vzz000ijsrym63arc9s"}	2026-06-17 11:46:43.447
cmqi0a5a1000qjsrybsburqsc	cmq7zoigp0002gs3nrhpl06dm	PAYMENT_SUCCESS	Payment Confirmed	Payment for order #ORD-MQI09VZV-C7E884 confirmed	\N	\N	f	\N	{"orderId": "cmqi09vzz000ijsrym63arc9s"}	2026-06-17 11:46:55.418
cmqj4jq4p000di532f2mqgtfl	cmq7zoigp0002gs3nrhpl06dm	ORDER_PLACED	Order Placed	Your order ORD-MQJ4JQ1O-80190D has been placed successfully	\N	\N	f	\N	{"orderId": "cmqj4jq1t0006i532zt1b7iev"}	2026-06-18 06:34:06.985
cmqj4juri000ei532spahz7ml	cmq7zoigp0002gs3nrhpl06dm	PAYMENT_SUCCESS	Payment Confirmed	Payment for order #ORD-MQJ4JQ1O-80190D confirmed	\N	\N	f	\N	{"orderId": "cmqj4jq1t0006i532zt1b7iev"}	2026-06-18 06:34:12.991
cmqj4qjt8000qi5326nhx8f82	cmq7zoigp0002gs3nrhpl06dm	ORDER_PLACED	Order Placed	Your order ORD-MQJ4QJRO-CEA9D5 has been placed successfully	\N	\N	f	\N	{"orderId": "cmqj4qjrr000ji53230iytlmf"}	2026-06-18 06:39:25.389
cmqj4qlsp000ri532gau0r4n5	cmq7zoigp0002gs3nrhpl06dm	PAYMENT_SUCCESS	Payment Confirmed	Payment for order #ORD-MQJ4QJRO-CEA9D5 confirmed	\N	\N	f	\N	{"orderId": "cmqj4qjrr000ji53230iytlmf"}	2026-06-18 06:39:27.961
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, "orderId", "productId", "variantId", "vendorId", "productName", "variantName", sku, "imageUrl", quantity, "unitPrice", "totalPrice", "trackingNumber", "trackingUrl", status, "createdAt", "updatedAt") FROM stdin;
cmq97umi8000h6vkinvot0cl5	cmq97umi8000e6vkic907cc3b	cmq7zokdr0050gs3niugpete2	\N	cmq7zojvw0007gs3nyfw7djh7	Dell XPS 15 (9530)	\N	DELL-XPS15-9530	https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800	1	1849.00	1849.00	\N	\N	PENDING	2026-06-11 08:08:52.592	2026-06-11 08:08:52.592
cmq97umi9000i6vkiibkjg9m2	cmq97umi8000e6vkic907cc3b	cmq97bnyr00ck99378qjonzwt	\N	cmq7zojw70009gs3nozhpetpo	Classic Analog Watch — Minimalist Design	\N	FASH-WATCH-ALOG	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800	1	119.00	119.00	\N	\N	PENDING	2026-06-11 08:08:52.592	2026-06-11 08:08:52.592
cmq97umi9000j6vkihpcxplxk	cmq97umi8000e6vkic907cc3b	cmq97bnyr00ck99378qjonzwt	\N	cmq7zojw70009gs3nozhpetpo	Classic Analog Watch — Minimalist Design	\N	FASH-WATCH-ALOG	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800	1	119.00	119.00	\N	\N	PENDING	2026-06-11 08:08:52.592	2026-06-11 08:08:52.592
cmq983kjy00126vkizzfg4nav	cmq983kjy000z6vki4c5tx4cb	cmq97bnyr00ck99378qjonzwt	\N	cmq7zojw70009gs3nozhpetpo	Classic Analog Watch — Minimalist Design	\N	FASH-WATCH-ALOG	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800	1	119.00	119.00	\N	\N	PENDING	2026-06-11 08:15:49.966	2026-06-11 08:15:49.966
cmq98b608000982abgl4jgy53	cmq98b608000682abzapwuqsl	cmq97bnyr00ck99378qjonzwt	\N	cmq7zojw70009gs3nozhpetpo	Classic Analog Watch — Minimalist Design	\N	FASH-WATCH-ALOG	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800	1	119.00	119.00	\N	\N	PENDING	2026-06-11 08:21:44.36	2026-06-11 08:21:44.36
cmq98fney000m82abjiefuzfj	cmq98fney000j82abwpfn84cz	cmq97bnyr00ck99378qjonzwt	\N	cmq7zojw70009gs3nozhpetpo	Classic Analog Watch — Minimalist Design	\N	FASH-WATCH-ALOG	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800	1	119.00	119.00	\N	\N	PENDING	2026-06-11 08:25:13.546	2026-06-11 08:25:13.546
cmqi09w00000ljsry8hecl9wu	cmqi09vzz000ijsrym63arc9s	cmq97bnsc00aj9937erw15una	\N	cmq7zojw70009gs3nozhpetpo	Women's Oversized Knit Sweater	\N	FASH-WMNS-SWTR	https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800	2	69.99	139.98	\N	\N	PENDING	2026-06-17 11:46:43.391	2026-06-17 11:46:43.391
cmqj4jq1u0009i5320hrj7ahe	cmqj4jq1t0006i532zt1b7iev	cmq97bn8s004j99376unuwn4o	\N	cmq7zojvw0007gs3nyfw7djh7	Osprey Atmos AG 65 Backpack	\N	OSPR-ATMOS-65	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800	2	289.95	579.90	\N	\N	PENDING	2026-06-18 06:34:06.882	2026-06-18 06:34:06.882
cmqj4qjrr000mi532d7j2q78n	cmqj4qjrr000ji53230iytlmf	cmq97bnyr00ck99378qjonzwt	\N	cmq7zojw70009gs3nozhpetpo	Classic Analog Watch — Minimalist Design	\N	FASH-WATCH-ALOG	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800	1	119.00	119.00	\N	\N	PENDING	2026-06-18 06:39:25.335	2026-06-18 06:39:25.335
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_status_history (id, "orderId", status, comment, "changedBy", "createdAt") FROM stdin;
cmq97umi9000k6vkixv1nywh0	cmq97umi8000e6vkic907cc3b	PENDING	\N	cmq7zoje70004gs3naiwg6fcv	2026-06-11 08:08:52.592
cmq983kjy00136vkidfwm1vy4	cmq983kjy000z6vki4c5tx4cb	PENDING	\N	cmq7zoje70004gs3naiwg6fcv	2026-06-11 08:15:49.966
cmq98b608000a82abmeha3gss	cmq98b608000682abzapwuqsl	PENDING	\N	cmq7zoje70004gs3naiwg6fcv	2026-06-11 08:21:44.36
cmq98fney000n82ab439godqv	cmq98fney000j82abwpfn84cz	PENDING	\N	cmq7zoje70004gs3naiwg6fcv	2026-06-11 08:25:13.546
cmqi09w00000mjsryrfj2m8lf	cmqi09vzz000ijsrym63arc9s	PENDING	\N	cmq7zoigp0002gs3nrhpl06dm	2026-06-17 11:46:43.391
cmqj4jq1u000ai532idmg0d2a	cmqj4jq1t0006i532zt1b7iev	PENDING	\N	cmq7zoigp0002gs3nrhpl06dm	2026-06-18 06:34:06.882
cmqj4qjrr000ni5322d4ezb4d	cmqj4qjrr000ji53230iytlmf	PENDING	\N	cmq7zoigp0002gs3nrhpl06dm	2026-06-18 06:39:25.335
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, "userId", "orderNumber", status, "paymentStatus", subtotal, "discountAmount", "taxAmount", "shippingAmount", "totalAmount", currency, "couponId", notes, "cancelReason", "cancelledAt", "shippedAt", "deliveredAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
cmq97umi8000e6vkic907cc3b	cmq7zoje70004gs3naiwg6fcv	ORD-MQ97UMI1-54C15F	CONFIRMED	PAID	2087.00	0.00	166.96	0.00	2253.96	USD	\N	\N	\N	\N	\N	\N	\N	2026-06-11 08:08:52.592	2026-06-11 08:09:10.863
cmq983kjy000z6vki4c5tx4cb	cmq7zoje70004gs3naiwg6fcv	ORD-MQ983KJU-1E94E1	PENDING	PENDING	119.00	0.00	9.52	0.00	128.52	USD	\N	\N	\N	\N	\N	\N	\N	2026-06-11 08:15:49.966	2026-06-11 08:15:49.966
cmq98b608000682abzapwuqsl	cmq7zoje70004gs3naiwg6fcv	ORD-MQ98B604-D341FE	CONFIRMED	PAID	119.00	0.00	9.52	0.00	128.52	USD	\N	\N	\N	\N	\N	\N	\N	2026-06-11 08:21:44.36	2026-06-11 08:21:44.47
cmq98fney000j82abwpfn84cz	cmq7zoje70004gs3naiwg6fcv	ORD-MQ98FNEV-9DF2DE	CONFIRMED	PAID	119.00	0.00	9.52	0.00	128.52	USD	\N	\N	\N	\N	\N	\N	\N	2026-06-11 08:25:13.546	2026-06-11 08:25:42.388
cmqi09vzz000ijsrym63arc9s	cmq7zoigp0002gs3nrhpl06dm	ORD-MQI09VZV-C7E884	CONFIRMED	PAID	139.98	0.00	11.20	0.00	151.18	USD	\N	\N	\N	\N	\N	\N	\N	2026-06-17 11:46:43.391	2026-06-17 11:46:55.403
cmqj4jq1t0006i532zt1b7iev	cmq7zoigp0002gs3nrhpl06dm	ORD-MQJ4JQ1O-80190D	CONFIRMED	PAID	579.90	0.00	46.39	0.00	626.29	USD	\N	\N	\N	\N	\N	\N	\N	2026-06-18 06:34:06.882	2026-06-18 06:34:12.978
cmqj4qjrr000ji53230iytlmf	cmq7zoigp0002gs3nrhpl06dm	ORD-MQJ4QJRO-CEA9D5	CONFIRMED	PAID	119.00	0.00	9.52	0.00	128.52	USD	\N	\N	\N	\N	\N	\N	\N	2026-06-18 06:39:25.335	2026-06-18 06:39:27.949
\.


--
-- Data for Name: payment_refunds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_refunds (id, "paymentId", amount, reason, status, "stripeRefundId", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, "orderId", method, status, amount, currency, "stripePaymentIntentId", "stripeChargeId", "stripeCustomerId", metadata, "failureReason", "paidAt", "createdAt", "updatedAt") FROM stdin;
cmq97umjd000m6vki6k07nssr	cmq97umi8000e6vkic907cc3b	STRIPE	PAID	2253.96	USD	pi_mock_cmq97umi8000e6vkic907cc3b	\N	\N	\N	\N	2026-06-11 08:09:10.856	2026-06-11 08:08:52.633	2026-06-11 08:09:10.857
cmq983kkz00156vkixc0cqu32	cmq983kjy000z6vki4c5tx4cb	STRIPE	PENDING	128.52	USD	pi_mock_cmq983kjy000z6vki4c5tx4cb	\N	\N	\N	\N	\N	2026-06-11 08:15:50.003	2026-06-11 08:15:50.003
cmq98b619000c82abmxs8by9s	cmq98b608000682abzapwuqsl	STRIPE	PAID	128.52	USD	mock_cmq98b608000682abzapwuqsl	\N	\N	\N	\N	2026-06-11 08:21:44.464	2026-06-11 08:21:44.398	2026-06-11 08:21:44.465
cmq98fngu000p82ablmslo6ey	cmq98fney000j82abwpfn84cz	STRIPE	PAID	128.52	USD	mock_cmq98fney000j82abwpfn84cz	\N	\N	\N	\N	2026-06-11 08:25:42.377	2026-06-11 08:25:13.614	2026-06-11 08:25:42.378
cmqi09w10000ojsryydm4scxb	cmqi09vzz000ijsrym63arc9s	STRIPE	PAID	151.18	USD	mock_cmqi09vzz000ijsrym63arc9s	\N	\N	\N	\N	2026-06-17 11:46:55.391	2026-06-17 11:46:43.429	2026-06-17 11:46:55.393
cmqj4jq3r000ci532achflckp	cmqj4jq1t0006i532zt1b7iev	STRIPE	PAID	626.29	USD	mock_cmqj4jq1t0006i532zt1b7iev	\N	\N	\N	\N	2026-06-18 06:34:12.967	2026-06-18 06:34:06.952	2026-06-18 06:34:12.969
cmqj4qjst000pi532947y3r9i	cmqj4qjrr000ji53230iytlmf	STRIPE	PAID	128.52	USD	mock_cmqj4qjrr000ji53230iytlmf	\N	\N	\N	\N	2026-06-18 06:39:27.938	2026-06-18 06:39:25.373	2026-06-18 06:39:27.94
\.


--
-- Data for Name: product_attribute_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_attribute_values (id, "attributeId", "variantId", value) FROM stdin;
cmq7zok0u0016gs3n1qj63jbw	cmq7zok090011gs3n8ukotrze	cmq7zok0j0015gs3nq0efzd4x	Natural Titanium
cmq7zok0u0017gs3noa1z4vuy	cmq7zok0f0013gs3nmjp8pakw	cmq7zok0j0015gs3nq0efzd4x	256GB
cmq7zok18001ags3ng0144blt	cmq7zok090011gs3n8ukotrze	cmq7zok110019gs3nsio0o370	Black Titanium
cmq7zok18001bgs3nyh9384tu	cmq7zok0f0013gs3nmjp8pakw	cmq7zok110019gs3nsio0o370	256GB
cmq7zok2k001mgs3n35xlgiyh	cmq7zok29001jgs3noqem40yq	cmq7zok2d001lgs3nouexetbv	16GB
cmq7zok2y001pgs3nehakhb6i	cmq7zok29001jgs3noqem40yq	cmq7zok2r001ogs3nqx7iha3b	32GB
cmq7zok46001zgs3nocetgvao	cmq7zok3u001wgs3ne80hau3c	cmq7zok3y001ygs3no9zb9b5f	Black
cmq7zok4i0022gs3nzml9fy2n	cmq7zok3u001wgs3ne80hau3c	cmq7zok4b0021gs3nca4r43br	Platinum Silver
cmq7zok5l002cgs3n97oemrik	cmq7zok5b0029gs3naky65vtr	cmq7zok5f002bgs3nwqognpvz	Titanium Gray
cmq7zok6o002pgs3nrrpk2lpo	cmq7zok6b002kgs3ns6fj99gd	cmq7zok6h002ogs3nmf9g4jpc	S
cmq7zok6o002qgs3ndjrscion	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok6h002ogs3nmf9g4jpc	White
cmq7zok6y002tgs3n1nksu7f6	cmq7zok6b002kgs3ns6fj99gd	cmq7zok6t002sgs3nmuhy4aai	M
cmq7zok6y002ugs3nuffpxg9p	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok6t002sgs3nmuhy4aai	White
cmq7zok7a002xgs3nmi4ifmfq	cmq7zok6b002kgs3ns6fj99gd	cmq7zok73002wgs3n6m4mej5k	L
cmq7zok7a002ygs3n7fhzt3md	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok73002wgs3n6m4mej5k	White
cmq7zok7k0031gs3nf3z12c3j	cmq7zok6b002kgs3ns6fj99gd	cmq7zok7f0030gs3ny50pi9xd	XL
cmq7zok7k0032gs3n5ar1lrd4	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok7f0030gs3ny50pi9xd	White
cmq7zok7v0035gs3n1mssy64c	cmq7zok6b002kgs3ns6fj99gd	cmq7zok7q0034gs3n2tg138ty	XXL
cmq7zok7w0036gs3nrobupsbb	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok7q0034gs3n2tg138ty	White
cmq7zok880039gs3n7qtwbd09	cmq7zok6b002kgs3ns6fj99gd	cmq7zok800038gs3nkafhy5vn	S
cmq7zok88003ags3ngemf7un8	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok800038gs3nkafhy5vn	Black
cmq7zok8i003dgs3nftxpb8h9	cmq7zok6b002kgs3ns6fj99gd	cmq7zok8c003cgs3ntfs7ro6s	M
cmq7zok8i003egs3nvthcaanr	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok8c003cgs3ntfs7ro6s	Black
cmq7zok8s003hgs3n7u73vkjk	cmq7zok6b002kgs3ns6fj99gd	cmq7zok8n003ggs3n12mftxx7	L
cmq7zok8s003igs3n895cgb8n	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok8n003ggs3n12mftxx7	Black
cmq7zok93003lgs3ntuxl0k2a	cmq7zok6b002kgs3ns6fj99gd	cmq7zok8x003kgs3nnddoy9im	XL
cmq7zok93003mgs3nh6u8ahn5	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok8x003kgs3nnddoy9im	Black
cmq7zok9e003pgs3nwusb7yjq	cmq7zok6b002kgs3ns6fj99gd	cmq7zok98003ogs3ne5b1lm40	XXL
cmq7zok9e003qgs3nfm5hjaqy	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok98003ogs3ne5b1lm40	Black
cmq7zok9o003tgs3n2v9ftbst	cmq7zok6b002kgs3ns6fj99gd	cmq7zok9j003sgs3n55tkcfje	S
cmq7zok9o003ugs3n9nsiycd4	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok9j003sgs3n55tkcfje	Navy
cmq7zok9z003xgs3nfx0p331c	cmq7zok6b002kgs3ns6fj99gd	cmq7zok9t003wgs3nm53i7c6z	M
cmq7zok9z003ygs3nun86u8ek	cmq7zok6e002mgs3nhjzzt1z1	cmq7zok9t003wgs3nm53i7c6z	Navy
cmq7zokaa0041gs3ngoolafjk	cmq7zok6b002kgs3ns6fj99gd	cmq7zoka40040gs3nbd0j6q1t	L
cmq7zokaa0042gs3nlkvn8ra6	cmq7zok6e002mgs3nhjzzt1z1	cmq7zoka40040gs3nbd0j6q1t	Navy
cmq7zokam0045gs3n0kyuzxwz	cmq7zok6b002kgs3ns6fj99gd	cmq7zokaf0044gs3najr1lvy0	XL
cmq7zokam0046gs3n1jo4fx7v	cmq7zok6e002mgs3nhjzzt1z1	cmq7zokaf0044gs3najr1lvy0	Navy
cmq7zokax0049gs3n6pe5m5sr	cmq7zok6b002kgs3ns6fj99gd	cmq7zokaq0048gs3nb8dqq05c	XXL
cmq7zokax004ags3n5quqhs36	cmq7zok6e002mgs3nhjzzt1z1	cmq7zokaq0048gs3nb8dqq05c	Navy
cmq7zokc4004kgs3nkwspt6uw	cmq7zokbt004hgs3nm3lllxwp	cmq7zokbx004jgs3nbggd04yb	XS
cmq7zokcg004ngs3n98arliuw	cmq7zokbt004hgs3nm3lllxwp	cmq7zokca004mgs3n4gde9p20	S
cmq7zokcr004qgs3n5vf9phjk	cmq7zokbt004hgs3nm3lllxwp	cmq7zokcl004pgs3nn0o31v0f	M
cmq7zokd1004tgs3n0m00uau1	cmq7zokbt004hgs3nm3lllxwp	cmq7zokcw004sgs3nctxi3dp2	L
cmq7zokdb004wgs3nok94vos8	cmq7zokbt004hgs3nm3lllxwp	cmq7zokd6004vgs3n1jdyblut	XL
cmq7zokf1005dgs3nyv65mcgd	cmq7zoker005ags3ni62qcoex	cmq7zokev005cgs3n8oc0ihy7	Black
cmq7zokfb005ggs3ntcofmzum	cmq7zoker005ags3ni62qcoex	cmq7zokf5005fgs3nyo69thtp	Blue
cmq7zokfm005jgs3npsmw7p7i	cmq7zoker005ags3ni62qcoex	cmq7zokfg005igs3naiwvy00c	Red
cmq97bmwe000p9937844nynyp	cmq97bmvv000k993781trria0	cmq97bmw5000o9937z54xywml	128GB
cmq97bmwl000q9937pca1o4ga	cmq97bmw1000m9937ver92b12	cmq97bmw5000o9937z54xywml	WiFi
cmq97bmwv000t9937ges6rsr8	cmq97bmvv000k993781trria0	cmq97bmwp000s9937dom1bi1w	256GB
cmq97bmwz000u9937d00q78gv	cmq97bmw1000m9937ver92b12	cmq97bmwp000s9937dom1bi1w	WiFi
cmq97bmx9000x9937daw3hxay	cmq97bmvv000k993781trria0	cmq97bmx4000w9937bwwkn3cp	128GB
cmq97bmxd000y9937l2b3jrj2	cmq97bmw1000m9937ver92b12	cmq97bmx4000w9937bwwkn3cp	WiFi+Cellular
cmq97bmyi001a9937cyet533e	cmq97bmy5001599375a91e6r8	cmq97bmyc00199937o5gbm5eh	Obsidian
cmq97bmyl001b9937v6e2rwas	cmq97bmy70017993728a4sv95	cmq97bmyc00199937o5gbm5eh	128GB
cmq97bmyu001e99377jgqe3am	cmq97bmy5001599375a91e6r8	cmq97bmyo001d9937mo7n0far	Porcelain
cmq97bmyx001f9937oa7gmtft	cmq97bmy70017993728a4sv95	cmq97bmyo001d9937mo7n0far	256GB
cmq97bmzo001p9937ud5ntlit	cmq97bmzg001m9937o1qyzean	cmq97bmzj001o9937kkgeiynz	White
cmq97bn0i00219937ya8gm0f5	cmq97bn08001w9937fo3c50gs	cmq97bn0e002099378fy2wuyh	32GB
cmq97bn0l00229937fa8aatak	cmq97bn0b001y993724leqr2i	cmq97bn0e002099378fy2wuyh	1TB
cmq97bn1i002c9937mko9mawq	cmq97bn1a00299937jt3imrd1	cmq97bn1e002b9937ceeihjvd	6 Quart
cmq97bn1s002f9937tdkh7ec5	cmq97bn1a00299937jt3imrd1	cmq97bn1m002e99377xums5p3	8 Quart
cmq97bn2p002p9937yim588vc	cmq97bn2f002m9937z2ysfo8h	cmq97bn2j002o9937piyvntiq	Nickel/Yellow
cmq97bn3j002z9937srorkugx	cmq97bn39002w9937xefgyx7z	cmq97bn3c002y9937unghn8dn	Small
cmq97bn3t00329937orcfhwyp	cmq97bn39002w9937xefgyx7z	cmq97bn3n003199378zysni3l	Large
cmq97bn4p003c99370c1ikhwx	cmq97bn4f00399937oau8ocgw	cmq97bn4j003b9937vjy1v68h	Black
cmq97bn51003f9937x9zh2240	cmq97bn4f00399937oau8ocgw	cmq97bn4v003e9937pzqpw0fr	Gray
cmq97bn62003p99373cuq9l93	cmq97bn5r003m9937767pp8pr	cmq97bn5v003o9937jvcckmqr	3-pack
cmq97bn6y003z9937zp36q13g	cmq97bn6q003w993734m60ds8	cmq97bn6t003y9937ngxdqm94	Pair
cmq97bn7x00499937bfzjqevh	cmq97bn7o00469937o9zcw3f3	cmq97bn7r00489937w6r5n05g	Purple
cmq97bn88004c99371iv9qftd	cmq97bn7o00469937o9zcw3f3	cmq97bn81004b9937j991s3kx	Blue
cmq97bn8i004f993701dsp2tc	cmq97bn7o00469937o9zcw3f3	cmq97bn8d004e99372ik24v2f	Black
cmq97bn9h004r9937bb7vac7c	cmq97bn94004m99379laj48p3	cmq97bn9b004q9937mv2sn17z	Abyss Grey
cmq97bn9m004s9937johih07f	cmq97bn97004o9937viyr8arf	cmq97bn9b004q9937mv2sn17z	S/M
cmq97bn9x004v9937asbpw7yo	cmq97bn94004m99379laj48p3	cmq97bn9q004u9937pvgaz3fq	Abyss Grey
cmq97bna1004w99376wxzvakb	cmq97bn97004o9937viyr8arf	cmq97bn9q004u9937pvgaz3fq	M/L
cmq97bnab004z9937h77uujeg	cmq97bn94004m99379laj48p3	cmq97bna5004y9937nn02hwfy	Rigby Red
cmq97bnag00509937jphxnoyw	cmq97bn97004o9937viyr8arf	cmq97bna5004y9937nn02hwfy	S/M
cmq97bnbf005c9937els3jlk2	cmq97bnb200579937fvrlljv5	cmq97bnb8005b9937vih52ovn	Black
cmq97bnbj005d9937elfdkwd8	cmq97bnb500599937v38czx9a	cmq97bnb8005b9937vih52ovn	S
cmq97bnbs005g9937blee779f	cmq97bnb200579937fvrlljv5	cmq97bnbm005f9937evhno12d	Black
cmq97bnbw005h9937kj9vq7l9	cmq97bnb500599937v38czx9a	cmq97bnbm005f9937evhno12d	M
cmq97bnc5005k9937zsd49bac	cmq97bnb200579937fvrlljv5	cmq97bnc0005j9937ezzu6bxm	Black
cmq97bnc9005l9937w3cxu164	cmq97bnb500599937v38czx9a	cmq97bnc0005j9937ezzu6bxm	L
cmq97bncj005o9937notw96u6	cmq97bnb200579937fvrlljv5	cmq97bncd005n9937na9stxhu	Black
cmq97bncn005p99376zkyqzw1	cmq97bnb500599937v38czx9a	cmq97bncd005n9937na9stxhu	XL
cmq97bncx005s9937t8ikyu96	cmq97bnb200579937fvrlljv5	cmq97bncs005r9937wuzpmonq	Navy
cmq97bnd1005t9937um6e8831	cmq97bnb500599937v38czx9a	cmq97bncs005r9937wuzpmonq	S
cmq97bndb005w99375yn8oa3x	cmq97bnb200579937fvrlljv5	cmq97bnd5005v9937o2gebv2g	Navy
cmq97bndf005x9937ntqiz0ae	cmq97bnb500599937v38czx9a	cmq97bnd5005v9937o2gebv2g	M
cmq97bndp006099372xcjs3ae	cmq97bnb200579937fvrlljv5	cmq97bndj005z9937yyb6e85m	Navy
cmq97bndt00619937giw21edt	cmq97bnb500599937v38czx9a	cmq97bndj005z9937yyb6e85m	L
cmq97bne4006499379wffab8a	cmq97bnb200579937fvrlljv5	cmq97bndx00639937hvney3jp	Navy
cmq97bne700659937lbuhtznb	cmq97bnb500599937v38czx9a	cmq97bndx00639937hvney3jp	XL
cmq97bneh006899372wqr2yhl	cmq97bnb200579937fvrlljv5	cmq97bnec006799379p11aw2i	Gray
cmq97bnem006999379c62lxb7	cmq97bnb500599937v38czx9a	cmq97bnec006799379p11aw2i	S
cmq97bnew006c9937tp0vdorf	cmq97bnb200579937fvrlljv5	cmq97bner006b993757e3pltf	Gray
cmq97bnez006d9937eiarxc6s	cmq97bnb500599937v38czx9a	cmq97bner006b993757e3pltf	M
cmq97bnf9006g9937xlgn4os1	cmq97bnb200579937fvrlljv5	cmq97bnf3006f9937imbl47k6	Gray
cmq97bnfc006h993768f5augj	cmq97bnb500599937v38czx9a	cmq97bnf3006f9937imbl47k6	L
cmq97bnfn006k99373rws1y26	cmq97bnb200579937fvrlljv5	cmq97bnfg006j99373xptwlm6	Gray
cmq97bnfq006l9937l3ivolj6	cmq97bnb500599937v38czx9a	cmq97bnfg006j99373xptwlm6	XL
cmq97bngq006x9937654dpn4x	cmq97bnge006s9937jvyvc1a1	cmq97bngl006w99379tb9w7fw	Black
cmq97bngt006y9937a98lm9u1	cmq97bngi006u99378yyg27w8	cmq97bngl006w99379tb9w7fw	XS
cmq97bnh300719937w6ahjnio	cmq97bnge006s9937jvyvc1a1	cmq97bngy007099377jui9ck8	Black
cmq97bnh7007299378z5cwq2g	cmq97bngi006u99378yyg27w8	cmq97bngy007099377jui9ck8	S
cmq97bnhi00759937uxqsdo0q	cmq97bnge006s9937jvyvc1a1	cmq97bnhb007499372d34xssp	Black
cmq97bnhm00769937velwukns	cmq97bngi006u99378yyg27w8	cmq97bnhb007499372d34xssp	M
cmq97bnhw00799937kttnrfyf	cmq97bnge006s9937jvyvc1a1	cmq97bnhq0078993700tq5sum	Black
cmq97bnhz007a9937oqtunpw4	cmq97bngi006u99378yyg27w8	cmq97bnhq0078993700tq5sum	L
cmq97bni9007d9937lolunshr	cmq97bnge006s9937jvyvc1a1	cmq97bni3007c99372ipa9kn2	Black
cmq97bnic007e9937h94eq34m	cmq97bngi006u99378yyg27w8	cmq97bni3007c99372ipa9kn2	XL
cmq97bnin007h9937tut6siti	cmq97bnge006s9937jvyvc1a1	cmq97bnih007g9937sdw5spc9	Midnight Blue
cmq97bnir007i9937sxogm23k	cmq97bngi006u99378yyg27w8	cmq97bnih007g9937sdw5spc9	XS
cmq97bnj0007l99374avmmc3y	cmq97bnge006s9937jvyvc1a1	cmq97bniv007k9937htzrv07s	Midnight Blue
cmq97bnj4007m9937z38sqhou	cmq97bngi006u99378yyg27w8	cmq97bniv007k9937htzrv07s	S
cmq97bnje007p9937ope35yaj	cmq97bnge006s9937jvyvc1a1	cmq97bnj8007o9937netyhflm	Midnight Blue
cmq97bnjh007q9937kw3lrc6w	cmq97bngi006u99378yyg27w8	cmq97bnj8007o9937netyhflm	M
cmq97bnjr007t9937dm3kbuuv	cmq97bnge006s9937jvyvc1a1	cmq97bnjl007s9937mgb6et0c	Midnight Blue
cmq97bnjv007u9937nwepicet	cmq97bngi006u99378yyg27w8	cmq97bnjl007s9937mgb6et0c	L
cmq97bnk5007x99373qd7bhiz	cmq97bnge006s9937jvyvc1a1	cmq97bnjz007w99377mjpcomx	Midnight Blue
cmq97bnk9007y9937sx3j1v70	cmq97bngi006u99378yyg27w8	cmq97bnjz007w99377mjpcomx	XL
cmq97bnkj00819937mlrygh99	cmq97bnge006s9937jvyvc1a1	cmq97bnkd00809937104c40tt	Dusty Rose
cmq97bnkn00829937ppvpcfil	cmq97bngi006u99378yyg27w8	cmq97bnkd00809937104c40tt	XS
cmq97bnkx00859937jpwihm3a	cmq97bnge006s9937jvyvc1a1	cmq97bnks008499376ovh49tv	Dusty Rose
cmq97bnl100869937s86m5p7u	cmq97bngi006u99378yyg27w8	cmq97bnks008499376ovh49tv	S
cmq97bnld008999379hwwwacx	cmq97bnge006s9937jvyvc1a1	cmq97bnl600889937sf9i09rm	Dusty Rose
cmq97bnlg008a9937k60l2cjt	cmq97bngi006u99378yyg27w8	cmq97bnl600889937sf9i09rm	M
cmq97bnlq008d9937adxf8zda	cmq97bnge006s9937jvyvc1a1	cmq97bnlk008c99377nvsix25	Dusty Rose
cmq97bnlt008e9937t9m8gmwa	cmq97bngi006u99378yyg27w8	cmq97bnlk008c99377nvsix25	L
cmq97bnm2008h9937o6n4dgyy	cmq97bnge006s9937jvyvc1a1	cmq97bnlx008g9937f5lfe1yb	Dusty Rose
cmq97bnm4008i9937g1lq57kp	cmq97bngi006u99378yyg27w8	cmq97bnlx008g9937f5lfe1yb	XL
cmq97bnn0008u99378zqvtzx0	cmq97bnmo008p9937q2preqjs	cmq97bnmu008t9937thj384c9	Khaki
cmq97bnn3008v9937a3ff1lg0	cmq97bnmr008r9937cba7lgj9	cmq97bnmu008t9937thj384c9	30x30
cmq97bnnc008y9937v7q8f8hg	cmq97bnmo008p9937q2preqjs	cmq97bnn7008x9937lqdzrkk9	Khaki
cmq97bnng008z9937ed959047	cmq97bnmr008r9937cba7lgj9	cmq97bnn7008x9937lqdzrkk9	32x30
cmq97bnno00929937j99ivwct	cmq97bnmo008p9937q2preqjs	cmq97bnnj00919937pxguw60m	Khaki
cmq97bnnr00939937rsjbz8zq	cmq97bnmr008r9937cba7lgj9	cmq97bnnj00919937pxguw60m	32x32
cmq97bno100969937hgpzerfd	cmq97bnmo008p9937q2preqjs	cmq97bnnv0095993765er7ajd	Khaki
cmq97bno400979937q51cgn2d	cmq97bnmr008r9937cba7lgj9	cmq97bnnv0095993765er7ajd	34x32
cmq97bnoe009a9937qujec3i6	cmq97bnmo008p9937q2preqjs	cmq97bno800999937y3bhtd7k	Khaki
cmq97bnoi009b9937uds3ds03	cmq97bnmr008r9937cba7lgj9	cmq97bno800999937y3bhtd7k	36x32
cmq97bnos009e99371elwka7q	cmq97bnmo008p9937q2preqjs	cmq97bnol009d9937hbyl0uhy	Navy
cmq97bnow009f9937nwej1qzs	cmq97bnmr008r9937cba7lgj9	cmq97bnol009d9937hbyl0uhy	30x30
cmq97bnp6009i9937lsf3zop6	cmq97bnmo008p9937q2preqjs	cmq97bnp0009h9937czt3nh82	Navy
cmq97bnpa009j9937k319ezki	cmq97bnmr008r9937cba7lgj9	cmq97bnp0009h9937czt3nh82	32x30
cmq97bnpj009m99376zaw6pnx	cmq97bnmo008p9937q2preqjs	cmq97bnpf009l9937wz6j1p0m	Navy
cmq97bnpn009n9937rst8y9sl	cmq97bnmr008r9937cba7lgj9	cmq97bnpf009l9937wz6j1p0m	32x32
cmq97bnpw009q99378f2orgvk	cmq97bnmo008p9937q2preqjs	cmq97bnpr009p99375oiwbp3d	Navy
cmq97bnpz009r99374w7zuy0j	cmq97bnmr008r9937cba7lgj9	cmq97bnpr009p99375oiwbp3d	34x32
cmq97bnq7009u9937wtfrabem	cmq97bnmo008p9937q2preqjs	cmq97bnq1009t9937nvr0me3q	Navy
cmq97bnqa009v9937wr3v85zu	cmq97bnmr008r9937cba7lgj9	cmq97bnq1009t9937nvr0me3q	36x32
cmq97bnqi009y9937t03lawb0	cmq97bnmo008p9937q2preqjs	cmq97bnqe009x99377epmhylu	Olive
cmq97bnqm009z9937pzcat1ey	cmq97bnmr008r9937cba7lgj9	cmq97bnqe009x99377epmhylu	30x30
cmq97bnqv00a29937el1f3mpc	cmq97bnmo008p9937q2preqjs	cmq97bnqp00a19937osbudagy	Olive
cmq97bnqy00a39937bsd608ax	cmq97bnmr008r9937cba7lgj9	cmq97bnqp00a19937osbudagy	32x30
cmq97bnr700a69937dr6fllgo	cmq97bnmo008p9937q2preqjs	cmq97bnr100a59937jozt26pw	Olive
cmq97bnrb00a79937pyic653x	cmq97bnmr008r9937cba7lgj9	cmq97bnr100a59937jozt26pw	32x32
cmq97bnrk00aa9937tsleet14	cmq97bnmo008p9937q2preqjs	cmq97bnrf00a99937y5lb66in	Olive
cmq97bnro00ab9937706c99y4	cmq97bnmr008r9937cba7lgj9	cmq97bnrf00a99937y5lb66in	34x32
cmq97bnrx00ae99376tjq9lpm	cmq97bnmo008p9937q2preqjs	cmq97bnrs00ad9937961ihixe	Olive
cmq97bns100af9937gzwc6cso	cmq97bnmr008r9937cba7lgj9	cmq97bnrs00ad9937961ihixe	36x32
cmq97bnsz00ar9937g29hzqtg	cmq97bnsn00am9937kjp2xcjj	cmq97bnst00aq9937car5qqj8	Cream
cmq97bnt300as99370c9unqum	cmq97bnsq00ao99372zyt6qhs	cmq97bnst00aq9937car5qqj8	XS/S
cmq97bntc00av993748ud1vpl	cmq97bnsn00am9937kjp2xcjj	cmq97bnt600au9937dbfuy3zl	Cream
cmq97bntf00aw9937xt0370jo	cmq97bnsq00ao99372zyt6qhs	cmq97bnt600au9937dbfuy3zl	M/L
cmq97bntn00az9937dm6mox1h	cmq97bnsn00am9937kjp2xcjj	cmq97bntj00ay99372vrogh6r	Cream
cmq97bntq00b099374ucu2tyk	cmq97bnsq00ao99372zyt6qhs	cmq97bntj00ay99372vrogh6r	XL/XXL
cmq97bnu000b39937btggi2jh	cmq97bnsn00am9937kjp2xcjj	cmq97bntu00b299379vm1aca5	Dusty Pink
cmq97bnu300b49937j3a5efbl	cmq97bnsq00ao99372zyt6qhs	cmq97bntu00b299379vm1aca5	XS/S
cmq97bnub00b79937dzoh5zq8	cmq97bnsn00am9937kjp2xcjj	cmq97bnu600b699379njjpnfw	Dusty Pink
cmq97bnuf00b89937bzq9ipl3	cmq97bnsq00ao99372zyt6qhs	cmq97bnu600b699379njjpnfw	M/L
cmq97bnun00bb9937d221grhs	cmq97bnsn00am9937kjp2xcjj	cmq97bnui00ba993754xpsqyq	Dusty Pink
cmq97bnur00bc9937bhletmgv	cmq97bnsq00ao99372zyt6qhs	cmq97bnui00ba993754xpsqyq	XL/XXL
cmq97bnv100bf9937ciru41by	cmq97bnsn00am9937kjp2xcjj	cmq97bnuv00be99377j4xas44	Sage Green
cmq97bnv400bg9937bgnlssxp	cmq97bnsq00ao99372zyt6qhs	cmq97bnuv00be99377j4xas44	XS/S
cmq97bnve00bj9937a1e6cnod	cmq97bnsn00am9937kjp2xcjj	cmq97bnv800bi9937lq4v3vod	Sage Green
cmq97bnvh00bk9937qrapbiey	cmq97bnsq00ao99372zyt6qhs	cmq97bnv800bi9937lq4v3vod	M/L
cmq97bnvs00bn9937zohvlhr2	cmq97bnsn00am9937kjp2xcjj	cmq97bnvm00bm9937zv2m7oq9	Sage Green
cmq97bnvw00bo9937km7n2o37	cmq97bnsq00ao99372zyt6qhs	cmq97bnvm00bm9937zv2m7oq9	XL/XXL
cmq97bnw600br9937gegubqwa	cmq97bnsn00am9937kjp2xcjj	cmq97bnw000bq9937oylcd88d	Caramel
cmq97bnwa00bs99371ntwpwt9	cmq97bnsq00ao99372zyt6qhs	cmq97bnw000bq9937oylcd88d	XS/S
cmq97bnwj00bv99372td4g5dt	cmq97bnsn00am9937kjp2xcjj	cmq97bnwe00bu9937djzfutze	Caramel
cmq97bnwn00bw993781fd8kls	cmq97bnsq00ao99372zyt6qhs	cmq97bnwe00bu9937djzfutze	M/L
cmq97bnww00bz99376txsn65v	cmq97bnsn00am9937kjp2xcjj	cmq97bnwr00by9937gvl8njhn	Caramel
cmq97bnx000c099373qy6u8uh	cmq97bnsq00ao99372zyt6qhs	cmq97bnwr00by9937gvl8njhn	XL/XXL
cmq97bnxu00ca99372b6hw3nh	cmq97bnxm00c79937fakwdj68	cmq97bnxq00c999376g76p5am	Tan
cmq97bny500cd9937m7j7as2s	cmq97bnxm00c79937fakwdj68	cmq97bnxy00cc99378z37ejsv	Black
cmq97bnyf00cg99371kvqxkfe	cmq97bnxm00c79937fakwdj68	cmq97bny900cf9937d0tfrmjf	Cognac
cmq97bnzf00cs9937q2qh4aij	cmq97bnz300cn9937wfh0oebc	cmq97bnz900cr9937g169agh7	Silver
cmq97bnzk00ct9937otegj5u8	cmq97bnz600cp99376fxpwhhv	cmq97bnz900cr9937g169agh7	Black Leather
cmq97bnzs00cw9937t8f3isr4	cmq97bnz300cn9937wfh0oebc	cmq97bnzo00cv9937djipy78r	Gold
cmq97bnzw00cx9937ojs5wbwb	cmq97bnz600cp99376fxpwhhv	cmq97bnzo00cv9937djipy78r	Brown Leather
cmq97bo0400d09937aaapjqkp	cmq97bnz300cn9937wfh0oebc	cmq97bo0000cz9937tue90t8c	Rose Gold
cmq97bo0800d199374tbdsc1u	cmq97bnz600cp99376fxpwhhv	cmq97bo0000cz9937tue90t8c	Blush Leather
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_attributes (id, "productId", name, "createdAt") FROM stdin;
cmq7zok090011gs3n8ukotrze	cmq7zojzm000xgs3ngn4ayvuf	Color	2026-06-10 11:32:26.313
cmq7zok0f0013gs3nmjp8pakw	cmq7zojzm000xgs3ngn4ayvuf	Storage	2026-06-10 11:32:26.319
cmq7zok29001jgs3noqem40yq	cmq7zok1w001fgs3nm1mykryk	RAM	2026-06-10 11:32:26.386
cmq7zok3u001wgs3ne80hau3c	cmq7zok3g001tgs3n54h9jwsy	Color	2026-06-10 11:32:26.442
cmq7zok5b0029gs3naky65vtr	cmq7zok4y0026gs3n53wlk7w7	Color	2026-06-10 11:32:26.495
cmq7zok6b002kgs3ns6fj99gd	cmq7zok5x002ggs3n1p4gnxzd	Size	2026-06-10 11:32:26.531
cmq7zok6e002mgs3nhjzzt1z1	cmq7zok5x002ggs3n1p4gnxzd	Color	2026-06-10 11:32:26.535
cmq7zokbt004hgs3nm3lllxwp	cmq7zokbd004egs3n6s1k468k	Size	2026-06-10 11:32:26.729
cmq7zoker005ags3ni62qcoex	cmq7zokef0057gs3n1b8noa42	Color	2026-06-10 11:32:26.836
cmq97bmvv000k993781trria0	cmq97bmv5000h9937o33snekq	Storage	2026-06-11 07:54:06.619
cmq97bmw1000m9937ver92b12	cmq97bmv5000h9937o33snekq	Connectivity	2026-06-11 07:54:06.625
cmq97bmy5001599375a91e6r8	cmq97bmxt0012993740nombuc	Color	2026-06-11 07:54:06.701
cmq97bmy70017993728a4sv95	cmq97bmxt0012993740nombuc	Storage	2026-06-11 07:54:06.704
cmq97bmzg001m9937o1qyzean	cmq97bmz5001j9937mm6mwic3	Color	2026-06-11 07:54:06.748
cmq97bn08001w9937fo3c50gs	cmq97bmzy001t9937vbe5iarj	RAM	2026-06-11 07:54:06.776
cmq97bn0b001y993724leqr2i	cmq97bmzy001t9937vbe5iarj	Storage	2026-06-11 07:54:06.779
cmq97bn1a00299937jt3imrd1	cmq97bn0x002699377trcggcu	Size	2026-06-11 07:54:06.815
cmq97bn2f002m9937z2ysfo8h	cmq97bn23002j9937xe78lg6a	Color	2026-06-11 07:54:06.856
cmq97bn39002w9937xefgyx7z	cmq97bn2y002t9937i45b6jjj	Size	2026-06-11 07:54:06.886
cmq97bn4f00399937oau8ocgw	cmq97bn430036993795wekpfa	Color	2026-06-11 07:54:06.927
cmq97bn5r003m9937767pp8pr	cmq97bn5e003j9937ozducyyc	Pack	2026-06-11 07:54:06.975
cmq97bn6q003w993734m60ds8	cmq97bn6e003t9937ffiqndg0	Set	2026-06-11 07:54:07.01
cmq97bn7o00469937o9zcw3f3	cmq97bn7b004399377cyltbao	Color	2026-06-11 07:54:07.044
cmq97bn94004m99379laj48p3	cmq97bn8s004j99376unuwn4o	Color	2026-06-11 07:54:07.097
cmq97bn97004o9937viyr8arf	cmq97bn8s004j99376unuwn4o	Size	2026-06-11 07:54:07.1
cmq97bnb200579937fvrlljv5	cmq97bnaq0054993743zvjxk2	Color	2026-06-11 07:54:07.166
cmq97bnb500599937v38czx9a	cmq97bnaq0054993743zvjxk2	Size	2026-06-11 07:54:07.169
cmq97bnge006s9937jvyvc1a1	cmq97bng2006p9937qmwi6e2z	Color	2026-06-11 07:54:07.359
cmq97bngi006u99378yyg27w8	cmq97bng2006p9937qmwi6e2z	Size	2026-06-11 07:54:07.362
cmq97bnmo008p9937q2preqjs	cmq97bnmd008m9937h8ixtofx	Color	2026-06-11 07:54:07.584
cmq97bnmr008r9937cba7lgj9	cmq97bnmd008m9937h8ixtofx	Size	2026-06-11 07:54:07.587
cmq97bnsn00am9937kjp2xcjj	cmq97bnsc00aj9937erw15una	Color	2026-06-11 07:54:07.8
cmq97bnsq00ao99372zyt6qhs	cmq97bnsc00aj9937erw15una	Size	2026-06-11 07:54:07.802
cmq97bnxm00c79937fakwdj68	cmq97bnxa00c49937xs3y31ct	Color	2026-06-11 07:54:07.978
cmq97bnz300cn9937wfh0oebc	cmq97bnyr00ck99378qjonzwt	Case	2026-06-11 07:54:08.031
cmq97bnz600cp99376fxpwhhv	cmq97bnyr00ck99378qjonzwt	Strap	2026-06-11 07:54:08.034
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, "productId", url, "altText", "displayOrder", "isPrimary", width, height, "createdAt") FROM stdin;
cmq7zok01000ygs3nh1hs102b	cmq7zojzm000xgs3ngn4ayvuf	https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800	iPhone 15 Pro Natural Titanium	0	t	\N	\N	2026-06-10 11:32:26.305
cmq7zok01000zgs3n2eutqwsj	cmq7zojzm000xgs3ngn4ayvuf	https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800	iPhone 15 Pro back view	1	f	\N	\N	2026-06-10 11:32:26.305
cmq7zok25001ggs3nikvv4zsx	cmq7zok1w001fgs3nm1mykryk	https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800	MacBook Pro 14 Space Gray	0	t	\N	\N	2026-06-10 11:32:26.381
cmq7zok25001hgs3niqgzn5cj	cmq7zok1w001fgs3nm1mykryk	https://images.unsplash.com/photo-1611186871525-5a2b48b8d7a9?w=800	MacBook Pro open view	1	f	\N	\N	2026-06-10 11:32:26.381
cmq7zok3p001ugs3nkysvcqna	cmq7zok3g001tgs3n54h9jwsy	https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800	Sony WH-1000XM5 Black	0	t	\N	\N	2026-06-10 11:32:26.437
cmq7zok560027gs3n33zb32ay	cmq7zok4y0026gs3n53wlk7w7	https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800	Samsung Galaxy S24 Ultra	0	t	\N	\N	2026-06-10 11:32:26.49
cmq7zok65002hgs3no0rt80p6	cmq7zok5x002ggs3n1p4gnxzd	https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800	White classic t-shirt	0	t	\N	\N	2026-06-10 11:32:26.526
cmq7zok65002igs3n76io0jpt	cmq7zok5x002ggs3n1p4gnxzd	https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800	Navy classic t-shirt	1	f	\N	\N	2026-06-10 11:32:26.526
cmq7zokbn004fgs3n0e229m0u	cmq7zokbd004egs3n6s1k468k	https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800	Women's floral dress	0	t	\N	\N	2026-06-10 11:32:26.723
cmq7zokdy0051gs3nq6axo081	cmq7zokdr0050gs3niugpete2	https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800	Dell XPS 15 laptop	0	t	\N	\N	2026-06-10 11:32:26.807
cmq7zoken0058gs3nuxz5v1jw	cmq7zokef0057gs3n1b8noa42	https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800	JBL Charge 5	0	t	\N	\N	2026-06-10 11:32:26.832
cmq97bmvp000i9937pvd48zrg	cmq97bmv5000h9937o33snekq	https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800	iPad Pro 12.9 M2	0	t	\N	\N	2026-06-11 07:54:06.614
cmq97bmy100139937a68tpyif	cmq97bmxt0012993740nombuc	https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800	Google Pixel 8 Pro	0	t	\N	\N	2026-06-11 07:54:06.697
cmq97bmzc001k99371ns2ic75	cmq97bmz5001j9937mm6mwic3	https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800	Apple AirPods Pro 2nd Generation	0	t	\N	\N	2026-06-11 07:54:06.744
cmq97bn03001u9937b07dxzio	cmq97bmzy001t9937vbe5iarj	https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800	ASUS ROG Zephyrus G14	0	t	\N	\N	2026-06-11 07:54:06.771
cmq97bn15002799376yavtqw0	cmq97bn0x002699377trcggcu	https://images.unsplash.com/photo-1585515320310-259814833e62?w=800	Instant Pot Duo 7-in-1	0	t	\N	\N	2026-06-11 07:54:06.809
cmq97bn2b002k9937ty04e3np	cmq97bn23002j9937xe78lg6a	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800	Dyson V15 Detect Cordless Vacuum	0	t	\N	\N	2026-06-11 07:54:06.852
cmq97bn35002u9937iycr533c	cmq97bn2y002t9937i45b6jjj	https://images.unsplash.com/photo-1603575448878-868a20723f5d?w=800	Himalayan Salt Lamp	0	t	\N	\N	2026-06-11 07:54:06.881
cmq97bn4a00379937h1s8360k	cmq97bn430036993795wekpfa	https://images.unsplash.com/photo-1589384267710-7a25bc5b4862?w=800	Ergonomic Mesh Office Chair	0	t	\N	\N	2026-06-11 07:54:06.922
cmq97bn5m003k9937f800zfm0	cmq97bn5e003j9937ozducyyc	https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800	Scented Soy Candle Set	0	t	\N	\N	2026-06-11 07:54:06.971
cmq97bn6m003u993745czplsg	cmq97bn6e003t9937ffiqndg0	https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800	Bowflex SelectTech 552 Dumbbells	0	t	\N	\N	2026-06-11 07:54:07.006
cmq97bn7j00449937jq07qi9m	cmq97bn7b004399377cyltbao	https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800	Premium Yoga Mat 6mm	0	t	\N	\N	2026-06-11 07:54:07.039
cmq97bn8z004k9937un6movfg	cmq97bn8s004j99376unuwn4o	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800	Osprey Atmos AG 65 Hiking Backpack	0	t	\N	\N	2026-06-11 07:54:07.092
cmq97bnay00559937j1oa5urp	cmq97bnaq0054993743zvjxk2	https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800	Nike Dri-FIT Training Shorts	0	t	\N	\N	2026-06-11 07:54:07.162
cmq97bnga006q9937s3mbc3ue	cmq97bng2006p9937qmwi6e2z	https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800	Women's High-Waist Yoga Leggings	0	t	\N	\N	2026-06-11 07:54:07.354
cmq97bnmk008n9937fvrd91zw	cmq97bnmd008m9937h8ixtofx	https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800	Men's Slim Fit Chino Pants	0	t	\N	\N	2026-06-11 07:54:07.581
cmq97bnsk00ak9937mdi7fpe4	cmq97bnsc00aj9937erw15una	https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800	Women's Oversized Knit Sweater	0	t	\N	\N	2026-06-11 07:54:07.796
cmq97bnxi00c59937zsq0a7ff	cmq97bnxa00c49937xs3y31ct	https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800	Leather Tote Bag	0	t	\N	\N	2026-06-11 07:54:07.974
cmq97bnyz00cl9937iwy7ski7	cmq97bnyr00ck99378qjonzwt	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800	Classic Minimalist Analog Watch	0	t	\N	\N	2026-06-11 07:54:08.027
\.


--
-- Data for Name: product_inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_inventory (id, "productId", "variantId", sku, quantity, "reservedQuantity", "lowStockThreshold", "trackInventory", "allowBackorder", location, "createdAt", "updatedAt") FROM stdin;
cmq7zok1e001dgs3nn0kfsye4	cmq7zojzm000xgs3ngn4ayvuf	\N	APPL-IP15P-256-INV	83	5	10	t	f	\N	2026-06-10 11:32:26.354	2026-06-10 11:32:26.354
cmq7zok34001rgs3nayrj1w4o	cmq7zok1w001fgs3nm1mykryk	\N	APPL-MBP14-M3-INV	37	2	5	t	f	\N	2026-06-10 11:32:26.416	2026-06-10 11:32:26.416
cmq7zok4m0024gs3nv7eoy2el	cmq7zok3g001tgs3n54h9jwsy	\N	SONY-WH1000XM5-INV	109	8	15	t	f	\N	2026-06-10 11:32:26.47	2026-06-10 11:32:26.47
cmq7zok5q002egs3nxuy3flyb	cmq7zok4y0026gs3n53wlk7w7	\N	SAMS-S24U-512-INV	30	3	8	t	f	\N	2026-06-10 11:32:26.51	2026-06-10 11:32:26.51
cmq7zokb2004cgs3ndbus7jdu	cmq7zok5x002ggs3n1p4gnxzd	\N	FASH-MENS-TEE-001-INV	375	12	30	t	f	\N	2026-06-10 11:32:26.702	2026-06-10 11:32:26.702
cmq7zokdf004ygs3njkpx4mme	cmq7zokbd004egs3n6s1k468k	\N	FASH-WMNS-DRESS-001-INV	87	4	10	t	f	\N	2026-06-10 11:32:26.788	2026-06-10 11:32:26.788
cmq7zokfq005lgs3nm3bp6ju0	cmq7zokef0057gs3n1b8noa42	\N	JBL-CHARGE5-INV	123	6	20	t	f	\N	2026-06-10 11:32:26.87	2026-06-10 11:32:26.87
cmq97bmxi00109937b62ysek8	cmq97bmv5000h9937o33snekq	\N	APPL-IPADPRO-M2-INV	55	0	10	t	f	\N	2026-06-11 07:54:06.678	2026-06-11 07:54:06.678
cmq97bmz0001h9937yzs58opg	cmq97bmxt0012993740nombuc	\N	GOOG-PIX8PRO-INV	48	0	10	t	f	\N	2026-06-11 07:54:06.733	2026-06-11 07:54:06.733
cmq97bmzs001r9937c0d99um4	cmq97bmz5001j9937mm6mwic3	\N	APPL-APP-2GEN-INV	80	0	10	t	f	\N	2026-06-11 07:54:06.76	2026-06-11 07:54:06.76
cmq97bn0q00249937sa0x5hp8	cmq97bmzy001t9937vbe5iarj	\N	ASUS-ROG-G14-24-INV	15	0	10	t	f	\N	2026-06-11 07:54:06.795	2026-06-11 07:54:06.795
cmq97bn1w002h99370rxce1wq	cmq97bn0x002699377trcggcu	\N	INST-DUO-7IN1-6QT-INV	195	0	10	t	f	\N	2026-06-11 07:54:06.836	2026-06-11 07:54:06.836
cmq97bn2s002r99376v814ovr	cmq97bn23002j9937xe78lg6a	\N	DYSO-V15-DETECT-INV	35	0	10	t	f	\N	2026-06-11 07:54:06.868	2026-06-11 07:54:06.868
cmq97bn3x00349937nhnz6sfk	cmq97bn2y002t9937i45b6jjj	\N	DECOR-SALT-LAMP-INV	240	0	10	t	f	\N	2026-06-11 07:54:06.909	2026-06-11 07:54:06.909
cmq97bn56003h99378a6mn6rr	cmq97bn430036993795wekpfa	\N	FURN-CHAIR-ERG-INV	65	0	10	t	f	\N	2026-06-11 07:54:06.954	2026-06-11 07:54:06.954
cmq97bn66003r993725gcryr7	cmq97bn5e003j9937ozducyyc	\N	DECOR-CANDLE-3PK-INV	200	0	10	t	f	\N	2026-06-11 07:54:06.99	2026-06-11 07:54:06.99
cmq97bn7300419937bab4qhla	cmq97bn6e003t9937ffiqndg0	\N	BWFL-ST552-PAIR-INV	45	0	10	t	f	\N	2026-06-11 07:54:07.023	2026-06-11 07:54:07.023
cmq97bn8m004h9937yzvr246p	cmq97bn7b004399377cyltbao	\N	YOGA-MAT-6MM-INV	605	0	10	t	f	\N	2026-06-11 07:54:07.078	2026-06-11 07:54:07.078
cmq97bnfu006n99373tmvkulc	cmq97bnaq0054993743zvjxk2	\N	NIKE-DRI-SHORTS-M-INV	420	0	10	t	f	\N	2026-06-11 07:54:07.338	2026-06-11 07:54:07.338
cmq97bnm8008k9937yzyk7lnq	cmq97bng2006p9937qmwi6e2z	\N	YOGA-LEGGINGS-W-INV	520	0	10	t	f	\N	2026-06-11 07:54:07.568	2026-06-11 07:54:07.568
cmq97bns500ah9937lrgx49fc	cmq97bnmd008m9937h8ixtofx	\N	FASH-MENS-CHINO-INV	290	0	10	t	f	\N	2026-06-11 07:54:07.781	2026-06-11 07:54:07.781
cmq97bnyj00ci9937pjnk2weq	cmq97bnxa00c49937xs3y31ct	\N	FASH-TOTE-LTHR-INV	103	0	10	t	f	\N	2026-06-11 07:54:08.012	2026-06-11 07:54:08.012
cmq7zokea0055gs3n7rsep3am	cmq7zokdr0050gs3niugpete2	\N	DELL-XPS15-9530-INV	18	2	5	t	f	\N	2026-06-10 11:32:26.818	2026-06-11 08:08:52.615
cmq97bnx400c29937y2bs3spi	cmq97bnsc00aj9937erw15una	\N	FASH-WMNS-SWTR-INV	360	2	10	t	f	\N	2026-06-11 07:54:07.96	2026-06-17 11:46:43.41
cmq97bnak00529937ymzy23n2	cmq97bn8s004j99376unuwn4o	\N	OSPR-ATMOS-65-INV	80	2	10	t	f	\N	2026-06-11 07:54:07.148	2026-06-18 06:34:06.903
cmq97bo0c00d39937mn8xqim3	cmq97bnyr00ck99378qjonzwt	\N	FASH-WATCH-ALOG-INV	113	6	10	t	f	\N	2026-06-11 07:54:08.076	2026-06-18 06:39:25.356
\.


--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_tags ("productId", "tagId") FROM stdin;
cmq7zojzm000xgs3ngn4ayvuf	cmq7zojyu000sgs3n73p81l0z
cmq7zojzm000xgs3ngn4ayvuf	cmq7zojza000ugs3n5yr5tf1f
cmq7zok1w001fgs3nm1mykryk	cmq7zojyu000sgs3n73p81l0z
cmq7zok1w001fgs3nm1mykryk	cmq7zojz3000tgs3n8qd5ep42
cmq7zok3g001tgs3n54h9jwsy	cmq7zojza000ugs3n5yr5tf1f
cmq7zok3g001tgs3n54h9jwsy	cmq7zojzg000vgs3noik9uqge
cmq7zok5x002ggs3n1p4gnxzd	cmq7zojzg000vgs3noik9uqge
cmq7zok5x002ggs3n1p4gnxzd	cmq7zojza000ugs3n5yr5tf1f
cmq7zokbd004egs3n6s1k468k	cmq7zojyu000sgs3n73p81l0z
cmq7zokbd004egs3n6s1k468k	cmq7zojz3000tgs3n8qd5ep42
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variants (id, "productId", name, sku, price, "comparePrice", stock, weight, "imageUrl", "isActive", "displayOrder", "createdAt", "updatedAt") FROM stdin;
cmq7zok0j0015gs3nq0efzd4x	cmq7zojzm000xgs3ngn4ayvuf	Natural Titanium / 256GB	APPL-IP15P-256-NT	1099.00	1199.00	45	\N	\N	t	0	2026-06-10 11:32:26.323	2026-06-10 11:32:26.323
cmq7zok110019gs3nsio0o370	cmq7zojzm000xgs3ngn4ayvuf	Black Titanium / 256GB	APPL-IP15P-256-BK	1099.00	1199.00	38	\N	\N	t	1	2026-06-10 11:32:26.341	2026-06-10 11:32:26.341
cmq7zok2d001lgs3nouexetbv	cmq7zok1w001fgs3nm1mykryk	16GB RAM / 512GB SSD	APPL-MBP14-M3-16GB	1999.00	2199.00	22	\N	\N	t	0	2026-06-10 11:32:26.389	2026-06-10 11:32:26.389
cmq7zok2r001ogs3nqx7iha3b	cmq7zok1w001fgs3nm1mykryk	32GB RAM / 1TB SSD	APPL-MBP14-M3-32GB	2399.00	2599.00	15	\N	\N	t	1	2026-06-10 11:32:26.403	2026-06-10 11:32:26.403
cmq7zok3y001ygs3no9zb9b5f	cmq7zok3g001tgs3n54h9jwsy	Black	SONY-WH1000XM5-BK	349.99	\N	67	\N	\N	t	0	2026-06-10 11:32:26.446	2026-06-10 11:32:26.446
cmq7zok4b0021gs3nca4r43br	cmq7zok3g001tgs3n54h9jwsy	Platinum Silver	SONY-WH1000XM5-SV	349.99	\N	42	\N	\N	t	1	2026-06-10 11:32:26.459	2026-06-10 11:32:26.459
cmq7zok5f002bgs3nwqognpvz	cmq7zok4y0026gs3n53wlk7w7	Titanium Gray / 512GB	SAMS-S24U-512-TGB	1299.00	\N	30	\N	\N	t	0	2026-06-10 11:32:26.499	2026-06-10 11:32:26.499
cmq7zok6h002ogs3nmf9g4jpc	cmq7zok5x002ggs3n1p4gnxzd	White / S	FASH-MENS-TEE-WH-S	29.99	39.99	27	\N	\N	t	0	2026-06-10 11:32:26.538	2026-06-10 11:32:26.538
cmq7zok6t002sgs3nmuhy4aai	cmq7zok5x002ggs3n1p4gnxzd	White / M	FASH-MENS-TEE-WH-M	29.99	39.99	37	\N	\N	t	1	2026-06-10 11:32:26.549	2026-06-10 11:32:26.549
cmq7zok73002wgs3n6m4mej5k	cmq7zok5x002ggs3n1p4gnxzd	White / L	FASH-MENS-TEE-WH-L	29.99	39.99	22	\N	\N	t	2	2026-06-10 11:32:26.56	2026-06-10 11:32:26.56
cmq7zok7f0030gs3ny50pi9xd	cmq7zok5x002ggs3n1p4gnxzd	White / XL	FASH-MENS-TEE-WH-XL	29.99	39.99	32	\N	\N	t	3	2026-06-10 11:32:26.571	2026-06-10 11:32:26.571
cmq7zok7q0034gs3n2tg138ty	cmq7zok5x002ggs3n1p4gnxzd	White / XXL	FASH-MENS-TEE-WH-XXL	29.99	39.99	14	\N	\N	t	4	2026-06-10 11:32:26.582	2026-06-10 11:32:26.582
cmq7zok800038gs3nkafhy5vn	cmq7zok5x002ggs3n1p4gnxzd	Black / S	FASH-MENS-TEE-BL-S	29.99	39.99	38	\N	\N	t	5	2026-06-10 11:32:26.592	2026-06-10 11:32:26.592
cmq7zok8c003cgs3ntfs7ro6s	cmq7zok5x002ggs3n1p4gnxzd	Black / M	FASH-MENS-TEE-BL-M	29.99	39.99	10	\N	\N	t	6	2026-06-10 11:32:26.605	2026-06-10 11:32:26.605
cmq7zok8n003ggs3n12mftxx7	cmq7zok5x002ggs3n1p4gnxzd	Black / L	FASH-MENS-TEE-BL-L	29.99	39.99	36	\N	\N	t	7	2026-06-10 11:32:26.615	2026-06-10 11:32:26.615
cmq7zok8x003kgs3nnddoy9im	cmq7zok5x002ggs3n1p4gnxzd	Black / XL	FASH-MENS-TEE-BL-XL	29.99	39.99	35	\N	\N	t	8	2026-06-10 11:32:26.625	2026-06-10 11:32:26.625
cmq7zok98003ogs3ne5b1lm40	cmq7zok5x002ggs3n1p4gnxzd	Black / XXL	FASH-MENS-TEE-BL-XXL	29.99	39.99	12	\N	\N	t	9	2026-06-10 11:32:26.636	2026-06-10 11:32:26.636
cmq7zok9j003sgs3n55tkcfje	cmq7zok5x002ggs3n1p4gnxzd	Navy / S	FASH-MENS-TEE-NA-S	29.99	39.99	29	\N	\N	t	10	2026-06-10 11:32:26.647	2026-06-10 11:32:26.647
cmq7zok9t003wgs3nm53i7c6z	cmq7zok5x002ggs3n1p4gnxzd	Navy / M	FASH-MENS-TEE-NA-M	29.99	39.99	15	\N	\N	t	11	2026-06-10 11:32:26.657	2026-06-10 11:32:26.657
cmq7zoka40040gs3nbd0j6q1t	cmq7zok5x002ggs3n1p4gnxzd	Navy / L	FASH-MENS-TEE-NA-L	29.99	39.99	19	\N	\N	t	12	2026-06-10 11:32:26.668	2026-06-10 11:32:26.668
cmq7zokaf0044gs3najr1lvy0	cmq7zok5x002ggs3n1p4gnxzd	Navy / XL	FASH-MENS-TEE-NA-XL	29.99	39.99	39	\N	\N	t	13	2026-06-10 11:32:26.679	2026-06-10 11:32:26.679
cmq7zokaq0048gs3nb8dqq05c	cmq7zok5x002ggs3n1p4gnxzd	Navy / XXL	FASH-MENS-TEE-NA-XXL	29.99	39.99	36	\N	\N	t	14	2026-06-10 11:32:26.691	2026-06-10 11:32:26.691
cmq7zokbx004jgs3nbggd04yb	cmq7zokbd004egs3n6s1k468k	XS	FASH-WMNS-DRESS-XS	59.99	79.99	18	\N	\N	t	0	2026-06-10 11:32:26.734	2026-06-10 11:32:26.734
cmq7zokca004mgs3n4gde9p20	cmq7zokbd004egs3n6s1k468k	S	FASH-WMNS-DRESS-S	59.99	79.99	12	\N	\N	t	1	2026-06-10 11:32:26.746	2026-06-10 11:32:26.746
cmq7zokcl004pgs3nn0o31v0f	cmq7zokbd004egs3n6s1k468k	M	FASH-WMNS-DRESS-M	59.99	79.99	15	\N	\N	t	2	2026-06-10 11:32:26.757	2026-06-10 11:32:26.757
cmq7zokcw004sgs3nctxi3dp2	cmq7zokbd004egs3n6s1k468k	L	FASH-WMNS-DRESS-L	59.99	79.99	8	\N	\N	t	3	2026-06-10 11:32:26.768	2026-06-10 11:32:26.768
cmq7zokd6004vgs3n1jdyblut	cmq7zokbd004egs3n6s1k468k	XL	FASH-WMNS-DRESS-XL	59.99	79.99	22	\N	\N	t	4	2026-06-10 11:32:26.778	2026-06-10 11:32:26.778
cmq7zoke30053gs3nl9bmiztw	cmq7zokdr0050gs3niugpete2	32GB RAM / 1TB SSD	DELL-XPS15-9530-32GB	1849.00	1999.00	18	\N	\N	t	0	2026-06-10 11:32:26.812	2026-06-10 11:32:26.812
cmq7zokev005cgs3n8oc0ihy7	cmq7zokef0057gs3n1b8noa42	Black	JBL-CHARGE5-BLACK	179.99	\N	55	\N	\N	t	0	2026-06-10 11:32:26.839	2026-06-10 11:32:26.839
cmq7zokf5005fgs3nyo69thtp	cmq7zokef0057gs3n1b8noa42	Blue	JBL-CHARGE5-BLUE	179.99	\N	40	\N	\N	t	1	2026-06-10 11:32:26.85	2026-06-10 11:32:26.85
cmq7zokfg005igs3naiwvy00c	cmq7zokef0057gs3n1b8noa42	Red	JBL-CHARGE5-RED	179.99	\N	28	\N	\N	t	2	2026-06-10 11:32:26.86	2026-06-10 11:32:26.86
cmq97bmw5000o9937z54xywml	cmq97bmv5000h9937o33snekq	Space Gray / 128GB / WiFi	APPL-IPADPRO-M2-128-SG	1099.00	1199.00	25	\N	\N	t	0	2026-06-11 07:54:06.629	2026-06-11 07:54:06.629
cmq97bmwp000s9937dom1bi1w	cmq97bmv5000h9937o33snekq	Space Gray / 256GB / WiFi	APPL-IPADPRO-M2-256-SG	1299.00	1399.00	18	\N	\N	t	1	2026-06-11 07:54:06.65	2026-06-11 07:54:06.65
cmq97bmx4000w9937bwwkn3cp	cmq97bmv5000h9937o33snekq	Silver / 128GB / WiFi+Cellular	APPL-IPADPRO-M2-128-SV-C	1299.00	1399.00	12	\N	\N	t	2	2026-06-11 07:54:06.664	2026-06-11 07:54:06.664
cmq97bmyc00199937o5gbm5eh	cmq97bmxt0012993740nombuc	Obsidian / 128GB	GOOG-PIX8PRO-128-OB	999.00	\N	28	\N	\N	t	0	2026-06-11 07:54:06.708	2026-06-11 07:54:06.708
cmq97bmyo001d9937mo7n0far	cmq97bmxt0012993740nombuc	Porcelain / 256GB	GOOG-PIX8PRO-256-PO	1099.00	\N	20	\N	\N	t	1	2026-06-11 07:54:06.72	2026-06-11 07:54:06.72
cmq97bmzj001o9937kkgeiynz	cmq97bmz5001j9937mm6mwic3	White	APPL-APP-2GEN-WH	249.00	\N	80	\N	\N	t	0	2026-06-11 07:54:06.751	2026-06-11 07:54:06.751
cmq97bn0e002099378fy2wuyh	cmq97bmzy001t9937vbe5iarj	Eclipse Gray / 32GB / 1TB	ASUS-ROG-G14-32-1T	1799.00	\N	15	\N	\N	t	0	2026-06-11 07:54:06.782	2026-06-11 07:54:06.782
cmq97bn1e002b9937ceeihjvd	cmq97bn0x002699377trcggcu	6 Quart	INST-DUO-6QT	79.99	99.99	120	\N	\N	t	0	2026-06-11 07:54:06.818	2026-06-11 07:54:06.818
cmq97bn1m002e99377xums5p3	cmq97bn0x002699377trcggcu	8 Quart	INST-DUO-8QT	99.99	119.99	75	\N	\N	t	1	2026-06-11 07:54:06.826	2026-06-11 07:54:06.826
cmq97bn2j002o9937piyvntiq	cmq97bn23002j9937xe78lg6a	Nickel/Yellow	DYSO-V15-NY	699.99	\N	35	\N	\N	t	0	2026-06-11 07:54:06.859	2026-06-11 07:54:06.859
cmq97bn3c002y9937unghn8dn	cmq97bn2y002t9937i45b6jjj	Small (5-7 lbs)	DECOR-SALT-SM	29.99	\N	150	\N	\N	t	0	2026-06-11 07:54:06.889	2026-06-11 07:54:06.889
cmq97bn3n003199378zysni3l	cmq97bn2y002t9937i45b6jjj	Large (9-11 lbs)	DECOR-SALT-LG	44.99	\N	90	\N	\N	t	1	2026-06-11 07:54:06.899	2026-06-11 07:54:06.899
cmq97bn4j003b9937vjy1v68h	cmq97bn430036993795wekpfa	Black	FURN-CHAIR-ERG-BK	249.99	\N	40	\N	\N	t	0	2026-06-11 07:54:06.931	2026-06-11 07:54:06.931
cmq97bn4v003e9937pzqpw0fr	cmq97bn430036993795wekpfa	Gray	FURN-CHAIR-ERG-GR	249.99	\N	25	\N	\N	t	1	2026-06-11 07:54:06.943	2026-06-11 07:54:06.943
cmq97bn5v003o9937jvcckmqr	cmq97bn5e003j9937ozducyyc	Assorted (3-pack)	DECOR-CANDLE-3PK-V1	39.99	\N	200	\N	\N	t	0	2026-06-11 07:54:06.979	2026-06-11 07:54:06.979
cmq97bn6t003y9937ngxdqm94	cmq97bn6e003t9937ffiqndg0	Pair (5–52.5 lbs)	BWFL-ST552-PAIR-V1	429.00	499.00	45	\N	\N	t	0	2026-06-11 07:54:07.013	2026-06-11 07:54:07.013
cmq97bn7r00489937w6r5n05g	cmq97bn7b004399377cyltbao	Purple	YOGA-MAT-6MM-PU	34.99	\N	200	\N	\N	t	0	2026-06-11 07:54:07.047	2026-06-11 07:54:07.047
cmq97bn81004b9937j991s3kx	cmq97bn7b004399377cyltbao	Blue	YOGA-MAT-6MM-BL	34.99	\N	185	\N	\N	t	1	2026-06-11 07:54:07.058	2026-06-11 07:54:07.058
cmq97bn8d004e99372ik24v2f	cmq97bn7b004399377cyltbao	Black	YOGA-MAT-6MM-BK	34.99	\N	220	\N	\N	t	2	2026-06-11 07:54:07.069	2026-06-11 07:54:07.069
cmq97bn9b004q9937mv2sn17z	cmq97bn8s004j99376unuwn4o	Abyss Grey / Small/Medium	OSPR-ATMOS-65-AG-SM	289.95	\N	30	\N	\N	t	0	2026-06-11 07:54:07.103	2026-06-11 07:54:07.103
cmq97bn9q004u9937pvgaz3fq	cmq97bn8s004j99376unuwn4o	Abyss Grey / Medium/Large	OSPR-ATMOS-65-AG-ML	289.95	\N	28	\N	\N	t	1	2026-06-11 07:54:07.118	2026-06-11 07:54:07.118
cmq97bna5004y9937nn02hwfy	cmq97bn8s004j99376unuwn4o	Rigby Red / S/M	OSPR-ATMOS-65-RR-SM	289.95	\N	22	\N	\N	t	2	2026-06-11 07:54:07.133	2026-06-11 07:54:07.133
cmq97bnb8005b9937vih52ovn	cmq97bnaq0054993743zvjxk2	Black / S	NIKE-DRI-SHORTS-M-BL-S	40.00	50.00	34	\N	\N	t	0	2026-06-11 07:54:07.173	2026-06-11 07:54:07.173
cmq97bnbm005f9937evhno12d	cmq97bnaq0054993743zvjxk2	Black / M	NIKE-DRI-SHORTS-M-BL-M	40.00	50.00	58	\N	\N	t	1	2026-06-11 07:54:07.186	2026-06-11 07:54:07.186
cmq97bnc0005j9937ezzu6bxm	cmq97bnaq0054993743zvjxk2	Black / L	NIKE-DRI-SHORTS-M-BL-L	40.00	50.00	51	\N	\N	t	2	2026-06-11 07:54:07.2	2026-06-11 07:54:07.2
cmq97bncd005n9937na9stxhu	cmq97bnaq0054993743zvjxk2	Black / XL	NIKE-DRI-SHORTS-M-BL-XL	40.00	50.00	34	\N	\N	t	3	2026-06-11 07:54:07.214	2026-06-11 07:54:07.214
cmq97bncs005r9937wuzpmonq	cmq97bnaq0054993743zvjxk2	Navy / S	NIKE-DRI-SHORTS-M-NA-S	40.00	50.00	46	\N	\N	t	4	2026-06-11 07:54:07.228	2026-06-11 07:54:07.228
cmq97bnd5005v9937o2gebv2g	cmq97bnaq0054993743zvjxk2	Navy / M	NIKE-DRI-SHORTS-M-NA-M	40.00	50.00	33	\N	\N	t	5	2026-06-11 07:54:07.241	2026-06-11 07:54:07.241
cmq97bndj005z9937yyb6e85m	cmq97bnaq0054993743zvjxk2	Navy / L	NIKE-DRI-SHORTS-M-NA-L	40.00	50.00	43	\N	\N	t	6	2026-06-11 07:54:07.255	2026-06-11 07:54:07.255
cmq97bndx00639937hvney3jp	cmq97bnaq0054993743zvjxk2	Navy / XL	NIKE-DRI-SHORTS-M-NA-XL	40.00	50.00	57	\N	\N	t	7	2026-06-11 07:54:07.269	2026-06-11 07:54:07.269
cmq97bnec006799379p11aw2i	cmq97bnaq0054993743zvjxk2	Gray / S	NIKE-DRI-SHORTS-M-GR-S	40.00	50.00	53	\N	\N	t	8	2026-06-11 07:54:07.284	2026-06-11 07:54:07.284
cmq97bner006b993757e3pltf	cmq97bnaq0054993743zvjxk2	Gray / M	NIKE-DRI-SHORTS-M-GR-M	40.00	50.00	34	\N	\N	t	9	2026-06-11 07:54:07.299	2026-06-11 07:54:07.299
cmq97bnf3006f9937imbl47k6	cmq97bnaq0054993743zvjxk2	Gray / L	NIKE-DRI-SHORTS-M-GR-L	40.00	50.00	52	\N	\N	t	10	2026-06-11 07:54:07.311	2026-06-11 07:54:07.311
cmq97bnfg006j99373xptwlm6	cmq97bnaq0054993743zvjxk2	Gray / XL	NIKE-DRI-SHORTS-M-GR-XL	40.00	50.00	29	\N	\N	t	11	2026-06-11 07:54:07.324	2026-06-11 07:54:07.324
cmq97bngl006w99379tb9w7fw	cmq97bng2006p9937qmwi6e2z	Black / XS	YOGA-LEGGINGS-W-BLA-XS	49.99	69.99	40	\N	\N	t	0	2026-06-11 07:54:07.365	2026-06-11 07:54:07.365
cmq97bngy007099377jui9ck8	cmq97bng2006p9937qmwi6e2z	Black / S	YOGA-LEGGINGS-W-BLA-S	49.99	69.99	22	\N	\N	t	1	2026-06-11 07:54:07.378	2026-06-11 07:54:07.378
cmq97bnhb007499372d34xssp	cmq97bng2006p9937qmwi6e2z	Black / M	YOGA-LEGGINGS-W-BLA-M	49.99	69.99	43	\N	\N	t	2	2026-06-11 07:54:07.391	2026-06-11 07:54:07.391
cmq97bnhq0078993700tq5sum	cmq97bng2006p9937qmwi6e2z	Black / L	YOGA-LEGGINGS-W-BLA-L	49.99	69.99	32	\N	\N	t	3	2026-06-11 07:54:07.406	2026-06-11 07:54:07.406
cmq97bni3007c99372ipa9kn2	cmq97bng2006p9937qmwi6e2z	Black / XL	YOGA-LEGGINGS-W-BLA-XL	49.99	69.99	42	\N	\N	t	4	2026-06-11 07:54:07.419	2026-06-11 07:54:07.419
cmq97bnih007g9937sdw5spc9	cmq97bng2006p9937qmwi6e2z	Midnight Blue / XS	YOGA-LEGGINGS-W-MID-XS	49.99	69.99	35	\N	\N	t	5	2026-06-11 07:54:07.433	2026-06-11 07:54:07.433
cmq97bniv007k9937htzrv07s	cmq97bng2006p9937qmwi6e2z	Midnight Blue / S	YOGA-LEGGINGS-W-MID-S	49.99	69.99	49	\N	\N	t	6	2026-06-11 07:54:07.447	2026-06-11 07:54:07.447
cmq97bnj8007o9937netyhflm	cmq97bng2006p9937qmwi6e2z	Midnight Blue / M	YOGA-LEGGINGS-W-MID-M	49.99	69.99	41	\N	\N	t	7	2026-06-11 07:54:07.46	2026-06-11 07:54:07.46
cmq97bnjl007s9937mgb6et0c	cmq97bng2006p9937qmwi6e2z	Midnight Blue / L	YOGA-LEGGINGS-W-MID-L	49.99	69.99	36	\N	\N	t	8	2026-06-11 07:54:07.473	2026-06-11 07:54:07.473
cmq97bnjz007w99377mjpcomx	cmq97bng2006p9937qmwi6e2z	Midnight Blue / XL	YOGA-LEGGINGS-W-MID-XL	49.99	69.99	28	\N	\N	t	9	2026-06-11 07:54:07.487	2026-06-11 07:54:07.487
cmq97bnkd00809937104c40tt	cmq97bng2006p9937qmwi6e2z	Dusty Rose / XS	YOGA-LEGGINGS-W-DUS-XS	49.99	69.99	41	\N	\N	t	10	2026-06-11 07:54:07.501	2026-06-11 07:54:07.501
cmq97bnks008499376ovh49tv	cmq97bng2006p9937qmwi6e2z	Dusty Rose / S	YOGA-LEGGINGS-W-DUS-S	49.99	69.99	43	\N	\N	t	11	2026-06-11 07:54:07.516	2026-06-11 07:54:07.516
cmq97bnl600889937sf9i09rm	cmq97bng2006p9937qmwi6e2z	Dusty Rose / M	YOGA-LEGGINGS-W-DUS-M	49.99	69.99	21	\N	\N	t	12	2026-06-11 07:54:07.53	2026-06-11 07:54:07.53
cmq97bnlk008c99377nvsix25	cmq97bng2006p9937qmwi6e2z	Dusty Rose / L	YOGA-LEGGINGS-W-DUS-L	49.99	69.99	34	\N	\N	t	13	2026-06-11 07:54:07.544	2026-06-11 07:54:07.544
cmq97bnlx008g9937f5lfe1yb	cmq97bng2006p9937qmwi6e2z	Dusty Rose / XL	YOGA-LEGGINGS-W-DUS-XL	49.99	69.99	39	\N	\N	t	14	2026-06-11 07:54:07.557	2026-06-11 07:54:07.557
cmq97bnmu008t9937thj384c9	cmq97bnmd008m9937h8ixtofx	Khaki / 30x30	FASH-MENS-CHINO-KH-3030	54.99	74.99	17	\N	\N	t	0	2026-06-11 07:54:07.59	2026-06-11 07:54:07.59
cmq97bnn7008x9937lqdzrkk9	cmq97bnmd008m9937h8ixtofx	Khaki / 32x30	FASH-MENS-CHINO-KH-3230	54.99	74.99	12	\N	\N	t	1	2026-06-11 07:54:07.603	2026-06-11 07:54:07.603
cmq97bnnj00919937pxguw60m	cmq97bnmd008m9937h8ixtofx	Khaki / 32x32	FASH-MENS-CHINO-KH-3232	54.99	74.99	29	\N	\N	t	2	2026-06-11 07:54:07.615	2026-06-11 07:54:07.615
cmq97bnnv0095993765er7ajd	cmq97bnmd008m9937h8ixtofx	Khaki / 34x32	FASH-MENS-CHINO-KH-3432	54.99	74.99	29	\N	\N	t	3	2026-06-11 07:54:07.628	2026-06-11 07:54:07.628
cmq97bno800999937y3bhtd7k	cmq97bnmd008m9937h8ixtofx	Khaki / 36x32	FASH-MENS-CHINO-KH-3632	54.99	74.99	28	\N	\N	t	4	2026-06-11 07:54:07.64	2026-06-11 07:54:07.64
cmq97bnol009d9937hbyl0uhy	cmq97bnmd008m9937h8ixtofx	Navy / 30x30	FASH-MENS-CHINO-NA-3030	54.99	74.99	11	\N	\N	t	5	2026-06-11 07:54:07.653	2026-06-11 07:54:07.653
cmq97bnp0009h9937czt3nh82	cmq97bnmd008m9937h8ixtofx	Navy / 32x30	FASH-MENS-CHINO-NA-3230	54.99	74.99	7	\N	\N	t	6	2026-06-11 07:54:07.669	2026-06-11 07:54:07.669
cmq97bnpf009l9937wz6j1p0m	cmq97bnmd008m9937h8ixtofx	Navy / 32x32	FASH-MENS-CHINO-NA-3232	54.99	74.99	29	\N	\N	t	7	2026-06-11 07:54:07.683	2026-06-11 07:54:07.683
cmq97bnpr009p99375oiwbp3d	cmq97bnmd008m9937h8ixtofx	Navy / 34x32	FASH-MENS-CHINO-NA-3432	54.99	74.99	28	\N	\N	t	8	2026-06-11 07:54:07.695	2026-06-11 07:54:07.695
cmq97bnq1009t9937nvr0me3q	cmq97bnmd008m9937h8ixtofx	Navy / 36x32	FASH-MENS-CHINO-NA-3632	54.99	74.99	25	\N	\N	t	9	2026-06-11 07:54:07.706	2026-06-11 07:54:07.706
cmq97bnqe009x99377epmhylu	cmq97bnmd008m9937h8ixtofx	Olive / 30x30	FASH-MENS-CHINO-OL-3030	54.99	74.99	16	\N	\N	t	10	2026-06-11 07:54:07.718	2026-06-11 07:54:07.718
cmq97bnqp00a19937osbudagy	cmq97bnmd008m9937h8ixtofx	Olive / 32x30	FASH-MENS-CHINO-OL-3230	54.99	74.99	18	\N	\N	t	11	2026-06-11 07:54:07.729	2026-06-11 07:54:07.729
cmq97bnr100a59937jozt26pw	cmq97bnmd008m9937h8ixtofx	Olive / 32x32	FASH-MENS-CHINO-OL-3232	54.99	74.99	16	\N	\N	t	12	2026-06-11 07:54:07.741	2026-06-11 07:54:07.741
cmq97bnrf00a99937y5lb66in	cmq97bnmd008m9937h8ixtofx	Olive / 34x32	FASH-MENS-CHINO-OL-3432	54.99	74.99	8	\N	\N	t	13	2026-06-11 07:54:07.755	2026-06-11 07:54:07.755
cmq97bnrs00ad9937961ihixe	cmq97bnmd008m9937h8ixtofx	Olive / 36x32	FASH-MENS-CHINO-OL-3632	54.99	74.99	26	\N	\N	t	14	2026-06-11 07:54:07.768	2026-06-11 07:54:07.768
cmq97bnst00aq9937car5qqj8	cmq97bnsc00aj9937erw15una	Cream / XS/S	FASH-WMNS-SWTR-CRE-XS_S	69.99	89.99	35	\N	\N	t	0	2026-06-11 07:54:07.805	2026-06-11 07:54:07.805
cmq97bnt600au9937dbfuy3zl	cmq97bnsc00aj9937erw15una	Cream / M/L	FASH-WMNS-SWTR-CRE-M_L	69.99	89.99	27	\N	\N	t	1	2026-06-11 07:54:07.819	2026-06-11 07:54:07.819
cmq97bntj00ay99372vrogh6r	cmq97bnsc00aj9937erw15una	Cream / XL/XXL	FASH-WMNS-SWTR-CRE-XL_XXL	69.99	89.99	27	\N	\N	t	2	2026-06-11 07:54:07.831	2026-06-11 07:54:07.831
cmq97bntu00b299379vm1aca5	cmq97bnsc00aj9937erw15una	Dusty Pink / XS/S	FASH-WMNS-SWTR-DUS-XS_S	69.99	89.99	38	\N	\N	t	3	2026-06-11 07:54:07.842	2026-06-11 07:54:07.842
cmq97bnu600b699379njjpnfw	cmq97bnsc00aj9937erw15una	Dusty Pink / M/L	FASH-WMNS-SWTR-DUS-M_L	69.99	89.99	17	\N	\N	t	4	2026-06-11 07:54:07.855	2026-06-11 07:54:07.855
cmq97bnui00ba993754xpsqyq	cmq97bnsc00aj9937erw15una	Dusty Pink / XL/XXL	FASH-WMNS-SWTR-DUS-XL_XXL	69.99	89.99	24	\N	\N	t	5	2026-06-11 07:54:07.866	2026-06-11 07:54:07.866
cmq97bnuv00be99377j4xas44	cmq97bnsc00aj9937erw15una	Sage Green / XS/S	FASH-WMNS-SWTR-SAG-XS_S	69.99	89.99	15	\N	\N	t	6	2026-06-11 07:54:07.879	2026-06-11 07:54:07.879
cmq97bnv800bi9937lq4v3vod	cmq97bnsc00aj9937erw15una	Sage Green / M/L	FASH-WMNS-SWTR-SAG-M_L	69.99	89.99	16	\N	\N	t	7	2026-06-11 07:54:07.892	2026-06-11 07:54:07.892
cmq97bnvm00bm9937zv2m7oq9	cmq97bnsc00aj9937erw15una	Sage Green / XL/XXL	FASH-WMNS-SWTR-SAG-XL_XXL	69.99	89.99	36	\N	\N	t	8	2026-06-11 07:54:07.906	2026-06-11 07:54:07.906
cmq97bnw000bq9937oylcd88d	cmq97bnsc00aj9937erw15una	Caramel / XS/S	FASH-WMNS-SWTR-CAR-XS_S	69.99	89.99	39	\N	\N	t	9	2026-06-11 07:54:07.921	2026-06-11 07:54:07.921
cmq97bnwe00bu9937djzfutze	cmq97bnsc00aj9937erw15una	Caramel / M/L	FASH-WMNS-SWTR-CAR-M_L	69.99	89.99	31	\N	\N	t	10	2026-06-11 07:54:07.934	2026-06-11 07:54:07.934
cmq97bnwr00by9937gvl8njhn	cmq97bnsc00aj9937erw15una	Caramel / XL/XXL	FASH-WMNS-SWTR-CAR-XL_XXL	69.99	89.99	16	\N	\N	t	11	2026-06-11 07:54:07.947	2026-06-11 07:54:07.947
cmq97bnxq00c999376g76p5am	cmq97bnxa00c49937xs3y31ct	Tan	FASH-TOTE-LTHR-TN	149.99	\N	35	\N	\N	t	0	2026-06-11 07:54:07.982	2026-06-11 07:54:07.982
cmq97bnxy00cc99378z37ejsv	cmq97bnxa00c49937xs3y31ct	Black	FASH-TOTE-LTHR-BK	149.99	\N	40	\N	\N	t	1	2026-06-11 07:54:07.991	2026-06-11 07:54:07.991
cmq97bny900cf9937d0tfrmjf	cmq97bnxa00c49937xs3y31ct	Cognac	FASH-TOTE-LTHR-CG	149.99	\N	28	\N	\N	t	2	2026-06-11 07:54:08.001	2026-06-11 07:54:08.001
cmq97bnz900cr9937g169agh7	cmq97bnyr00ck99378qjonzwt	Silver / Black Leather	FASH-WATCH-SV-BK	119.00	\N	45	\N	\N	t	0	2026-06-11 07:54:08.037	2026-06-11 07:54:08.037
cmq97bnzo00cv9937djipy78r	cmq97bnyr00ck99378qjonzwt	Gold / Brown Leather	FASH-WATCH-GD-BR	129.00	\N	38	\N	\N	t	1	2026-06-11 07:54:08.052	2026-06-11 07:54:08.052
cmq97bo0000cz9937tue90t8c	cmq97bnyr00ck99378qjonzwt	Rose Gold / Blush Leather	FASH-WATCH-RG-BL	129.00	\N	30	\N	\N	t	2	2026-06-11 07:54:08.064	2026-06-11 07:54:08.064
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, "vendorId", "storeId", "categoryId", name, slug, description, "shortDescription", sku, price, "comparePrice", "costPrice", weight, width, height, depth, status, "isDigital", "isFeatured", "requiresShipping", "averageRating", "totalReviews", "totalSold", "viewCount", "metaTitle", "metaDescription", "rejectionReason", "publishedAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cmq7zojzm000xgs3ngn4ayvuf	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojxs000jgs3nagks6u7d	iPhone 15 Pro 256GB	iphone-15-pro-256gb	The iPhone 15 Pro features the A17 Pro chip, a titanium design, and a customizable Action button. The 48MP Main camera shoots in 4K 120 fps Dolby Vision.	Apple iPhone 15 Pro with A17 Pro chip and titanium design.	APPL-IP15P-256	1099.00	1199.00	850.00	0.187	\N	\N	\N	ACTIVE	f	t	t	4.80	245	89	0	\N	\N	\N	2026-06-10 11:32:26.289	2026-06-10 11:32:26.29	2026-06-10 11:32:26.29	\N
cmq7zok1w001fgs3nm1mykryk	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojy0000lgs3n0mhj15gi	MacBook Pro 14" M3	macbook-pro-14-m3	MacBook Pro with the powerful M3 chip. Up to 22 hours of battery life. Liquid Retina XDR display.	Apple MacBook Pro 14-inch with M3 chip.	APPL-MBP14-M3	1999.00	2199.00	1600.00	1.550	\N	\N	\N	ACTIVE	f	t	t	4.90	178	56	0	\N	\N	\N	2026-06-10 11:32:26.37	2026-06-10 11:32:26.372	2026-06-10 11:32:26.372	\N
cmq7zok3g001tgs3n54h9jwsy	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojy7000ngs3n60ptkapj	Sony WH-1000XM5 Wireless Headphones	sony-wh1000xm5-headphones	Industry-leading noise cancellation with two processors and eight microphones. Up to 30 hours of battery life. Multi-device pairing.	Sony WH-1000XM5 — best-in-class noise cancellation.	SONY-WH1000XM5	349.99	399.99	220.00	0.250	\N	\N	\N	ACTIVE	f	t	t	4.70	512	203	0	\N	\N	\N	2026-06-10 11:32:26.427	2026-06-10 11:32:26.428	2026-06-10 11:32:26.428	\N
cmq7zok4y0026gs3n53wlk7w7	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojxs000jgs3nagks6u7d	Samsung Galaxy S24 Ultra 512GB	samsung-galaxy-s24-ultra	Galaxy AI is here. Galaxy S24 Ultra with embedded S Pen, 200MP camera, and titanium frame.	Samsung Galaxy S24 Ultra with Galaxy AI and embedded S Pen.	SAMS-S24U-512	1299.00	1399.00	950.00	0.232	\N	\N	\N	ACTIVE	f	f	t	4.60	189	67	0	\N	\N	\N	2026-06-10 11:32:26.48	2026-06-10 11:32:26.482	2026-06-10 11:32:26.482	\N
cmq7zok5x002ggs3n1p4gnxzd	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq7zojyf000pgs3na4c8rhn8	Men's Classic Cotton T-Shirt	mens-classic-cotton-tshirt	100% premium cotton crew-neck t-shirt. Pre-shrunk fabric, comfortable fit, available in multiple colors and sizes.	Premium cotton crew-neck tee — timeless and comfortable.	FASH-MENS-TEE-001	29.99	39.99	12.00	0.200	\N	\N	\N	ACTIVE	f	f	t	4.30	328	412	0	\N	\N	\N	2026-06-10 11:32:26.516	2026-06-10 11:32:26.517	2026-06-10 11:32:26.517	\N
cmq7zokbd004egs3n6s1k468k	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq7zojyn000rgs3nkscht6ca	Women's Floral Summer Dress	womens-floral-summer-dress	Lightweight and breezy floral midi dress. Perfect for summer occasions. V-neck silhouette with adjustable waist tie.	Elegant floral midi dress for summer.	FASH-WMNS-DRESS-001	59.99	79.99	25.00	0.350	\N	\N	\N	ACTIVE	f	t	t	4.50	156	198	0	\N	\N	\N	2026-06-10 11:32:26.711	2026-06-10 11:32:26.713	2026-06-10 11:32:26.713	\N
cmq7zokdr0050gs3niugpete2	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojy0000lgs3n0mhj15gi	Dell XPS 15 (9530)	dell-xps-15-9530	Dell XPS 15 with 13th Gen Intel Core i7, 32GB RAM, NVIDIA RTX 4070, 3.5K OLED display.	Dell XPS 15 — premium performance laptop with OLED display.	DELL-XPS15-9530	1849.00	1999.00	1400.00	1.860	\N	\N	\N	ACTIVE	f	f	t	4.50	94	31	0	\N	\N	\N	2026-06-10 11:32:26.797	2026-06-10 11:32:26.799	2026-06-10 11:32:26.799	\N
cmq7zokef0057gs3n1b8noa42	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojy7000ngs3n60ptkapj	JBL Charge 5 Bluetooth Speaker	jbl-charge-5-bluetooth-speaker	JBL Pro Sound. Massive power bank. IP67 waterproof. 20 hours of playtime. Connect+ compatible with 100+ JBL speakers.	JBL Charge 5 — waterproof portable speaker with power bank.	JBL-CHARGE5	179.99	199.99	100.00	0.960	\N	\N	\N	ACTIVE	f	f	t	4.60	287	154	0	\N	\N	\N	2026-06-10 11:32:26.822	2026-06-10 11:32:26.823	2026-06-10 11:32:26.823	\N
cmq97bmv5000h9937o33snekq	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq97bmus000d9937k64p07pj	iPad Pro 12.9" M2	ipad-pro-12-9-m2	iPad Pro with the powerful M2 chip, 12.9-inch Liquid Retina XDR display, and Apple Pencil support.	Apple iPad Pro 12.9" with M2 chip and Liquid Retina XDR.	APPL-IPADPRO-M2	1099.00	1199.00	820.00	0.682	\N	\N	\N	ACTIVE	f	t	t	4.80	134	47	0	\N	\N	\N	2026-06-11 07:54:06.591	2026-06-11 07:54:06.593	2026-06-11 07:54:06.593	\N
cmq97bmxt0012993740nombuc	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojxs000jgs3nagks6u7d	Google Pixel 8 Pro	google-pixel-8-pro	Google Pixel 8 Pro with Tensor G3 chip, 50MP camera triple system, and 7 years of OS updates.	Google Pixel 8 Pro — the most helpful phone ever.	GOOG-PIX8PRO	999.00	1099.00	720.00	0.213	\N	\N	\N	ACTIVE	f	f	t	4.50	89	34	0	\N	\N	\N	2026-06-11 07:54:06.688	2026-06-11 07:54:06.689	2026-06-11 07:54:06.689	\N
cmq97bmz5001j9937mm6mwic3	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojy7000ngs3n60ptkapj	Apple AirPods Pro (2nd Gen)	apple-airpods-pro-2nd-gen	AirPods Pro 2nd generation with Adaptive Transparency, Personalized Spatial Audio, and up to 30 hours total battery life.	AirPods Pro with next-level Active Noise Cancellation.	APPL-APP-2GEN	249.00	279.00	160.00	0.050	\N	\N	\N	ACTIVE	f	t	t	4.70	428	215	0	\N	\N	\N	2026-06-11 07:54:06.736	2026-06-11 07:54:06.737	2026-06-11 07:54:06.737	\N
cmq97bmzy001t9937vbe5iarj	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq7zojy0000lgs3n0mhj15gi	ASUS ROG Zephyrus G14 (2024)	asus-rog-zephyrus-g14-2024	ASUS ROG Zephyrus G14 gaming laptop with AMD Ryzen 9 8945HS, RX 7900S, 2.5K 165Hz OLED display, 32GB RAM.	Compact gaming powerhouse with AMD Ryzen 9 and OLED display.	ASUS-ROG-G14-24	1799.00	1999.00	1350.00	1.650	\N	\N	\N	ACTIVE	f	f	t	4.60	67	24	0	\N	\N	\N	2026-06-11 07:54:06.765	2026-06-11 07:54:06.766	2026-06-11 07:54:06.766	\N
cmq97bn0x002699377trcggcu	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq97bmtx00039937ng7rra5h	Instant Pot Duo 7-in-1 Electric Pressure Cooker	instant-pot-duo-7-in-1	The most-loved multi-cooker. 7 appliances in 1: Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté Pan, Yogurt Maker & Warmer. 6-quart capacity.	7-in-1 multi-cooker — pressure cook, slow cook, sauté and more.	INST-DUO-7IN1-6QT	79.99	99.99	42.00	5.000	\N	\N	\N	ACTIVE	f	t	t	4.70	892	634	0	\N	\N	\N	2026-06-11 07:54:06.8	2026-06-11 07:54:06.801	2026-06-11 07:54:06.801	\N
cmq97bn23002j9937xe78lg6a	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq97bmtx00039937ng7rra5h	Dyson V15 Detect Cordless Vacuum	dyson-v15-detect-cordless	The most powerful Dyson cordless vacuum with laser dust detection, LCD screen displaying scientifically proven results, and 60 minutes of run time.	Dyson V15 — laser dust detection & 60 min runtime.	DYSO-V15-DETECT	699.99	749.99	480.00	3.100	\N	\N	\N	ACTIVE	f	t	t	4.60	341	128	0	\N	\N	\N	2026-06-11 07:54:06.842	2026-06-11 07:54:06.843	2026-06-11 07:54:06.843	\N
cmq97bn2y002t9937i45b6jjj	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq97bmu4000599370jie8me2	Himalayan Salt Lamp with Dimmer	himalayan-salt-lamp-dimmer	Natural pink Himalayan salt lamp with adjustable brightness dimmer switch. Creates a warm amber glow. Perfect for relaxation and ambient lighting.	Natural Himalayan salt lamp with dimmer — warm ambient glow.	DECOR-SALT-LAMP	29.99	44.99	12.00	2.500	\N	\N	\N	ACTIVE	f	f	t	4.40	567	389	0	\N	\N	\N	2026-06-11 07:54:06.873	2026-06-11 07:54:06.874	2026-06-11 07:54:06.874	\N
cmq97bn430036993795wekpfa	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq97bmtf00019937j2dn7lsn	Ergonomic Mesh Office Chair	ergonomic-mesh-office-chair	Premium ergonomic mesh office chair with lumbar support, adjustable armrests, headrest, and seat height. Designed for long work sessions.	Ergonomic mesh chair with lumbar support — work in comfort.	FURN-CHAIR-ERG	249.99	349.99	150.00	18.000	\N	\N	\N	ACTIVE	f	t	t	4.50	234	167	0	\N	\N	\N	2026-06-11 07:54:06.914	2026-06-11 07:54:06.915	2026-06-11 07:54:06.915	\N
cmq97bn5e003j9937ozducyyc	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq97bmu4000599370jie8me2	Scented Soy Candle Set (3-Pack)	scented-soy-candle-set	Handcrafted soy wax candles with premium fragrance oils. Set of 3: Vanilla & Sandalwood, Eucalyptus & Mint, Lavender & Rose. 45 hours burn time each.	Handcrafted soy wax candle set — 3 premium fragrances.	DECOR-CANDLE-3PK	39.99	54.99	16.00	0.900	\N	\N	\N	ACTIVE	f	f	t	4.80	412	298	0	\N	\N	\N	2026-06-11 07:54:06.961	2026-06-11 07:54:06.963	2026-06-11 07:54:06.963	\N
cmq97bn6e003t9937ffiqndg0	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq97bmub00079937imj84402	Bowflex SelectTech 552 Adjustable Dumbbells (Pair)	bowflex-selecttech-552-dumbbells	Replace 15 sets of weights. Adjusts from 5 to 52.5 lbs in 2.5 lb increments. Innovative dial system. Includes stand.	Bowflex adjustable dumbbells — 5 to 52.5 lbs, replaces 15 sets.	BWFL-ST552-PAIR	429.00	499.00	280.00	24.000	\N	\N	\N	ACTIVE	f	t	t	4.80	1204	543	0	\N	\N	\N	2026-06-11 07:54:06.997	2026-06-11 07:54:06.998	2026-06-11 07:54:06.998	\N
cmq97bn7b004399377cyltbao	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq97bmub00079937imj84402	Yoga Mat Premium Non-Slip 6mm	yoga-mat-premium-6mm	Extra thick 6mm non-slip yoga mat with alignment lines. Made from eco-friendly TPE. Includes carry strap. 183cm × 61cm.	Premium 6mm non-slip yoga mat with alignment guides.	YOGA-MAT-6MM	34.99	49.99	14.00	1.200	\N	\N	\N	ACTIVE	f	f	t	4.50	678	892	0	\N	\N	\N	2026-06-11 07:54:07.03	2026-06-11 07:54:07.031	2026-06-11 07:54:07.031	\N
cmq97bn8s004j99376unuwn4o	cmq7zojvw0007gs3nyfw7djh7	cmq7zojwe000bgs3n0h0o7g85	cmq97bmuh00099937wxpv2krg	Osprey Atmos AG 65 Backpack	osprey-atmos-ag-65-backpack	Award-winning Osprey Atmos AG 65L hiking backpack with Anti-Gravity suspension, adjustable torso fit, and StraightJacket compression straps.	Osprey Atmos AG 65L — the most comfortable hiking pack.	OSPR-ATMOS-65	289.95	319.95	190.00	2.180	\N	\N	\N	ACTIVE	f	t	t	4.90	445	187	0	\N	\N	\N	2026-06-11 07:54:07.083	2026-06-11 07:54:07.084	2026-06-11 07:54:07.084	\N
cmq97bnaq0054993743zvjxk2	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq97bmum000b9937kx7iusfp	Nike Dri-FIT Men's Training Shorts	nike-dri-fit-mens-training-shorts	Nike Dri-FIT technology moves sweat away from your skin. 7-inch inseam. Side pockets and back zip pocket. Lightweight and breathable fabric.	Nike Dri-FIT training shorts — light, breathable, fast-drying.	NIKE-DRI-SHORTS-M	40.00	50.00	18.00	0.220	\N	\N	\N	ACTIVE	f	f	t	4.40	389	512	0	\N	\N	\N	2026-06-11 07:54:07.153	2026-06-11 07:54:07.154	2026-06-11 07:54:07.154	\N
cmq97bng2006p9937qmwi6e2z	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq97bmum000b9937kx7iusfp	Women's High-Waist Yoga Leggings	womens-high-waist-yoga-leggings	Ultra-soft 4-way stretch yoga leggings with high waistband, side pockets, and squat-proof fabric. 88% polyester, 12% spandex.	High-waist yoga leggings — squat-proof, soft, and supportive.	YOGA-LEGGINGS-W	49.99	69.99	20.00	0.280	\N	\N	\N	ACTIVE	f	f	t	4.60	723	891	0	\N	\N	\N	2026-06-11 07:54:07.345	2026-06-11 07:54:07.346	2026-06-11 07:54:07.346	\N
cmq97bnmd008m9937h8ixtofx	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq7zojyf000pgs3na4c8rhn8	Men's Slim Fit Chino Pants	mens-slim-fit-chino-pants	Slim fit chino trousers crafted from stretch cotton blend. Perfect for smart-casual occasions. Features 5-pocket design and button closure.	Slim fit chinos in stretch cotton — smart-casual essential.	FASH-MENS-CHINO	54.99	74.99	24.00	0.600	\N	\N	\N	ACTIVE	f	f	t	4.30	198	267	0	\N	\N	\N	2026-06-11 07:54:07.572	2026-06-11 07:54:07.573	2026-06-11 07:54:07.573	\N
cmq97bnsc00aj9937erw15una	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq7zojyn000rgs3nkscht6ca	Women's Oversized Knit Sweater	womens-oversized-knit-sweater	Cozy oversized knit sweater with drop shoulders, ribbed cuffs and hem. Made from a soft acrylic-wool blend. Perfect for layering.	Oversized knit sweater — cozy, relaxed, and stylish.	FASH-WMNS-SWTR	69.99	89.99	30.00	0.550	\N	\N	\N	ACTIVE	f	f	t	4.50	287	334	0	\N	\N	\N	2026-06-11 07:54:07.787	2026-06-11 07:54:07.788	2026-06-11 07:54:07.788	\N
cmq97bnxa00c49937xs3y31ct	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq97bmux000f9937qknd2de7	Leather Tote Bag — Everyday Essential	leather-tote-bag-everyday	Genuine full-grain leather tote bag. Spacious main compartment with zip closure, interior pockets, and detachable shoulder strap. Perfect for work or weekend.	Full-grain leather tote bag — spacious and timeless.	FASH-TOTE-LTHR	149.99	199.99	75.00	0.950	\N	\N	\N	ACTIVE	f	t	t	4.70	156	124	0	\N	\N	\N	2026-06-11 07:54:07.965	2026-06-11 07:54:07.966	2026-06-11 07:54:07.966	\N
cmq97bnyr00ck99378qjonzwt	cmq7zojw70009gs3nozhpetpo	cmq7zojwp000dgs3nbupkax0r	cmq97bmux000f9937qknd2de7	Classic Analog Watch — Minimalist Design	classic-analog-watch-minimalist	Clean minimalist analog watch with Japanese quartz movement. Stainless steel case, sapphire crystal glass, genuine leather strap. Water resistant 50m.	Minimalist analog watch with sapphire crystal and leather strap.	FASH-WATCH-ALOG	119.00	159.00	55.00	0.120	\N	\N	\N	ACTIVE	f	f	t	4.60	342	219	0	\N	\N	\N	2026-06-11 07:54:08.017	2026-06-11 07:54:08.019	2026-06-11 07:54:08.019	\N
\.


--
-- Data for Name: review_replies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_replies (id, "reviewId", "vendorId", content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, "userId", "productId", "orderId", rating, title, content, "isVerified", "isApproved", "helpfulCount", "imageUrls", "createdAt", "updatedAt") FROM stdin;
cmq7zokfv005mgs3n969cro8y	cmq7zoje70004gs3naiwg6fcv	cmq7zojzm000xgs3ngn4ayvuf	\N	5	Absolutely love it!	The camera is incredible and the titanium build feels premium. Battery life is great too.	t	t	0	\N	2026-06-10 11:32:26.876	2026-06-10 11:32:26.876
cmq7zokfv005ngs3nbnxmxs1r	cmq7zojv20005gs3na9yn8c1q	cmq7zok3g001tgs3n54h9jwsy	\N	5	Best headphones I have ever owned	The noise cancellation is on another level. Perfect for long flights.	t	t	0	\N	2026-06-10 11:32:26.876	2026-06-10 11:32:26.876
cmq7zokfv005ogs3nnz16v4wu	cmq7zoje70004gs3naiwg6fcv	cmq7zok5x002ggs3n1p4gnxzd	\N	4	Great quality for the price	Soft fabric, true to size. Washes well without shrinking.	t	t	0	\N	2026-06-10 11:32:26.876	2026-06-10 11:32:26.876
\.


--
-- Data for Name: shipping_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_addresses (id, "orderId", "firstName", "lastName", phone, "addressLine1", "addressLine2", city, state, "postalCode", country, "createdAt") FROM stdin;
cmq97umi8000f6vki7f705xbo	cmq97umi8000e6vkic907cc3b	John	Doe	\N	123 Main St	\N	New York	NY	10001	US	2026-06-11 08:08:52.592
cmq983kjy00106vki4028wxcl	cmq983kjy000z6vki4c5tx4cb	test	test	9908952252	test 123	test, test test	test	test	78898989	IN	2026-06-11 08:15:49.966
cmq98b608000782ablhqgx3at	cmq98b608000682abzapwuqsl	John	Doe	\N	123 Main St	\N	New York	NY	10001	US	2026-06-11 08:21:44.36
cmq98fney000k82ab0yabeoyi	cmq98fney000j82abwpfn84cz	test	test	9908952252	test 123	test,12 test	test	test	567677	IN	2026-06-11 08:25:13.546
cmqi09vzz000jjsry9xtu844t	cmqi09vzz000ijsrym63arc9s	Test	Test	9908952252	test 123 test	testing testing	hyderabad	telanagan	500008	IN	2026-06-17 11:46:43.391
cmqj4jq1u0007i532w6qvpn8d	cmqj4jq1t0006i532zt1b7iev	test	test	9908952252	test123 test	testing 432 testing	hyd	telangana	500008	IN	2026-06-18 06:34:06.882
cmqj4qjrr000ki532yl1yeuf6	cmqj4qjrr000ji53230iytlmf	test	test	9908952252	test 123 test	testing 432	hyderabd	telanga	500008	IN	2026-06-18 06:39:25.335
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stores (id, "vendorId", name, slug, description, "logoUrl", "bannerUrl", "contactEmail", "contactPhone", address, "returnPolicy", "shippingPolicy", "isActive", "metaTitle", "metaDescription", "createdAt", "updatedAt") FROM stdin;
cmq7zojwe000bgs3n0h0o7g85	cmq7zojvw0007gs3nyfw7djh7	TechStore Pro	techstore-pro	Your one-stop shop for the latest electronics and gadgets.	\N	\N	support@techstore.com	+1-555-0200	\N	30-day hassle-free returns on all products.	Free shipping on orders over $50. Express delivery available.	t	\N	\N	2026-06-10 11:32:26.174	2026-06-10 11:32:26.174
cmq7zojwp000dgs3nbupkax0r	cmq7zojw70009gs3nozhpetpo	Fashion Hub	fashion-hub	Discover the latest trends in clothing and accessories.	\N	\N	hello@fashionhub.com	+1-555-0201	\N	14-day returns accepted with original tags.	Standard shipping 3-5 days. Free on orders over $75.	t	\N	\N	2026-06-10 11:32:26.185	2026-06-10 11:32:26.185
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tags (id, name, slug, "createdAt") FROM stdin;
cmq7zojyu000sgs3n73p81l0z	Featured	featured	2026-06-10 11:32:26.262
cmq7zojz3000tgs3n8qd5ep42	New Arrival	new-arrival	2026-06-10 11:32:26.272
cmq7zojza000ugs3n5yr5tf1f	Best Seller	best-seller	2026-06-10 11:32:26.278
cmq7zojzg000vgs3noik9uqge	Sale	sale	2026-06-10 11:32:26.284
\.


--
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_addresses (id, "userId", label, "firstName", "lastName", phone, "addressLine1", "addressLine2", city, state, "postalCode", country, "isDefault", "createdAt", "updatedAt") FROM stdin;
addr-john-home	cmq7zoje70004gs3naiwg6fcv	Home	John	Doe	+1-555-0101	123 Main Street	\N	New York	NY	10001	US	t	2026-06-10 11:32:26.138	2026-06-10 11:32:26.138
addr-jane-home	cmq7zojv20005gs3na9yn8c1q	Home	Jane	Smith	+1-555-0102	456 Oak Avenue	\N	San Francisco	CA	94102	US	t	2026-06-10 11:32:26.149	2026-06-10 11:32:26.149
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, "userId", "refreshTokenHash", "deviceInfo", "ipAddress", "userAgent", "isActive", "expiresAt", "createdAt", "updatedAt") FROM stdin;
cmq8064xy0005kpzvhtl8yrj7	cmq7zoje70004gs3naiwg6fcv	6760930b1466e1ca3f9b33a6763aae496a67f56a5703925b542b84c04693ff6e	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-17 11:46:06.597	2026-06-10 11:46:06.598	2026-06-10 15:35:12.176
cmq88cr3y000bkpzvgp41027s	cmq7zoje70004gs3naiwg6fcv	cc7a49a5d7b6563fac8ef8bc031336b47636643c480d6f014bb657f64eb76b53	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-17 15:35:12.182	2026-06-10 15:35:12.19	2026-06-11 05:14:25.161
cmq91m9so000dkpzv95fszmxy	cmq7zoje70004gs3naiwg6fcv	9d21f7c55fe4764c39fc43ea3f1681dad56b2baccdb4e8fbe7bb2df97547eeff	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-18 05:14:25.169	2026-06-11 05:14:25.176	2026-06-11 07:55:50.184
cmq97tw9r00016vkirlw3lo3q	cmq7zoje70004gs3naiwg6fcv	189e27c4b65ac67f6c332a16bf38bf59a77859035da2b6c080871670c8ef7d74	\N	::1	curl/8.5.0	t	2026-06-18 08:08:18.589	2026-06-11 08:08:18.591	2026-06-11 08:08:18.591
cmq97u22t00036vkie05qksj0	cmq7zoje70004gs3naiwg6fcv	a03a042cf9c1a4c987fb70b2badea420456ac69a84ab096378a9a19322ac7b54	\N	::1	curl/8.5.0	t	2026-06-18 08:08:26.116	2026-06-11 08:08:26.117	2026-06-11 08:08:26.117
cmq97ug2100056vkicqyqypd1	cmq7zoje70004gs3naiwg6fcv	7c4c05cac3793f9226288ccc491058dc2f9b46b66e1ec29cd73f3cd80a183269	\N	::1	curl/8.5.0	t	2026-06-18 08:08:44.231	2026-06-11 08:08:44.233	2026-06-11 08:08:44.233
cmq97umdl00096vkixxwh2ljj	cmq7zoje70004gs3naiwg6fcv	6ee74ef954e21bc1656d1d136d37e4512686bee25b95479e8553bde783c04edb	\N	::1	curl/8.5.0	t	2026-06-18 08:08:52.425	2026-06-11 08:08:52.426	2026-06-11 08:08:52.426
cmq97v0ka000p6vki54biuxwi	cmq7zoje70004gs3naiwg6fcv	e3cda05cd2bae54a2e8a2cdb14650a403a0b5be14201fc81476344d191477b75	\N	::1	curl/8.5.0	t	2026-06-18 08:09:10.809	2026-06-11 08:09:10.81	2026-06-11 08:09:10.81
cmq97va0n000s6vkiz71r860m	cmq7zoje70004gs3naiwg6fcv	d48f50eb0b04e1d581e4948b5002f55c38f83f6667616a2f1d2e8b5e3e71c95e	\N	::1	curl/8.5.0	t	2026-06-18 08:09:23.062	2026-06-11 08:09:23.063	2026-06-11 08:09:23.063
cmq97dut10003k67sp3jyjm9k	cmq7zoje70004gs3naiwg6fcv	914f8bf0ae328b36be7d8a1297d9a274a2d91355a5bc970b6b5c3971a3955197	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-18 07:55:50.188	2026-06-11 07:55:50.198	2026-06-11 08:14:25.09
cmq98b5tr000182ab4wdoupkh	cmq7zoje70004gs3naiwg6fcv	78d6aa767934f823a179223720177c25e7002d2b55de108092387953bc070840	\N	::1	curl/8.5.0	t	2026-06-18 08:21:44.124	2026-06-11 08:21:44.127	2026-06-11 08:21:44.127
cmq996k25000t82abhr3o2tri	cmq7zoje70004gs3naiwg6fcv	1792821de31985c3753b24e1b329b295a799f1240248bba68202f339ba671a86	\N	::1	curl/8.5.0	t	2026-06-18 08:46:08.908	2026-06-11 08:46:08.909	2026-06-11 08:46:08.909
cmq981r2r000u6vki1cguq284	cmq7zoje70004gs3naiwg6fcv	33f47b2f95c9d74e43ac19b109d6381c2c12cd93419cafd16a54a2c24378c806	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-18 08:14:25.098	2026-06-11 08:14:25.107	2026-06-11 08:58:38.723
cmq99mmms000v82ab8cuzjzae	cmq7zoje70004gs3naiwg6fcv	9ab021ee080c65d9f9ad00d1c24cd973bc6b66d78def7af96c5c0b6ef8f8990e	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-18 08:58:38.732	2026-06-11 08:58:38.74	2026-06-11 09:26:06.544
cmq9aovwo001382ab15cvw51s	cmq7zoje70004gs3naiwg6fcv	0be52356af00839b6365ab371d42e6eaef4416b4ef06e6634813a9b5868436cf	\N	::1	curl/8.5.0	t	2026-06-18 09:28:23.687	2026-06-11 09:28:23.688	2026-06-11 09:28:23.688
cmq9aly3m001182ab2a24rg61	cmq7zoje70004gs3naiwg6fcv	afc4fb4f5052e409dde22a54e395b6dca61cc33819071fd0c90d9c78f059368f	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-18 09:26:06.553	2026-06-11 09:26:06.562	2026-06-11 09:45:33.659
cmq9baynd001682abisquxzte	cmq7zoje70004gs3naiwg6fcv	f605bac162b60fc9f05f8ec9cf18da4aa9ba2a9903cbcb8b845610763fbd4035	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-18 09:45:33.664	2026-06-11 09:45:33.673	2026-06-12 06:10:00.229
cmqaj1luf001882abxsbv6vj2	cmq7zoje70004gs3naiwg6fcv	448509f39a33610c94c9da1320f101b0fb88921672e13684f57b44ee3dacc7f9	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-19 06:10:00.269	2026-06-12 06:10:00.28	2026-06-15 03:58:17.449
cmqeonrzn001c82abwvpe289h	cmq7zoje70004gs3naiwg6fcv	a80475adc02bd9ef1633a2c00cbf24e5b523e89a26f8b9f78dfbbd78e849243d	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-22 03:58:17.453	2026-06-15 03:58:17.459	2026-06-16 03:44:58.2
cmqg3mhyf001e82abtpgupcs8	cmq7zoje70004gs3naiwg6fcv	45dc431bff9bc240b27aded98edea874af65aa84541cb332336343a9bdc47b8c	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-23 03:44:58.208	2026-06-16 03:44:58.215	2026-06-17 04:43:17.97
cmqhl5d2b001g82abxvwkta4x	cmq7zoje70004gs3naiwg6fcv	b01f8afe4e15968f464d6738c67db657db8c4aa8a8ebae17c26cc7a7fe4ef3d5	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-24 04:43:17.978	2026-06-17 04:43:17.987	2026-06-17 08:51:00.874
cmqhtzxcu000212t0oz95jtuz	cmq7zoje70004gs3naiwg6fcv	3527e8ab9997e3177c005eec56055930788669b8fe265b6c06d6e5e40da4917c	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	t	2026-06-24 08:51:00.884	2026-06-17 08:51:00.894	2026-06-17 08:51:00.894
cmqhv3d6x00012c9zh58d54n4	cmq7zoigp0002gs3nrhpl06dm	8f2d6699cb9e8b8958de42b1c624a62409a75a1df2fe26a7425d08c8cbf1c97d	\N	::1	curl/8.5.0	t	2026-06-24 09:21:40.999	2026-06-17 09:21:41.001	2026-06-17 09:21:41.001
cmqhv40az00032c9zt02ev8ip	cmq7zoigp0002gs3nrhpl06dm	d926ad1dbe84332682296cb6f74a5a3709b797c893f9961d8c5785462a0e6358	\N	::1	curl/8.5.0	t	2026-06-24 09:22:10.954	2026-06-17 09:22:10.956	2026-06-17 09:22:10.956
cmqhueg8c000412t0eucswz3v	cmq7zoigp0002gs3nrhpl06dm	95cbd1ed22d7fe88564ba35624df98af8fb24f297195f934561b2ac4410b2758	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-24 09:02:18.539	2026-06-17 09:02:18.54	2026-06-17 09:24:48.1
cmqhvg5dp0001y61p3fzw3umh	cmq7zoigp0002gs3nrhpl06dm	de0bb03abe37766956edb06c2b0a77ef1854a56c180bb34805ef65ad36d255e2	\N	::1	curl/8.5.0	t	2026-06-24 09:31:37.403	2026-06-17 09:31:37.405	2026-06-17 09:31:37.405
cmqhvgo8x0003y61pqxh5vstl	cmq7zohiv0000gs3n7z8zo0dz	9036eeb79673bf36efde61a9089a3384a129cb235ac18286441356d16bd262d5	\N	::1	curl/8.5.0	t	2026-06-24 09:32:01.856	2026-06-17 09:32:01.857	2026-06-17 09:32:01.857
cmqhvh0xc0005y61pzkjo2vys	cmq7zohiv0000gs3n7z8zo0dz	0daf607baa3f4cdeedfeb071502b83e2085b1e8fe7bab5077baf63a252153cc0	\N	::1	curl/8.5.0	t	2026-06-24 09:32:18.287	2026-06-17 09:32:18.288	2026-06-17 09:32:18.288
cmqhvkfh50001jsrypnpmjmro	cmq7zoigp0002gs3nrhpl06dm	c1369459b1ffe0c96cdd1cfefff79ca5489883c1666efad2411e2fd7e73bf204	\N	::1	curl/8.5.0	t	2026-06-24 09:34:57.11	2026-06-17 09:34:57.113	2026-06-17 09:34:57.113
cmqhvkg1m0003jsrygvggwvyd	cmq7zohiv0000gs3n7z8zo0dz	dda8bbd8282c087479429c3f65aae4a4176c8879a6a49398fe1b111415b304e0	\N	::1	curl/8.5.0	t	2026-06-24 09:34:57.848	2026-06-17 09:34:57.85	2026-06-17 09:34:57.85
cmqhv7dkg00052c9zafu1b0wd	cmq7zoigp0002gs3nrhpl06dm	e17b584813273dbb2b4f9fe4280e569f22ea6fc96e9cb58b6cc601e4eb2b642b	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-24 09:24:48.106	2026-06-17 09:24:48.113	2026-06-17 09:44:31.766
cmqhvwqw60005jsryhcvglg0z	cmq7zoigp0002gs3nrhpl06dm	4ad13a5541dde045218e13f4d3be58cf8e47dd3547ee86ef34bede40edcffa44	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-24 09:44:31.774	2026-06-17 09:44:31.782	2026-06-17 10:03:15.609
cmqhwku2w0007jsry8lxyqxun	cmq7zoigp0002gs3nrhpl06dm	3344ad0cd16d24b9c3aeabca02e41e0c3908a381866c1846a7166e511d9f2317	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-24 10:03:15.648	2026-06-17 10:03:15.656	2026-06-17 10:21:35.556
cmqhx8es50009jsrykfv0ifgn	cmq7zoigp0002gs3nrhpl06dm	8987879462876766752805b125819f0d7ff0faf2b5c2fa43d8124d6949730661	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-24 10:21:35.565	2026-06-17 10:21:35.574	2026-06-17 11:22:11.315
cmqhzec69000bjsryvp48an7p	cmq7zoigp0002gs3nrhpl06dm	b6913a1fc5f95d925fd3a46a45915e1da458bb6ec3e9befbdbe2c85b68c102e8	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-24 11:22:11.352	2026-06-17 11:22:11.361	2026-06-17 11:45:25.691
cmqi08820000djsryqz28ain9	cmq7zoigp0002gs3nrhpl06dm	7bb44ccbd34d1e06fe78107930e46d82c57830ce77a22bbc2a555394860622ef	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-24 11:45:25.697	2026-06-17 11:45:25.705	2026-06-18 04:36:45.001
cmqj0csin000sjsryfs7ayi3f	cmq7zoigp0002gs3nrhpl06dm	784b61710fe143870bb8a200504976484be2a9a50fff4b243479b330a280cfb5	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-25 04:36:45.011	2026-06-18 04:36:45.023	2026-06-18 06:29:04.882
cmqj4d91g0001i532027v5c6i	cmq7zoigp0002gs3nrhpl06dm	ece125b36236c264cc4d74011498a1d141b36882b55b4f3c2671879295d6abb5	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-25 06:29:04.891	2026-06-18 06:29:04.9	2026-06-18 06:44:47.234
cmqj4xg5s000ti532fb9q68mu	cmq7zoigp0002gs3nrhpl06dm	7700588435d22a132bcc474ae0f5de687c810460eb86df1d188694d5a8bced76	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	f	2026-06-25 06:44:47.243	2026-06-18 06:44:47.248	2026-06-18 09:03:14.868
cmqj9viea000vi532jiex0lwc	cmq7zoigp0002gs3nrhpl06dm	e829a366d024d73e6e831b2ab6bd747b6978689c1041469ccbeefa842d66c952	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	t	2026-06-25 09:03:14.906	2026-06-18 09:03:14.914	2026-06-18 09:03:14.914
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, "firstName", "lastName", phone, "avatarUrl", role, "isEmailVerified", "emailVerificationToken", "emailVerificationExpiry", "isActive", "isLocked", "lockUntil", "failedLoginAttempts", "lastLoginAt", "lastLoginIp", "passwordResetToken", "passwordResetExpiry", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cmq7zoi010001gs3nvt0mlc57	admin@marketplace.com	$2a$12$KjgLbTgh7/Rn/0kmnqSVMuXGFEIM0Jam24xr1KioHq0CEGn4/KBMe	Platform	Admin	\N	\N	ADMIN	t	\N	\N	t	f	\N	0	\N	\N	\N	\N	2026-06-10 11:32:23.713	2026-06-10 11:32:23.713	\N
cmq7zoixe0003gs3nz5148uqh	vendor2@fashionhub.com	$2a$12$2UW1Lqt9.p6wE/.kV.lKguKOWAgFlSQSS.hkRoTjHCT8VuZDNAKLq	Priya	Sharma	\N	\N	VENDOR	t	\N	\N	t	f	\N	0	\N	\N	\N	\N	2026-06-10 11:32:24.914	2026-06-10 11:32:24.914	\N
cmq7zojv20005gs3na9yn8c1q	jane.smith@example.com	$2a$12$0J5/LZlBtMqnVn9GSLU7kOH2IVo3Lu1ypNXhTf/G5Dc8UMV32bNbC	Jane	Smith	+1-555-0102	\N	CUSTOMER	t	\N	\N	t	f	\N	0	\N	\N	\N	\N	2026-06-10 11:32:26.127	2026-06-10 11:32:26.127	\N
cmq7zoigp0002gs3nrhpl06dm	vendor@techstore.com	$2a$12$5p7FLTxbcqzKhBKBtmStNes1fHiyvQe.T2tIFI3zri/hwKsioxKgK	Alex	Chen	\N	\N	VENDOR	t	\N	\N	t	f	\N	0	2026-06-17 09:34:57.12	::1	\N	\N	2026-06-10 11:32:24.313	2026-06-17 09:34:57.122	\N
cmq7zohiv0000gs3n7z8zo0dz	superadmin@marketplace.com	$2a$12$ggJFmSaYTZB/W6wrFOcmFu1WKTYS2kTXxnUGHT.3yniZPNIsMytWy	Super	Admin	\N	\N	SUPER_ADMIN	t	\N	\N	t	f	\N	0	2026-06-17 09:34:57.855	::1	\N	\N	2026-06-10 11:32:23.096	2026-06-17 09:34:57.856	\N
cmq7zoje70004gs3naiwg6fcv	john.doe@example.com	$2a$12$hkfKArb9xJ.IvYg94h7RtegBISRQkszyjNWDcw86/yKwM4sMMX5Y2	John	Doe	+1-555-0101	\N	VENDOR	t	\N	\N	t	f	\N	0	2026-06-11 09:28:23.693	::1	\N	\N	2026-06-10 11:32:25.519	2026-06-11 09:28:23.756	\N
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, "userId", "businessName", "businessEmail", "businessPhone", description, "logoUrl", "bannerUrl", website, "taxId", status, "commissionRate", "isVerified", "verifiedAt", "rejectionReason", "totalRevenue", "totalOrders", rating, "createdAt", "updatedAt") FROM stdin;
cmq7zojvw0007gs3nyfw7djh7	cmq7zoigp0002gs3nrhpl06dm	TechStore Pro	business@techstore.com	+1-555-0200	Premium electronics and tech gadgets at competitive prices.	\N	\N	\N	\N	APPROVED	8.50	t	2026-06-10 11:32:26.154	\N	58420.75	142	4.70	2026-06-10 11:32:26.157	2026-06-10 11:32:26.157
cmq7zojw70009gs3nozhpetpo	cmq7zoixe0003gs3nz5148uqh	Fashion Hub	hello@fashionhub.com	+1-555-0201	Trendy fashion for everyone — affordable and stylish.	\N	\N	\N	\N	APPROVED	10.00	t	2026-06-10 11:32:26.166	\N	22150.00	89	4.40	2026-06-10 11:32:26.167	2026-06-10 11:32:26.167
cmq9aovy7001482abzcp30hsu	cmq7zoje70004gs3naiwg6fcv	Johns Store	john.business@example.com	\N	Selling electronics	\N	\N	\N	\N	PENDING	10.00	f	\N	\N	0.00	0	0.00	2026-06-11 09:28:23.743	2026-06-11 09:28:23.743
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlist_items (id, "wishlistId", "productId", "addedAt") FROM stdin;
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlists (id, "userId", name, "isPublic", "shareToken", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: cms_pages cms_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cms_pages
    ADD CONSTRAINT cms_pages_pkey PRIMARY KEY (id);


--
-- Name: coupon_usages coupon_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_refunds payment_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_attribute_values product_attribute_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_pkey PRIMARY KEY (id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_inventory product_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inventory
    ADD CONSTRAINT product_inventory_pkey PRIMARY KEY (id);


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY ("productId", "tagId");


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: review_replies review_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT review_replies_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: shipping_addresses shipping_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT shipping_addresses_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt" DESC);


--
-- Name: audit_logs_resource_resourceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_resource_resourceId_idx" ON public.audit_logs USING btree (resource, "resourceId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: banners_position_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banners_position_isActive_idx" ON public.banners USING btree ("position", "isActive");


--
-- Name: blogs_isPublished_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "blogs_isPublished_idx" ON public.blogs USING btree ("isPublished");


--
-- Name: blogs_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blogs_slug_idx ON public.blogs USING btree (slug);


--
-- Name: blogs_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blogs_slug_key ON public.blogs USING btree (slug);


--
-- Name: cart_items_cartId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cart_items_cartId_idx" ON public.cart_items USING btree ("cartId");


--
-- Name: cart_items_cartId_productId_variantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cart_items_cartId_productId_variantId_key" ON public.cart_items USING btree ("cartId", "productId", "variantId");


--
-- Name: carts_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "carts_expiresAt_idx" ON public.carts USING btree ("expiresAt");


--
-- Name: carts_sessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "carts_sessionId_idx" ON public.carts USING btree ("sessionId");


--
-- Name: carts_sessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "carts_sessionId_key" ON public.carts USING btree ("sessionId");


--
-- Name: carts_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "carts_userId_key" ON public.carts USING btree ("userId");


--
-- Name: categories_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "categories_parentId_idx" ON public.categories USING btree ("parentId");


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: cms_pages_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cms_pages_slug_idx ON public.cms_pages USING btree (slug);


--
-- Name: cms_pages_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cms_pages_slug_key ON public.cms_pages USING btree (slug);


--
-- Name: coupon_usages_couponId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_usages_couponId_idx" ON public.coupon_usages USING btree ("couponId");


--
-- Name: coupon_usages_couponId_userId_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coupon_usages_couponId_userId_orderId_key" ON public.coupon_usages USING btree ("couponId", "userId", "orderId");


--
-- Name: coupon_usages_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_usages_userId_idx" ON public.coupon_usages USING btree ("userId");


--
-- Name: coupons_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupons_code_idx ON public.coupons USING btree (code);


--
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- Name: coupons_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupons_isActive_idx" ON public.coupons USING btree ("isActive");


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt" DESC);


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: notifications_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_isRead_idx" ON public.notifications USING btree ("userId", "isRead");


--
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- Name: order_items_vendorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_items_vendorId_idx" ON public.order_items USING btree ("vendorId");


--
-- Name: order_status_history_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_status_history_orderId_idx" ON public.order_status_history USING btree ("orderId");


--
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt" DESC);


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- Name: payment_refunds_paymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_refunds_paymentId_idx" ON public.payment_refunds USING btree ("paymentId");


--
-- Name: payment_refunds_stripeRefundId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payment_refunds_stripeRefundId_key" ON public.payment_refunds USING btree ("stripeRefundId");


--
-- Name: payments_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_orderId_idx" ON public.payments USING btree ("orderId");


--
-- Name: payments_stripePaymentIntentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_stripePaymentIntentId_idx" ON public.payments USING btree ("stripePaymentIntentId");


--
-- Name: payments_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON public.payments USING btree ("stripePaymentIntentId");


--
-- Name: product_attribute_values_attributeId_variantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "product_attribute_values_attributeId_variantId_key" ON public.product_attribute_values USING btree ("attributeId", "variantId");


--
-- Name: product_attributes_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_attributes_productId_idx" ON public.product_attributes USING btree ("productId");


--
-- Name: product_images_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_images_productId_idx" ON public.product_images USING btree ("productId");


--
-- Name: product_inventory_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "product_inventory_productId_key" ON public.product_inventory USING btree ("productId");


--
-- Name: product_inventory_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_inventory_sku_idx ON public.product_inventory USING btree (sku);


--
-- Name: product_inventory_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_inventory_sku_key ON public.product_inventory USING btree (sku);


--
-- Name: product_inventory_variantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "product_inventory_variantId_key" ON public.product_inventory USING btree ("variantId");


--
-- Name: product_variants_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_variants_productId_idx" ON public.product_variants USING btree ("productId");


--
-- Name: product_variants_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku);


--
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- Name: products_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "products_createdAt_idx" ON public.products USING btree ("createdAt" DESC);


--
-- Name: products_isFeatured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "products_isFeatured_idx" ON public.products USING btree ("isFeatured");


--
-- Name: products_price_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_price_idx ON public.products USING btree (price);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: products_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_status_idx ON public.products USING btree (status);


--
-- Name: products_storeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "products_storeId_idx" ON public.products USING btree ("storeId");


--
-- Name: products_vendorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "products_vendorId_idx" ON public.products USING btree ("vendorId");


--
-- Name: review_replies_reviewId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "review_replies_reviewId_key" ON public.review_replies USING btree ("reviewId");


--
-- Name: reviews_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_productId_idx" ON public.reviews USING btree ("productId");


--
-- Name: reviews_rating_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_rating_idx ON public.reviews USING btree (rating);


--
-- Name: reviews_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_userId_idx" ON public.reviews USING btree ("userId");


--
-- Name: reviews_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "reviews_userId_productId_key" ON public.reviews USING btree ("userId", "productId");


--
-- Name: shipping_addresses_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "shipping_addresses_orderId_key" ON public.shipping_addresses USING btree ("orderId");


--
-- Name: stores_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stores_slug_idx ON public.stores USING btree (slug);


--
-- Name: stores_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stores_slug_key ON public.stores USING btree (slug);


--
-- Name: stores_vendorId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "stores_vendorId_key" ON public.stores USING btree ("vendorId");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: tags_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);


--
-- Name: user_addresses_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_addresses_userId_idx" ON public.user_addresses USING btree ("userId");


--
-- Name: user_sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_sessions_expiresAt_idx" ON public.user_sessions USING btree ("expiresAt");


--
-- Name: user_sessions_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_sessions_userId_idx" ON public.user_sessions USING btree ("userId");


--
-- Name: users_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_createdAt_idx" ON public.users USING btree ("createdAt");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: vendors_businessEmail_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "vendors_businessEmail_key" ON public.vendors USING btree ("businessEmail");


--
-- Name: vendors_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_status_idx ON public.vendors USING btree (status);


--
-- Name: vendors_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "vendors_userId_key" ON public.vendors USING btree ("userId");


--
-- Name: wishlist_items_wishlistId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlist_items_wishlistId_idx" ON public.wishlist_items USING btree ("wishlistId");


--
-- Name: wishlist_items_wishlistId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "wishlist_items_wishlistId_productId_key" ON public.wishlist_items USING btree ("wishlistId", "productId");


--
-- Name: wishlists_shareToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "wishlists_shareToken_key" ON public.wishlists USING btree ("shareToken");


--
-- Name: wishlists_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlists_userId_idx" ON public.wishlists USING btree ("userId");


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cart_items cart_items_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: carts carts_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: carts carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: coupon_usages coupon_usages_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT "coupon_usages_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_usages coupon_usages_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT "coupon_usages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_usages coupon_usages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT "coupon_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupons coupons_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "coupons_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payment_refunds payment_refunds_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT "payment_refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_attribute_values product_attribute_values_attributeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT "product_attribute_values_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES public.product_attributes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_attribute_values product_attribute_values_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT "product_attribute_values_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_attributes product_attributes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_inventory product_inventory_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inventory
    ADD CONSTRAINT "product_inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_inventory product_inventory_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inventory
    ADD CONSTRAINT "product_inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT "product_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: review_replies review_replies_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT "review_replies_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public.reviews(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_addresses shipping_addresses_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT "shipping_addresses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stores stores_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT "stores_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_addresses user_addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT "user_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendors vendors_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_wishlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES public.wishlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlists wishlists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict NM9gUAviadodaCXiGSj9bHbtTMKXYaW8abKruXFtjfW1z7XWJodaj96U8OREWh7

