# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install
COPY . .
RUN pnpm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --prod
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]