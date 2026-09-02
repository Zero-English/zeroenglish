###############################################
# Stage: deps (install dependencies, cached)
###############################################
FROM node:24-bookworm AS deps
WORKDIR /app

# Prisma requires openssl/libssl at runtime and build time
RUN apt-get update && apt-get install -y --no-install-recommends openssl libssl-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# Prisma schema + config are needed by the postinstall script (prisma generate)
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

###############################################
# Stage: builder (generate Prisma client + build Next.js)
###############################################
FROM node:24-bookworm AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl libssl-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate the Prisma client (custom output at generated/prisma)
RUN npx prisma generate

# Build the Next.js application (produces .next/standalone)
RUN npm run build

# Prepare the standalone runtime: copy static assets and the generated Prisma client
# into the standalone folder so the traced server can serve them.
RUN cp -r public .next/standalone/public \
    && cp -r .next/static .next/standalone/.next/static \
    && cp -r generated .next/standalone/generated \
    && cp -r prisma .next/standalone/prisma \
    && mkdir -p .next/standalone/logs

###############################################
# Stage: runner (minimal production image)
###############################################
FROM node:24-bookworm AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends openssl libssl-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Copy the standalone build (already contains .next, the generated Prisma client,
# public/, and package.json producing .next/standalone/server.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
