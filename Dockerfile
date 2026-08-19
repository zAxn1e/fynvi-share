# Stage 1: Frontend dependencies
FROM oven/bun:1-alpine AS frontend-dependencies
WORKDIR /opt/app
COPY frontend/package.json frontend/bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 2: Build frontend
FROM oven/bun:1-alpine AS frontend-builder
WORKDIR /opt/app
COPY ./frontend .
COPY --from=frontend-dependencies /opt/app/node_modules ./node_modules
RUN --mount=type=cache,target=/opt/app/.next/cache bun run build

# Stage 3: Backend dependencies
FROM oven/bun:1-alpine AS backend-dependencies
RUN apk add --no-cache python3 make g++
WORKDIR /opt/app
COPY backend/package.json backend/bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 4: Build backend
FROM oven/bun:1-alpine AS backend-builder
RUN apk add --no-cache openssl

WORKDIR /opt/app
COPY ./backend .
COPY --from=backend-dependencies /opt/app/node_modules ./node_modules
RUN bunx prisma generate \
    && bun run build \
    && bunx tsc prisma/seed/config.seed.ts --outDir dist/prisma/seed --rootDir prisma/seed \
    && bun install --production

# Stage 5: Final image
FROM oven/bun:1-alpine AS runner
ENV NODE_ENV=docker

RUN apk add --no-cache curl caddy su-exec openssl ffmpeg

WORKDIR /opt/app/frontend
COPY --from=frontend-builder /opt/app/public ./public
COPY --from=frontend-builder /opt/app/.next/standalone ./
COPY --from=frontend-builder /opt/app/.next/static ./.next/static
COPY --from=frontend-builder /opt/app/public/img /tmp/img

WORKDIR /opt/app/backend
COPY --from=backend-builder /opt/app/node_modules ./node_modules
COPY --from=backend-builder /opt/app/dist ./dist
COPY --from=backend-builder /opt/app/prisma ./prisma
COPY --from=backend-builder /opt/app/package.json ./
COPY --from=backend-builder /opt/app/tsconfig.json ./

WORKDIR /opt/app

COPY ./reverse-proxy  /opt/app/reverse-proxy
COPY ./scripts/docker ./scripts/docker

# Normalize line endings (strip CR) and make scripts executable
RUN find ./scripts/docker -type f -name "*.sh" -exec sed -i 's/\r$//' {} + \
    && chmod +x ./scripts/docker/*.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=90s CMD /bin/sh -c '(if [[ "$CADDY_DISABLED" = "true" ]]; then curl -fs http://localhost:${BACKEND_PORT:-8080}/api/health; else curl -fs http://localhost:3000/api/health; fi) || exit 1'

ENTRYPOINT ["sh", "./scripts/docker/create-user.sh"]
CMD ["sh", "./scripts/docker/entrypoint.sh"]
