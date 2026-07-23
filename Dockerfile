FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies required for Prisma and Playwright
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package definitions
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Generate Prisma Client
RUN pnpm --filter @repo/db generate

# Build the API
RUN pnpm --filter api build

# Install Playwright dependencies specifically for Chromium
RUN npx playwright install --with-deps chromium

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Start the API
WORKDIR /app/apps/api
CMD ["npm", "run", "start"]
