# syntax=docker/dockerfile:1
FROM node:24-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN --mount=type=secret,id=proxy_ca \
    NODE_EXTRA_CA_CERTS=${NODE_EXTRA_CA_CERTS:-/run/secrets/proxy_ca} npm ci
COPY frontend/ ./
RUN VITE_API_URL=/backend npm run build

FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN --mount=type=secret,id=proxy_ca \
    NODE_EXTRA_CA_CERTS=${NODE_EXTRA_CA_CERTS:-/run/secrets/proxy_ca} npm ci

COPY . .

RUN --mount=type=secret,id=proxy_ca \
    NODE_EXTRA_CA_CERTS=${NODE_EXTRA_CA_CERTS:-/run/secrets/proxy_ca} npx --no-install prisma generate --config prisma7.config.ts
RUN npm run build


FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN --mount=type=secret,id=proxy_ca \
    NODE_EXTRA_CA_CERTS=${NODE_EXTRA_CA_CERTS:-/run/secrets/proxy_ca} npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=frontend /app/frontend/dist ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts

EXPOSE 3000

CMD ["sh", "-c", "npx --no-install prisma migrate deploy --config prisma7.config.ts && node dist/src/main.js"]
