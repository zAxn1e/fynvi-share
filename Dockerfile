# syntax=docker/dockerfile:1

# Stage 1: Frontend dependencies
FROM oven/bun:1.3.14-slim AS frontend-dependencies
WORKDIR /opt/app/frontend
COPY --link frontend/package.json frontend/bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

# Stage 2: Build frontend
FROM oven/bun:1.3.14-slim AS frontend-builder
WORKDIR /opt/app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=1
COPY --link ./frontend .
COPY --link --from=frontend-dependencies /opt/app/frontend/node_modules ./node_modules
RUN --mount=type=cache,target=/opt/app/frontend/.next/cache bun run build

# Stage 3: Backend dependencies (build & dev tools)
FROM oven/bun:1.3.14-slim AS backend-dependencies
WORKDIR /opt/app/backend
COPY --link backend/package.json backend/bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

# Stage 4: Build backend
FROM oven/bun:1.3.14-slim AS backend-builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app/backend
COPY --link ./backend .
COPY --link --from=backend-dependencies /opt/app/backend/node_modules ./node_modules
RUN bunx prisma generate \
    && bun run build \
    && bunx tsc prisma/seed/config.seed.ts --outDir dist/prisma/seed --rootDir prisma/seed

# Stage 5: Backend clean production dependencies (Tier 1)
FROM oven/bun:1.3.14-slim AS backend-prod-dependencies
WORKDIR /opt/app/backend
COPY --link backend/package.json backend/bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --production --frozen-lockfile
COPY --link --from=backend-builder /opt/app/backend/node_modules/.prisma ./node_modules/.prisma

# Stage 6: Final runtime image
FROM oven/bun:1.3.14-slim AS runner
ENV NODE_ENV=docker

COPY --link --from=caddy:2 /usr/bin/caddy /usr/bin/caddy
COPY --link --from=mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/ffmpeg

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gosu \
    openssl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/* /var/tmp/*

WORKDIR /opt/app/frontend
COPY --link --from=frontend-builder /opt/app/frontend/public ./public
COPY --link --from=frontend-builder /opt/app/frontend/.next/standalone ./
COPY --link --from=frontend-builder /opt/app/frontend/.next/static ./.next/static
COPY --link --from=frontend-builder /opt/app/frontend/public/img /tmp/img

WORKDIR /opt/app/backend
COPY --link --from=backend-prod-dependencies /opt/app/backend/node_modules ./node_modules
COPY --link --from=backend-builder /opt/app/backend/dist ./dist
COPY --link --from=backend-builder /opt/app/backend/prisma ./prisma
COPY --link --from=backend-builder /opt/app/backend/package.json ./
COPY --link --from=backend-builder /opt/app/backend/tsconfig.json ./

WORKDIR /opt/app

COPY --link ./reverse-proxy /opt/app/reverse-proxy
COPY --link ./scripts/docker /opt/app/scripts/docker

# Normalize line endings (strip CR) and make scripts executable
RUN find ./scripts/docker -type f -name "*.sh" -exec sed -i 's/\r$//' {} + \
    && chmod +x ./scripts/docker/*.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=90s CMD /bin/sh -c '(if [ "$CADDY_DISABLED" = "true" ]; then curl -fs http://localhost:${BACKEND_PORT:-8080}/api/health; else curl -fs http://localhost:3000/api/health; fi) || exit 1'

ENTRYPOINT ["sh", "./scripts/docker/create-user.sh"]
CMD ["sh", "./scripts/docker/entrypoint.sh"]
