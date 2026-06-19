# Multi-stage build for production
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && cp -r node_modules /tmp/prod_modules
RUN npm ci

# Build
FROM deps AS builder
COPY . .
RUN npm run db:generate
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 marketplace

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=/tmp/prod_modules /tmp/prod_modules ./node_modules

RUN chown -R marketplace:nodejs /app
USER marketplace

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.js"]
