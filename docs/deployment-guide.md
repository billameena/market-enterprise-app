# Deployment Guide — Enterprise Multi-Vendor E-Commerce Marketplace

This guide covers all supported deployment options for the marketplace platform, from the simplest managed-hosting approach to a fully self-hosted production setup on AWS. Choose the option that best matches your operational requirements and budget.

**Stack summary:**
- **Frontend** — React 19 + Vite (outputs a static `dist/` bundle)
- **Backend** — Node.js + Express + TypeScript (compiled to JS, listens on port 3000)
- **Database** — PostgreSQL (via Prisma ORM)
- **Cache / Queues** — Redis
- **Payments** — Stripe
- **File storage** — Local disk or AWS S3

---

## Table of Contents

1. [Option 1: Render (Easiest — Free tier available)](#option-1-render-easiest--free-tier-available)
2. [Option 2: Railway (Simple — ~$5/month)](#option-2-railway-simple--5month)
3. [Option 3: Vercel (Frontend) + Railway/Render (Backend)](#option-3-vercel-frontend--railwayrender-backend)
4. [Option 4: VPS / DigitalOcean Droplet (Full Control)](#option-4-vps--digitalocean-droplet-full-control)
5. [Option 5: Docker Compose (Self-hosted or any VPS)](#option-5-docker-compose-self-hosted-or-any-vps)
6. [Option 6: AWS (Production Grade)](#option-6-aws-production-grade)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Pre-deployment Checklist](#pre-deployment-checklist)
9. [Generating JWT Key Pair](#generating-jwt-key-pair)
10. [Recommended Production Stack (Cost-effective)](#recommended-production-stack-cost-effective)

---

## Option 1: Render (Easiest — Free tier available)

Render manages infrastructure for you and is the fastest way to get the full stack running without any server administration.

### Frontend — Render Static Site

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and click **New → Static Site**.
2. Connect your GitHub repository.
3. Set the following:

   | Setting | Value |
   |---------|-------|
   | Root directory | `frontend` |
   | Build command | `npm run build` |
   | Publish directory | `dist` |

4. Add environment variables under **Environment**:

   ```
   VITE_API_URL=https://your-backend.onrender.com/api/v1
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

5. Add a `_redirects` file inside `frontend/public/` to support SPA client-side routing:

   ```
   /* /index.html 200
   ```

   Vite copies everything from `public/` into `dist/` at build time, so this file will be deployed automatically.

### Backend — Render Web Service

1. Click **New → Web Service** and connect the same repository.
2. Set the root directory to `backend`.
3. Configure the build and start commands:

   | Setting | Value |
   |---------|-------|
   | Build command | `npm install && npx prisma generate && npx tsc` |
   | Start command | `node dist/server.js` |

4. Add all required environment variables (see [Environment Variables Reference](#environment-variables-reference)).

### Managed PostgreSQL on Render

1. Click **New → PostgreSQL** in the Render dashboard.
2. Choose a plan (the free tier includes 90 days, paid tiers start at $7/month).
3. After creation, copy the **Internal Database URL** from the database's info page.
4. Set `DATABASE_URL` in your backend service to this URL.
5. Run migrations after the first deploy:

   ```bash
   # Trigger from Render Shell tab on the backend service
   npx prisma migrate deploy
   ```

   Alternatively, add the migration command as a pre-start step in a shell script:

   ```bash
   # start.sh (set as the start command on Render)
   npx prisma migrate deploy && node dist/server.js
   ```

### Managed Redis on Render

1. Click **New → Redis** and create a Redis instance.
2. Copy the **Internal Redis URL** and set it as `REDIS_URL` in your backend service.

---

## Option 2: Railway (Simple — ~$5/month)

Railway offers a unified dashboard where you can provision your backend, database, and Redis side-by-side with private networking between them.

### Deploying via Railway CLI

```bash
# Install the Railway CLI
npm install -g @railway/cli

# Authenticate
railway login

# Initialise a new project (run from repo root)
railway init

# Deploy the current directory
railway up
```

### Services to Create

From the Railway dashboard, add the following services to your project:

| Service | How to add |
|---------|------------|
| **Backend** | New Service → GitHub Repo (Railway auto-detects Node.js) |
| **PostgreSQL** | New Service → Database → Add PostgreSQL |
| **Redis** | New Service → Database → Add Redis |
| **Frontend** | New Service → GitHub Repo; set build command to `npm run build` and serve `dist/` via the built-in static hosting or an Nginx template |

### Connecting Services with Private Networking

Railway automatically injects connection variables into services when you link them. After adding PostgreSQL and Redis:

- `${{Postgres.DATABASE_URL}}` — reference this in your backend service's environment variables as `DATABASE_URL`.
- `${{Redis.REDIS_URL}}` — reference this as `REDIS_URL`.

### Key Railway Features

- **Automatic deploys** — every push to your configured branch triggers a new deploy.
- **Environment variable management** — variables are scoped per service and per environment (production / staging).
- **Private networking** — services communicate over Railway's internal network; database ports are not exposed to the public internet.
- **Usage-based billing** — you only pay for what you consume; small apps typically cost $5–$20/month.

---

## Option 3: Vercel (Frontend) + Railway/Render (Backend)

This split approach gives you Vercel's best-in-class CDN and edge network for the frontend while keeping the backend on a platform optimised for long-running Node.js processes.

### Frontend on Vercel

```bash
# Install the Vercel CLI
npm install -g vercel

# Deploy from the frontend directory
cd frontend
vercel --prod
```

During the setup wizard:
- **Framework preset** — Vite (auto-detected)
- **Build command** — `npm run build`
- **Output directory** — `dist`

Set the following environment variables in the Vercel dashboard under **Settings → Environment Variables**:

```
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Vercel automatically handles SPA routing for Vite projects — no `_redirects` file is required.

### Backend on Railway or Render

Deploy the backend following the instructions in [Option 1](#option-2-railway-simple--5month) or [Option 2](#option-2-railway-simple--5month).

After the backend is deployed, update the `VITE_API_URL` in Vercel to point to your backend's public URL and trigger a redeployment.

### Enabling CORS

In the backend's `.env`, set `CORS_ORIGIN` to your exact Vercel domain:

```env
CORS_ORIGIN=https://your-app.vercel.app
```

Once you attach a custom domain, update this value to match.

---

## Option 4: VPS / DigitalOcean Droplet (Full Control)

A VPS gives you complete control over every layer of the stack. These instructions target Ubuntu 22.04 LTS but apply to any Debian-based distribution.

### 1. Server Setup

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v   # should print v20.x.x
npm -v

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Enable Redis on startup
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Configure PostgreSQL

```bash
# Switch to the postgres system user
sudo -i -u postgres

# Create a database and user for the app
psql -c "CREATE USER marketplace WITH PASSWORD 'strong_password_here';"
psql -c "CREATE DATABASE marketplace_db OWNER marketplace;"
psql -c "GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO marketplace;"

exit
```

### 3. Deploy the Backend

```bash
# Clone your repository
git clone https://github.com/your-org/your-repo.git /var/www/marketplace
cd /var/www/marketplace/backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Compile TypeScript
npm run build

# Copy your production .env
cp .env.example .env
nano .env   # fill in all production values

# Start with PM2
pm2 start dist/server.js --name marketplace-api

# Persist PM2 across reboots
pm2 save
pm2 startup   # follow the printed instruction to register the systemd service
```

### 4. Deploy the Frontend

```bash
cd /var/www/marketplace/frontend

# Install dependencies
npm install

# Build for production
npm run build

# The output is in dist/ — Nginx will serve it directly
```

### 5. Nginx Configuration

Create a new site configuration:

```bash
sudo nano /etc/nginx/sites-available/marketplace
```

Paste the following, replacing `yourdomain.com` with your actual domain:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend — serve static files with SPA fallback
    location / {
        root /var/www/marketplace/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API — reverse proxy to Node.js
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Stripe webhook endpoint — no buffering
    location /api/v1/payments/webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_request_buffering off;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/marketplace /etc/nginx/sites-enabled/
sudo nginx -t        # verify config syntax
sudo systemctl reload nginx
```

### 6. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install certificate (replaces the HTTP block with HTTPS automatically)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot sets up automatic renewal; verify it works
sudo certbot renew --dry-run
```

### 7. Updating the Application

```bash
cd /var/www/marketplace

# Pull latest code
git pull origin main

# Backend update
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart marketplace-api

# Frontend update
cd ../frontend
npm install
npm run build
# Nginx serves dist/ directly — no reload needed
```

---

## Option 5: Docker Compose (Self-hosted or any VPS)

The repository already includes a `docker-compose.yml` at the project root. This is the fastest way to run the complete stack on any machine with Docker installed.

### Prerequisites

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # allow running docker without sudo (re-login after)

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin
docker compose version
```

### Build and Start All Services

```bash
cd /path/to/marketplace

# Copy and configure the backend environment file
cp backend/.env.example backend/.env
nano backend/.env   # fill in all production values

# Build images and start all containers in the background
docker compose up -d --build

# Check that all services are running
docker compose ps
```

### Run Database Migrations

```bash
# Run Prisma migrations inside the running backend container
docker compose exec backend npx prisma migrate deploy

# (Optional) Seed the database with initial data
docker compose exec backend npx prisma db seed
```

### docker-compose.yml Service Overview

| Service | Description | Port |
|---------|-------------|------|
| `backend` | Builds from `./backend`; runs the Node.js API | 3000 (internal) |
| `frontend` | Builds from `./frontend`; static files served by Nginx | 80 (internal) |
| `postgres` | Official `postgres:15` image; data persisted in a named volume | 5432 (internal) |
| `redis` | Official `redis:7-alpine` image | 6379 (internal) |
| `nginx` | Reverse proxy; routes `/api` to the backend, `/` to the frontend | 80, 443 (external) |

### Useful Commands

```bash
# View live logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend

# Restart a single service after a code change
docker compose up -d --build backend

# Stop everything (volumes are preserved)
docker compose down

# Stop everything AND delete volumes (destructive — deletes database data)
docker compose down -v
```

---

## Option 6: AWS (Production Grade)

For high-availability production workloads, AWS provides fully managed services for every component of the stack.

### Services Used

| Component | AWS Service | Notes |
|-----------|-------------|-------|
| Backend containers | ECS Fargate | Serverless containers — no EC2 to manage |
| Database | RDS PostgreSQL | Multi-AZ for high availability |
| Cache | ElastiCache (Redis) | Managed Redis cluster |
| Frontend hosting | S3 + CloudFront | Static files on S3; CloudFront as the CDN |
| Container registry | ECR | Stores Docker images |
| Load balancing | ALB (Application Load Balancer) | HTTPS termination; routes to ECS tasks |
| DNS | Route53 | Hosted zone for your domain |
| Secrets | AWS Secrets Manager | Stores `.env` values securely |

### High-Level Deployment Steps

#### Step 1 — Push Docker Images to ECR

```bash
# Authenticate Docker to ECR (replace REGION and ACCOUNT_ID)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS \
  --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and tag the backend image
docker build -t marketplace-backend ./backend
docker tag marketplace-backend:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/marketplace-backend:latest

# Push
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/marketplace-backend:latest
```

#### Step 2 — Create RDS PostgreSQL Instance

1. Open **RDS → Create database**.
2. Choose **PostgreSQL**, engine version 15.
3. Select **Multi-AZ DB instance** for production.
4. Place the instance in a private subnet group (no public access).
5. Note the endpoint hostname — this becomes the host part of `DATABASE_URL`.

#### Step 3 — Create ElastiCache Redis Cluster

1. Open **ElastiCache → Create cluster**.
2. Choose **Redis OSS**, cluster mode disabled (single shard is sufficient for most workloads).
3. Place the cluster in the same VPC and private subnets as RDS.
4. Note the **Primary Endpoint** — this becomes `REDIS_URL`.

#### Step 4 — Create the ECS Cluster and Task Definition

```bash
# Create the cluster
aws ecs create-cluster --cluster-name marketplace-cluster

# Register a task definition (JSON file approach)
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

The task definition should reference:
- Your ECR image URI.
- A `secrets` block pulling values from AWS Secrets Manager.
- CPU / memory appropriate for your expected load (512 CPU / 1024 MB is a good starting point).

#### Step 5 — Create the Application Load Balancer

1. Create an ALB in public subnets.
2. Add an HTTPS listener (port 443) using an ACM certificate for your domain.
3. Create a target group pointing to the ECS service.
4. Forward all traffic to the target group.

#### Step 6 — Deploy the Frontend to S3 + CloudFront

```bash
# Build the frontend
cd frontend
VITE_API_URL=https://api.yourdomain.com/api/v1 \
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... \
npm run build

# Sync the dist/ folder to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate the CloudFront cache after each deploy
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

Configure the S3 bucket for static website hosting and set the CloudFront distribution's **Default Root Object** to `index.html`. Add a **Custom Error Response** that redirects 403/404 errors to `/index.html` with a 200 status code to support SPA routing.

#### Step 7 — Configure Route53

1. Create an **A record** (alias) for `yourdomain.com` pointing to the CloudFront distribution.
2. Create an **A record** (alias) for `api.yourdomain.com` pointing to the ALB.

---

## Environment Variables Reference

### Backend `.env` (required for production)

```env
NODE_ENV=production
PORT=3000

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/dbname

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=redis://host:6379

# ── JWT / Auth ────────────────────────────────────────────────────────────────
# Generate with: openssl genrsa -out private.pem 2048
# See "Generating JWT Key Pair" section below for the exact format required
ACCESS_TOKEN_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
ACCESS_TOKEN_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
REFRESH_TOKEN_SECRET=your-very-long-random-secret-at-least-64-characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ── Stripe ────────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd

# ── Email (SMTP) ──────────────────────────────────────────────────────────────
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com

# ── File storage ──────────────────────────────────────────────────────────────
# Set to 's3' to use AWS S3 instead of local disk
STORAGE_DRIVER=local

# Required when STORAGE_DRIVER=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# ── App ───────────────────────────────────────────────────────────────────────
CORS_ORIGIN=https://yourdomain.com
```

### Frontend `.env.production`

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

> **Note:** Vite inlines environment variables at build time. The `VITE_` prefix is required for any variable you want accessible in the browser bundle. Never prefix server-side secrets with `VITE_`.

---

## Pre-deployment Checklist

### Security

- [ ] Generate a real RSA key pair for JWT signing (see below)
- [ ] Replace all placeholder secrets with strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Set `CORS_ORIGIN` to your exact frontend domain (no trailing slash)
- [ ] Enable HTTPS / SSL certificate on all public-facing endpoints
- [ ] Confirm database and Redis ports are **not** publicly exposed

### Stripe

- [ ] Switch to live-mode Stripe keys (`sk_live_...`, `pk_live_...`)
- [ ] Register the Stripe webhook endpoint in the Stripe Dashboard:
  `https://api.yourdomain.com/api/v1/payments/webhook`
- [ ] Copy the generated `STRIPE_WEBHOOK_SECRET` (`whsec_...`) into `.env`
- [ ] Test the full checkout flow end-to-end before going live

### Database

- [ ] Run `npx prisma migrate deploy` before the first application start
- [ ] Confirm the database user has only the privileges it needs (not a superuser)
- [ ] Set up automated database backups (daily minimum)
- [ ] Test a backup restore procedure

### Email

- [ ] Configure real SMTP credentials (SendGrid, Postmark, or AWS SES)
- [ ] Verify your sending domain (SPF / DKIM records)
- [ ] Send a test email from the deployed environment

### Operations

- [ ] Set up application logging and error monitoring (e.g. Sentry, Datadog)
- [ ] Configure uptime alerting
- [ ] Document the rollback procedure for failed deploys

---

## Generating JWT Key Pair

The backend uses RS256 asymmetric signing for access tokens. You must generate a 2048-bit RSA key pair and provide both keys in the backend `.env`.

```bash
# Generate the private key
openssl genrsa -out private.pem 2048

# Extract the public key
openssl rsa -in private.pem -pubout -out public.pem

# Convert to a single-line string suitable for .env
# (replaces literal newlines with the two-character sequence \n)
awk 'NF {sub(/\r/, ""); printf "%s\\n", $0;}' private.pem
awk 'NF {sub(/\r/, ""); printf "%s\\n", $0;}' public.pem
```

Copy the output of each `awk` command and paste it as the value of `ACCESS_TOKEN_PRIVATE_KEY` and `ACCESS_TOKEN_PUBLIC_KEY` respectively in your `.env` file.

> **Security reminder:** Never commit `private.pem` to source control. Add `*.pem` to your `.gitignore`.

---

## Recommended Production Stack (Cost-effective)

The following combination delivers a solid, fully managed production environment for a small-to-medium workload without requiring any server administration:

| Component | Provider | Estimated Cost |
|-----------|----------|---------------|
| Frontend (CDN + static hosting) | Vercel (Hobby / free tier) | $0/month |
| Backend API (Node.js web service) | Render Web Service | $7/month |
| PostgreSQL (managed database) | Render Managed PostgreSQL | $7/month |
| Redis (managed cache) | Render Redis | $10/month |
| **Total** | | **~$24/month** |

**Alternative — Railway all-in-one:**
Railway bundles backend, PostgreSQL, and Redis in a single project with private networking. For a small app, usage-based billing typically comes to **~$15–$20/month**.

As traffic grows, migrate the database to a dedicated provider such as Neon (PostgreSQL) or PlanetScale and consider moving the backend to ECS Fargate for horizontal scaling.
