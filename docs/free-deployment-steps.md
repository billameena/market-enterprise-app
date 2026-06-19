# Free Deployment Guide — Step by Step
**Stack: Vercel (frontend) + Render (backend) + Neon (PostgreSQL) + Upstash (Redis)**
All free. No credit card required.

---

## What You'll Set Up

| Service | Provider | Free Limits |
|---------|----------|-------------|
| Frontend hosting | Vercel | Unlimited for hobby projects |
| Backend API | Render | 750 hrs/month (sleeps after 15 min idle) |
| PostgreSQL | Neon | 0.5 GB, no expiry |
| Redis | Upstash | 10,000 commands/day |

> **Note on Render free tier**: The backend "sleeps" after 15 minutes of no requests.
> The first request after sleeping takes ~30 seconds to wake up. Fine for testing.

---

## Step 1 — Push Code to GitHub

```bash
cd /home/mbilla/Desktop/full-stack/Enterprice-App

git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Make sure these files are **NOT** in `.gitignore` (they should already be ignored):
- `backend/.env`
- `frontend/.env`
- `docs/jwt-keys.txt`

---

## Step 2 — Set Up PostgreSQL on Neon (free)

1. Go to **https://neon.tech** → Sign up (GitHub login works)
2. Click **New Project** → give it a name like `marketplace`
3. Choose region closest to you
4. Once created, click **Connection Details**
5. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. **Save this** — you'll paste it as `DATABASE_URL` in Render

---

## Step 3 — Set Up Redis on Upstash (free)

1. Go to **https://upstash.com** → Sign up (GitHub login works)
2. Click **Create Database**
3. Name: `marketplace-redis`, Region: closest to you, Type: **Regional**
4. Click **Create**
5. On the database page, scroll to **REST API** section
6. Copy the **Redis URL** — it looks like:
   ```
   rediss://default:xxxxx@global-xxx.upstash.io:6380
   ```
7. **Save this** — you'll paste it as `REDIS_URL` in Render

---

## Step 4 — Deploy Backend on Render (free)

1. Go to **https://render.com** → Sign up (GitHub login works)
2. Click **New +** → **Web Service**
3. Connect your GitHub account → select your repository
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | Name | `marketplace-api` |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install && npx prisma generate && npm run build` |
   | Start Command | `npm run start:prod` |
   | Instance Type | **Free** |

5. Click **Advanced** → **Add Environment Variable** — add all of these:

   ```
   NODE_ENV            = production
   DATABASE_URL        = [paste Neon connection string from Step 2]
   REDIS_URL           = [paste Upstash Redis URL from Step 3]
   STRIPE_SECRET_KEY   = sk_test_your_key_or_leave_placeholder
   STRIPE_CURRENCY     = usd
   STRIPE_WEBHOOK_SECRET = whsec_placeholder
   JWT_EXPIRES_IN      = 15m
   REFRESH_TOKEN_EXPIRES_IN = 7d
   ```

   **For JWT keys** — open `docs/jwt-keys.txt` and copy-paste:
   ```
   ACCESS_TOKEN_PRIVATE_KEY  = [full private key from jwt-keys.txt]
   ACCESS_TOKEN_PUBLIC_KEY   = [full public key from jwt-keys.txt]
   REFRESH_TOKEN_SECRET      = [any long random string, e.g. run: openssl rand -hex 32]
   ```

   **For CORS** (add after frontend is deployed — skip for now, update in Step 6):
   ```
   CORS_ORIGIN = https://your-app.vercel.app
   ```

   **For email** (use Mailtrap free for testing):
   - Sign up at https://mailtrap.io → Email Testing → SMTP Settings
   ```
   SMTP_HOST = sandbox.smtp.mailtrap.io
   SMTP_PORT = 2525
   SMTP_USER = [your mailtrap user]
   SMTP_PASS = [your mailtrap password]
   SMTP_FROM = noreply@marketplace.com
   ```

6. Click **Create Web Service**
7. Wait for the build to complete (~3-5 minutes)
8. Note your backend URL: `https://marketplace-api.onrender.com`

### Verify backend is running
```
https://marketplace-api.onrender.com/api/v1/health
```
Should return `{ "status": "ok" }`

---

## Step 5 — Deploy Frontend on Vercel (free)

1. Go to **https://vercel.com** → Sign up (GitHub login works)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:

   | Setting | Value |
   |---------|-------|
   | Root Directory | `frontend` |
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

5. Click **Environment Variables** → Add:
   ```
   VITE_API_URL                = https://marketplace-api.onrender.com/api/v1
   VITE_STRIPE_PUBLISHABLE_KEY = pk_test_placeholder_or_your_real_key
   ```

6. Click **Deploy**
7. Wait ~2 minutes
8. Note your frontend URL: `https://your-app.vercel.app`

---

## Step 6 — Update CORS on Render

Now that you have the Vercel URL, update the backend:

1. Go to Render → your `marketplace-api` service → **Environment**
2. Update (or add):
   ```
   CORS_ORIGIN = https://your-app.vercel.app
   ```
3. Render will auto-redeploy

---

## Step 7 — Seed the Database (optional but recommended)

The database is empty after first deploy. To add test data:

1. In Render → your service → **Shell** tab (or use Render CLI)
2. Run:
   ```bash
   npx prisma db seed
   ```

OR run it locally pointing to the Neon database:
```bash
cd backend
DATABASE_URL="[your neon connection string]" npx prisma db seed
```

This creates:
- `superadmin@marketplace.com` / `SuperAdmin@123`
- `vendor@techstore.com` / `Vendor@123`
- `john.doe@example.com` / `Customer@123`
- 26 products, categories, banners, coupons

---

## Step 8 — Test Your Deployed App

1. Open `https://your-app.vercel.app`
2. Sign in with `john.doe@example.com` / `Customer@123`
3. Browse products, add to cart, checkout (Demo Mode — no real Stripe needed)
4. Sign in as `superadmin@marketplace.com` / `SuperAdmin@123` for admin dashboard

---

## Troubleshooting

### Backend build fails on Render
- Check **Logs** tab in Render
- Most common cause: missing environment variable
- Make sure `DATABASE_URL` is set correctly with `?sslmode=require` for Neon

### Frontend shows blank page
- Open browser DevTools → Console
- Check `VITE_API_URL` is set correctly (no trailing slash)
- Make sure `vercel.json` is in the `frontend/` folder

### "Network Error" / CORS error in browser console
- Make sure `CORS_ORIGIN` in Render exactly matches your Vercel URL (no trailing slash)
- Example: `https://marketplace-abc123.vercel.app` ✓ NOT `https://marketplace-abc123.vercel.app/` ✗

### Backend sleeping (30 second first load)
- This is normal on Render's free tier
- The service wakes up when a request comes in
- To avoid it: upgrade to Render's $7/month paid tier

### Prisma migration errors
- Make sure `DATABASE_URL` includes `?sslmode=require` for Neon
- The `npm run start:prod` command runs `prisma migrate deploy` automatically on every deploy

---

## Cost Summary

| Service | Free Limits | When You'd Pay |
|---------|-------------|----------------|
| Vercel | Unlimited hobby | Custom domain, team features |
| Render web service | 750 hrs/month, sleeps | $7/month for always-on |
| Neon PostgreSQL | 0.5 GB | $19/month for 10 GB |
| Upstash Redis | 10K cmds/day | $0.2 per 100K commands |
| Mailtrap | 1000 emails/month | $15/month for production |
| **Total** | **$0** | |

---

## Upgrading to Always-On (when ready)

When you want the app to stay awake without the 30-second cold start:
1. Render → Web Service → **Upgrade to Starter** ($7/month)
2. That's the only change needed — everything else stays free

---

## Quick Reference — All Your URLs

After deployment, fill in:

```
Frontend:  https://_________________.vercel.app
Backend:   https://marketplace-api.onrender.com
Database:  postgresql://...@neon.tech/neondb
Redis:     rediss://...@upstash.io:6380
```
