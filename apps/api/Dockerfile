# Stage 1: Base image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 2: Pruner
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
# Prune the workspace for the api app
RUN turbo prune --scope=api --docker

# Stage 3: Builder
FROM base AS builder
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=pruner /app/out/full/ .
# Generate Prisma Client
RUN pnpm --filter @repo/db generate
# Build the API
RUN pnpm --filter api build

# Stage 4: Runner
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=builder /app .

CMD ["node", "apps/api/dist/index.js"]
