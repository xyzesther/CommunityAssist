FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies first (better layer caching)
COPY api/package.json api/package-lock.json ./
RUN npm ci

# Copy app code
COPY api/ ./

# Generate Prisma client
RUN npx prisma generate

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD curl -fsS "http://localhost:8080/health" || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "index.js"]
