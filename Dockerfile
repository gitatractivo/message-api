FROM node:20-slim as builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package*.json ./

RUN pnpm install

RUN pnpm run build

FROM node:20-slim

WORKDIR /app

# Install pnpm in production image
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package*.json ./

RUN pnpm install --only=production

COPY --from=builder /app/dist ./dist

# Copy necessary files for operation
COPY .env* ./
RUN mkdir -p logs

EXPOSE 3000

CMD ["pnpm", "start"]