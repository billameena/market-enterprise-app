# Free Test Deployment Guide

> **Purpose:** Get this app running online for free so you can share and test it.
> Not for real users or production use.

---

## Free Services You'll Use

| What | Where | Free? |
|------|-------|-------|
| Frontend | Vercel | ✅ Always free |
| Backend API | Render | ✅ Free (sleeps after 15 min idle) |
| Database | Neon | ✅ Free forever (0.5 GB) |
| Redis | Upstash | ✅ Free (10K requests/day) |
| Email (testing) | Mailtrap | ✅ Free (1000 emails/month) |

**Total cost: $0**

> ⚠️ **One thing to know about Render free tier:**
> The backend goes to sleep if nobody uses it for 15 minutes.
> When someone visits again, it takes about 30 seconds to wake up.
> This is fine for testing — just warn anyone you share it with.

---

## Before You Start

You need accounts on these sites (all free, GitHub login works on all of them):
- [github.com](https://github.com)
- [neon.tech](https://neon.tech)
- [upstash.com](https://upstash.com)
- [render.com](https://render.com)
- [vercel.com](https://vercel.com)
- [mailtrap.io](https://mailtrap.io)

---

## Step 1 — Push Code to GitHub

Open a terminal in the project root (`Enterprice-App/` folder):

```bash
git init
git add .
git commit -m "initial commit"
```

Go to [github.com/new](https://github.com/new), create a **new empty repository** (no README, no .gitignore), then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub.

---

## Step 2 — Get a Free Database (Neon)

1. Go to [neon.tech](https://neon.tech) → **Sign up with GitHub**
2. Click **New Project**
3. Give it any name (e.g. `marketplace`) → click **Create Project**
4. On the next screen, find the **Connection string** box
5. Copy the string that looks like this:
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. **Paste it somewhere safe** — you'll need it in Step 4

✅ Free PostgreSQL database ready.

---

## Step 3 — Get Free Redis (Upstash)

1. Go to [upstash.com](https://upstash.com) → **Sign up with GitHub**
2. Click **Create Database**
3. Fill in:
   - Name: `marketplace-redis`
   - Type: **Regional**
   - Region: pick the one closest to you
4. Click **Create**
5. On the database page scroll down to find **Redis URL** — copy it:
   ```
   rediss://default:xxxxx@global-xxx.upstash.io:6380
   ```
6. **Paste it somewhere safe** — you'll need it in Step 4

✅ Free Redis ready.

---

## Step 4 — Get Free Email Testing (Mailtrap)

> This catches all emails the app sends so they never reach real inboxes.

1. Go to [mailtrap.io](https://mailtrap.io) → **Sign up** (free)
2. Go to **Email Testing** → **Inboxes** → click your inbox
3. Click **SMTP Settings** tab
4. Under **Integrations**, select **Nodemailer** from the dropdown
5. You'll see values like:
   ```
   host: sandbox.smtp.mailtrap.io
   port: 2525
   auth.user: abc123def456
   auth.pass: xyz789uvw012
   ```
6. **Save these 4 values** — you'll need them in Step 5

✅ Email testing ready.

---

## Step 5 — Generate JWT Keys

These are needed for login to work. Run this in your terminal:

```bash
# Generate the keys
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Convert to single-line format for copy-pasting
echo "PRIVATE KEY:"
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private.pem

echo ""
echo "PUBLIC KEY:"
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' public.pem
```

Copy and save both outputs — the full `-----BEGIN...-----END...` strings.

> If you don't want to run these commands, use the pre-generated keys already saved in `docs/jwt-keys.txt`.

---

## Step 6 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **Sign up with GitHub**
2. Click **New +** → **Web Service**
3. Click **Connect a repository** → select your GitHub repo
4. Fill in these settings:

   | Field | Value |
   |-------|-------|
   | Name | `marketplace-api` |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install && npx prisma generate && npm run build` |
   | Start Command | `npm run start:prod` |
   | Instance Type | **Free** |

5. Scroll down to **Environment Variables** → click **Add Environment Variable** and add each one:

   ```
   NODE_ENV                    production
   DATABASE_URL                [paste Neon string from Step 2]
   REDIS_URL                   [paste Upstash URL from Step 3]
   ACCESS_TOKEN_PRIVATE_KEY    [paste private key from Step 5]
   ACCESS_TOKEN_PUBLIC_KEY     [paste public key from Step 5]
   REFRESH_TOKEN_SECRET        anyrandomlongstring123456789abc
   STRIPE_SECRET_KEY           sk_test_placeholder
   STRIPE_WEBHOOK_SECRET       whsec_placeholder
   STRIPE_CURRENCY             usd
   SMTP_HOST                   sandbox.smtp.mailtrap.io
   SMTP_PORT                   2525
   SMTP_USER                   [from Mailtrap Step 4]
   SMTP_PASS                   [from Mailtrap Step 4]
   SMTP_FROM                   noreply@marketplace.com
   JWT_EXPIRES_IN              15m
   REFRESH_TOKEN_EXPIRES_IN    7d
   CORS_ORIGIN                 https://placeholder.vercel.app
   ```

   > Leave `CORS_ORIGIN` as placeholder for now — you'll update it after Step 7.

6. Click **Create Web Service**
7. Wait 3–5 minutes for the build to finish
8. Once it says **Live**, copy your backend URL:
   ```
   https://marketplace-api.onrender.com
   ```

✅ Backend is deployed.

---

## Step 7 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Click **Add New** → **Project**
3. Click **Import** on your GitHub repository
4. Fill in settings:

   | Field | Value |
   |-------|-------|
   | Root Directory | `frontend` |
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

5. Click **Environment Variables** → Add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://marketplace-api.onrender.com/api/v1` |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_placeholder` |

6. Click **Deploy**
7. Wait ~2 minutes
8. Copy your frontend URL:
   ```
   https://your-app-name.vercel.app
   ```

✅ Frontend is deployed.

---

## Step 8 — Connect Frontend to Backend (CORS fix)

Now update the backend to allow requests from your Vercel URL:

1. Go to Render → **marketplace-api** → **Environment** tab
2. Find `CORS_ORIGIN` → click edit → change to your exact Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
   (no trailing slash)
3. Click **Save Changes** — Render will auto-redeploy (~2 minutes)

✅ Frontend and backend are now connected.

---

## Step 9 — Add Test Data to Database

The database is empty right now. Run this from your local machine to add sample products, users, and categories:

```bash
cd /home/mbilla/Desktop/full-stack/Enterprice-App/backend

DATABASE_URL="[your neon connection string from Step 2]" npx prisma db seed
```

This creates:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@marketplace.com | SuperAdmin@123 |
| Admin | admin@marketplace.com | Admin@123 |
| Vendor | vendor@techstore.com | Vendor@123 |
| Customer | john.doe@example.com | Customer@123 |

Plus 26 products, categories, banners, and coupons.

---

## Step 10 — Test Your App

Open your Vercel URL in a browser and test these flows:

**As a customer:**
- [ ] Browse products on the homepage
- [ ] Search and filter products
- [ ] Add items to cart
- [ ] Checkout → fill address → click **Complete Order (Demo)**
- [ ] View order in My Orders

**As a vendor:**
- [ ] Login as `vendor@techstore.com`
- [ ] Click **My Store** in the header
- [ ] View the vendor dashboard

**As admin:**
- [ ] Login as `superadmin@marketplace.com`
- [ ] Click **Admin Dashboard** from the profile menu
- [ ] Browse Users, Vendors, Products sections

---

## Something Not Working?

### App loads but API calls fail
- Open browser **DevTools → Console**
- If you see CORS error → check `CORS_ORIGIN` in Render matches your Vercel URL exactly
- If you see 404 → check `VITE_API_URL` in Vercel ends with `/api/v1` and has no trailing slash

### Page refresh gives 404 on Vercel
- Make sure `frontend/vercel.json` exists and contains:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

### Backend build fails on Render
- Go to Render → your service → **Logs** tab
- Most common cause: missing or wrong env variable
- Double check `DATABASE_URL` ends with `?sslmode=require`

### Login fails / Invalid token
- The JWT keys must be in single-line format with `\n` between lines
- Re-run the commands in Step 5 and make sure you copy the full output

### Backend not responding (first visit)
- Wait 30–60 seconds — the free tier sleeps and needs to wake up
- Try refreshing the page

---

## Your Final URLs

Fill in after deployment:

```
🌐 App (frontend):   https://_________________________.vercel.app
🔌 API (backend):    https://marketplace-api.onrender.com
🗄️  Database:        Neon dashboard → neon.tech
📦 Redis:            Upstash dashboard → upstash.com
📧 Emails:           Mailtrap inbox → mailtrap.io
```
