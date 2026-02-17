# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then \
    yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi


# ---- Stage 2: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 🔥 IMPORTANT: Declare build arg
ARG NEXT_PUBLIC_API_URL

# 🔥 Make it available to Next.js during build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Skip env validation during build (env may not be fully available)
ENV SKIP_ENV_VALIDATION=1

# Optional: Debug (you can remove later)
RUN echo "Building with API URL: $NEXT_PUBLIC_API_URL"

RUN npm run build


# ---- Stage 3: Production ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# NEXT_PUBLIC_API_URL is set at runtime via Dokploy environment variables
# e.g. NEXT_PUBLIC_API_URL=https://api.netkrida.cloud
# Do NOT hardcode it here — it must be injected by the container runtime

CMD ["node", "server.js"]
