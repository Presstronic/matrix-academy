# 🌌 Matrix Academy

_A choose-your-own-adventure journey into software mastery_

[![CI](https://github.com/Presstronic/matrix-academy/actions/workflows/ci.yml/badge.svg)](https://github.com/Presstronic/matrix-academy/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Presstronic/matrix-academy/actions/workflows/codeql.yml/badge.svg)](https://github.com/Presstronic/matrix-academy/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/Presstronic/matrix-academy/branch/main/graph/badge.svg)](https://codecov.io/gh/Presstronic/matrix-academy)
[![License: GPL-3.0-or-later](https://img.shields.io/badge/license-GPL--3.0--or--later-blue.svg)](./LICENSE.md)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)

---

## ✨ Overview

**Matrix Academy** is an interactive learning platform where developers sharpen their craft by navigating a branching, story‑driven adventure.
Rather than endless tutorials, every decision you make impacts your path—combining hands‑on coding, narrative challenges, and progression milestones.

> This document is intentionally lightweight and will expand as functionality lands.

---

## 🚀 Features

### ✅ Implemented

- 🔐 **Authentication System** — JWT-based authentication with refresh tokens, login/registration pages with form validation
- 🎨 **Frontend Application** — React 18 + Vite + Material-UI with responsive design and Matrix-themed UI
- 🏠 **Landing Page** — Hero section, features showcase, and call-to-action with WCAG 2.1 AA accessibility
- 📱 **Responsive Navigation** — Mobile-friendly header with conditional rendering based on auth state
- 🛣️ **Client-Side Routing** — React Router with protected routes and navigation
- 👥 **Multi-Tenancy** — Full tenant isolation at the database level
- 🛡️ **Role-Based Access Control (RBAC)** — Flexible permissions system
- ⚡ **Redis Caching** — HTTP response caching with automatic invalidation
- 📖 **API Documentation** — Interactive Swagger/OpenAPI docs at `/api/docs`
- 🎯 **Global Exception Handling** — Standardized error responses across all endpoints
- 🔄 **Response Transformation** — Consistent API response structure
- ✅ **Comprehensive Testing** — Unit and E2E test suites with coverage reporting
- 🐳 **Docker Support** — Multi-stage builds for development and production

### 🚧 In Progress

- 🧭 **Choose‑Your‑Own‑Adventure Flow** — learn by navigating story‑driven paths
- 🎯 **Skill Challenges** — complete coding puzzles to unlock the next stage
- 📚 **Modular Lessons** — self‑contained, replayable knowledge units
- 🔮 **Progression System** — track achievements and revisit alternate routes

---

## 🛠️ Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) + [TypeORM](https://typeorm.io/)
- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vite.dev/) + [Material UI v6](https://mui.com/)
- **Database**: PostgreSQL 17
- **Cache**: Redis 7
- **Authentication**: JWT + Refresh Tokens
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest (Unit & E2E)
- **Infrastructure**: Docker • (Kubernetes planned)

---

## 🧑‍🚀 Getting Started

### Option 1: Docker (Recommended)

The fastest way to get the full stack running with PostgreSQL and Redis:

```bash
# Clone the repo
git clone https://github.com/your-username/matrix-academy.git
cd matrix-academy

# Start the development environment
pnpm docker:dev:up
# OR: ./scripts/docker-dev.sh up

# View logs
pnpm docker:dev:logs

# Stop when done
pnpm docker:dev:down
```

**Services available:**

- Frontend Application: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

**Helper commands:**

```bash
pnpm docker:dev:up          # Start all services
pnpm docker:dev:down        # Stop all services
pnpm docker:dev:logs        # View all logs
pnpm docker:dev:restart     # Restart all services
pnpm docker:dev:clean       # Clean everything

# Or use the script directly for more options:
./scripts/docker-dev.sh help        # Show all commands
./scripts/docker-dev.sh logs-be     # Backend logs only
./scripts/docker-dev.sh shell-db    # PostgreSQL shell
./scripts/docker-dev.sh rebuild     # Rebuild containers
```

### Option 2: Local Development (Recommended for macOS)

Run services locally with databases in Docker for best hot-reload experience:

```bash
# Install dependencies
pnpm install

# Start only databases via Docker
docker compose up -d postgres redis

# Set up environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your configuration

# Run the dev servers locally
pnpm dev

# Or run frontend/backend separately:
pnpm --filter @matrix-academy/frontend dev  # Frontend on http://localhost:5173
pnpm --filter @matrix-academy/backend dev   # Backend on http://localhost:3000
```

> **Note**: Hot reload works better when running services locally on macOS due to Docker volume file-watching limitations. See [Database docs](./docs/DATABASE.md#hot-reload-in-docker-macos) for details.

### Frontend Development

The frontend application is built with:

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Material-UI (MUI)** v6 for UI components and theming
- **React Router** for client-side routing
- **Emotion** for CSS-in-JS styling

**Available Pages:**

- `/` — Landing page with hero section and features (public)
- `/login` — User authentication with form validation (public)
- `/register` — Account creation with comprehensive validation (public)
- `/dashboard` — User dashboard (protected, requires authentication)

**Key Features:**

- Responsive design across mobile, tablet, and desktop
- Custom Matrix-themed UI with green/black color scheme
- WCAG 2.1 AA accessibility compliance
- Form validation with real-time error feedback
- Conditional navigation based on authentication state

```bash
# Navigate to frontend directory
cd apps/frontend

# Install dependencies (if not already installed)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint

# Run tests
pnpm test
```

The frontend dev server runs on http://localhost:5173 with hot module replacement (HMR) enabled.

### Option 3: Docker Build (Production)

Build and run production-optimized Docker images:

```bash
# Build development image
docker build -f apps/backend/Dockerfile --target development -t matrix-academy-backend:dev .

# Build production image (optimized, ~383MB)
docker build -f apps/backend/Dockerfile --target production -t matrix-academy-backend:prod .

# Run production container
docker run -p 3000:3000 --env-file apps/backend/.env matrix-academy-backend:prod
```

> **Prerequisites:**
>
> - Docker & Docker Compose (Option 1 & 3)
> - Node 24+, pnpm 9+ (Option 2)
> - PostgreSQL 17+ and Redis 7+ (Option 2 only)

---

## 📚 Documentation

### Backend Documentation

- [Database Setup & Migrations](./docs/DATABASE.md) - PostgreSQL configuration, TypeORM migrations, and best practices
- [Security Configuration](./docs/SECURITY.md) - CORS, rate limiting, Helmet headers, and security best practices
- [Authorization & RBAC](./docs/AUTHORIZATION.md) - Role-based access control and permissions system
- [Caching Strategy](./docs/CACHING.md) - Redis caching implementation and invalidation patterns
- [API Conventions](./docs/API-CONVENTIONS.md) - Standard API response formats and conventions
- **API Documentation**: Interactive Swagger UI available at http://localhost:3000/api/docs when running locally

### Frontend Documentation

- [Accessibility Audit](./apps/frontend/ACCESSIBILITY_AUDIT.md) - WCAG 2.1 AA compliance report and testing recommendations

---

## 🧪 Testing

Run the test suites to ensure everything is working correctly:

```bash
# All tests (backend + frontend)
pnpm test

# Backend unit tests
pnpm --filter @matrix-academy/backend test

# Backend E2E tests
pnpm --filter @matrix-academy/backend test:e2e

# Frontend tests
pnpm --filter @matrix-academy/frontend test

# Tests with coverage
pnpm test:cov

# Watch mode for development
pnpm test:watch
```

**Test Coverage:**

- **Backend**: Unit and E2E tests for authentication, multi-tenancy, RBAC, caching, and API endpoints
- **Frontend**: Component tests for pages (Home, Login, Register, Dashboard), navigation (AppHeader, ProtectedRoute), and authentication context
- Overall coverage tracked via CodeCov

**Frontend Test Files:**

- `HomePage.test.tsx` — Landing page rendering and navigation
- `LoginPage.test.tsx` — Login form validation and submission
- `RegisterPage.test.tsx` — Registration form validation and account creation
- `AppHeader.test.tsx` — Responsive navigation and auth state handling
- `AuthContext.test.tsx` — Authentication state management
- `ProtectedRoute.test.tsx` — Route protection logic

---

## 🔐 Authentication

The application uses JWT-based authentication with refresh tokens, providing both API endpoints and user-facing pages.

### Frontend Pages

- **Landing Page** (`/`) — Public homepage with login/register CTAs
- **Registration** (`/register`) — Create account with validation (email, password, username required; firstName, lastName optional)
- **Login** (`/login`) — Authenticate with email and password
- **Profile** (`/profile`) — View and edit user profile (username, email, name, phone, bio)
- **Protected Routes** — Automatic redirect to login for unauthenticated users

### API Endpoints

**Authentication:**

1. **Register**: `POST /auth/register` - Create a new user account (requires: email, password, username; optional: firstName, lastName)
2. **Login**: `POST /auth/login` - Get access and refresh tokens
3. **Refresh**: `POST /auth/refresh` - Get a new access token
4. **Logout**: `POST /auth/logout` - Invalidate refresh token
5. **Get User**: `GET /auth/me` - Get current user information

**User Profile:** 6. **Update Profile**: `PATCH /users/profile` - Update user profile (email, username, firstName, lastName, phoneNumber, bio)

All endpoints (except public routes) require a valid JWT token in the `Authorization` header:

```bash
Authorization: Bearer <your-jwt-token>
```

Try it out in the Swagger UI at `/api/docs` with the "Authorize" button.

---

## 📍 Roadmap

- [ ] Core story engine
- [ ] First branching lesson paths
- [ ] Progression + achievements
- [ ] CI/CD pipeline
- [ ] Community contributions

---

## 🤝 Contributing

Not accepting contributions at this time.

- Code of Conduct: _coming soon_
- Contributing Guide: _coming soon_

---

## 📜 License

Distributed under the **GNU GPLv3 (or later)**. See [LICENSE.md](./LICENSE.md) for details.

---

Made with ❤️ on planet 🌍.
