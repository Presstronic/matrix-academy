# 🌌 Matrix Academy

_A choose-your-own-adventure journey into software mastery_

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](./)
[![License: GPL-3.0-or-later](https://img.shields.io/badge/license-GPL--3.0--or--later-blue.svg)](./LICENSE.md)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

---

## ✨ Overview

**Matrix Academy** is an interactive learning platform where developers sharpen their craft by navigating a branching, story‑driven adventure.
Rather than endless tutorials, every decision you make impacts your path—combining hands‑on coding, narrative challenges, and progression milestones.

> This document is intentionally lightweight and will expand as functionality lands.

---

## 🚀 Features (In Progress)

- 🧭 **Choose‑Your‑Own‑Adventure Flow** — learn by navigating story‑driven paths
- 🎯 **Skill Challenges** — complete coding puzzles to unlock the next stage
- 📚 **Modular Lessons** — self‑contained, replayable knowledge units
- 🔮 **Progression System** — track achievements and revisit alternate routes

---

## 🛠️ Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) + [TypeORM](https://typeorm.io/)
- **Frontend**: [React](https://react.dev/) + [Material UI](https://mui.com/)
- **Database**: PostgreSQL
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

- Backend API: http://localhost:3000
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

### Option 2: Local Development

Run services locally without Docker:

```bash
# Install dependencies
pnpm install

# Set up environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your local database/redis configuration

# Start PostgreSQL and Redis (via Docker or local install)
# Then run the dev server
pnpm dev
```

> **Prerequisites:**
>
> - Docker & Docker Compose (Option 1)
> - Node 24+, pnpm 9+ (Option 2)
> - PostgreSQL 17+ and Redis 7+ (Option 2 only)

---

## 📚 Documentation

- [Database Setup & Migrations](./docs/DATABASE.md) - PostgreSQL configuration, TypeORM migrations, and best practices

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
