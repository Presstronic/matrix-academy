# syntax=docker/dockerfile:1

# Base stage - common setup for all stages
FROM node:24-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Dependencies stage - install all dependencies with proper caching
FROM base AS dependencies

# Copy all workspace files needed for backend
COPY turbo.json ./
COPY tsconfig.base.json ./
COPY apps/backend ./apps/backend

# Mount pnpm store as cache for faster builds
# Install all dependencies including devDependencies (needed for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Development stage - with hot reload support
FROM dependencies AS development

# Set NODE_ENV
ENV NODE_ENV=development

# Expose the backend port
EXPOSE 3000

# Start the development server with hot reload
CMD ["pnpm", "--filter", "@matrix-academy/backend", "dev"]

# Build stage - compile TypeScript for production
FROM dependencies AS build

# Build the backend application
RUN pnpm --filter=@matrix-academy/backend build

# Production stage - minimal runtime image
FROM node:24-alpine AS production

# Install pnpm (only what's needed for production)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Set NODE_ENV
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy workspace configuration for production dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts --filter=@matrix-academy/backend

# Copy built application from build stage
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose the backend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "apps/backend/dist/main.js"]
