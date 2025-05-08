FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

# i am using pnpm instead of npm for the project so do i need to install pnpm? 


RUN pnpm install

RUN pnpm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN pnpm install --only=production

COPY --from=builder /app/dist ./dist

# Copy necessary files for operation
COPY .env* ./
RUN mkdir -p logs

EXPOSE 3000

CMD ["pnpm", "start"]