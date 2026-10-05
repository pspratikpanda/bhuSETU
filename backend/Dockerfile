# ==========================================
# bhuSETU Backend — Multi-stage Dockerfile
# ==========================================

# ── Build Stage ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Production Stage ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root system user for security
RUN addgroup -S bhusetu && adduser -S bhusetu -G bhusetu

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Ensure app directory permissions
RUN chown -R bhusetu:bhusetu /app

USER bhusetu

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "src/server.js"]
