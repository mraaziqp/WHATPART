# WHATPART storefront. Built on the VPS by deploy.sh; runs behind Caddy on the "whatpart" network.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Lockfiles made on Windows can miss Linux-only optional packages; fall back to a full install.
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL=https://whatpart.africa
# Build-only placeholders: prisma.config.ts requires DATABASE_URL and better-auth warns without a
# secret while pages are collected. Neither is used at build time or copied into the run stage.
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    DATABASE_URL=postgresql://build:build@localhost:5432/build \
    BETTER_AUTH_SECRET=build-only-placeholder-not-used-at-runtime \
    NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npx next build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
# Fixed uid/gid so the host's uploads directory (/opt/whatpart/data/uploads) can be owned by it.
RUN addgroup -S -g 1001 app && adduser -S -u 1001 -G app app && mkdir -p /app/uploads && chown app:app /app/uploads
COPY --from=build /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
