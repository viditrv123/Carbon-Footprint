# EcoTrack — Carbon Footprint Tracker

A full-stack monorepo application for tracking, understanding, and reducing personal carbon footprints.

## Architecture

```
carbon-footprint/
├── apps/
│   ├── api/          # NestJS REST API (port 3001)
│   └── web/          # Next.js 14 frontend (port 3000)
├── packages/
│   └── types/        # Shared TypeScript types & emission factors
├── docker-compose.yml
└── turbo.json
```

### Database: PostgreSQL
Chosen for relational integrity (users → activities → categories), excellent time-series query support via indexing, and ACID guarantees. Prisma provides type-safe ORM access.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (15m access + 7d refresh tokens), bcrypt (rounds=12) |
| Validation | Zod (FE), class-validator (BE) |
| Testing | Jest, React Testing Library, Supertest |

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9
- Docker & Docker Compose

### 1. Clone & install
```bash
cd carbon-footprint
cp .env.example .env          # fill in secrets
pnpm install
```

### 2. Start the database
```bash
docker-compose up -d postgres
```

### 3. Run database migrations & seed
```bash
pnpm db:migrate
pnpm db:seed
```

### 4. Start development servers
```bash
pnpm dev
# API → http://localhost:3001/api/v1
# Web → http://localhost:3000
# Swagger → http://localhost:3001/docs
```

### Demo credentials
```
Email:    demo@carbonfootprint.app
Password: Password123!
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout |
| GET | /users/me | Get profile |
| PATCH | /users/me | Update profile |
| POST | /activities | Log activity |
| GET | /activities | Activity history (paginated) |
| DELETE | /activities/:id | Delete activity |
| GET | /dashboard | Dashboard stats |
| GET | /insights | Personalized insights |

Full Swagger docs at `/docs`.

## Carbon Categories & Emission Factors

| Category | Examples | Unit |
|----------|---------|------|
| Transportation | Petrol car (0.21 kg/km), EV (0.053 kg/km), Flight | km |
| Home Energy | Electricity (0.233 kg/kWh), Natural gas (2.04 kg/m³) | kWh/m³ |
| Food | Beef (27 kg/kg), Chicken (6.9 kg/kg), Vegetables (2 kg/kg) | kg |
| Shopping | Electronics (0.03/USD), Clothing (0.009/USD) | USD |
| Waste | Landfill (0.58 kg/kg), Recycling (−0.12 kg/kg saved) | kg |

Sources: IPCC, Our World in Data, UK DEFRA emission factors.

## Security

- JWT access tokens (15m expiry) + refresh tokens (7d, stored in DB, single-use rotation)
- bcrypt password hashing (cost factor 12)
- Helmet.js security headers
- Rate limiting: 3 req/min on register, 5 req/min on login
- `class-validator` whitelist + `forbidNonWhitelisted` on all DTOs
- Parameterized queries via Prisma (SQL injection prevention)
- CORS configured to frontend origin only
- Zod schema validation on all frontend forms

## Testing

```bash
# Backend unit tests
pnpm --filter api test

# Backend coverage
pnpm --filter api test:coverage

# Frontend component tests
pnpm --filter web test

# Backend E2E (requires running DB)
pnpm --filter api test:e2e
```

## Accessibility

- WCAG 2.1 AA target
- All interactive elements have proper `aria-label` or visible labels
- `role="alert"` on error messages, `role="status"` on success messages
- `aria-current="page"` on active navigation links
- `aria-pressed` on toggle buttons (category filters)
- `aria-invalid` + `aria-describedby` on form inputs with errors
- `role="progressbar"` / `role="meter"` on progress indicators
- `role="group"` + `aria-label` on button groups
- Keyboard navigable with visible focus rings (`:focus-visible`)
- Screen-reader-only decorative elements marked `aria-hidden`
- Skip-to-main content via `id="main-content"`

## Project Structure

### Backend (`apps/api/src/`)
```
auth/           JWT auth, registration, login, refresh, logout
users/          Profile management
activities/     Carbon activity logging + CarbonCalculatorService
dashboard/      Aggregate stats, weekly trend, goal progress
insights/       Personalized tips, global comparison
prisma/         PrismaService (global module)
```

### Frontend (`apps/web/src/`)
```
app/
  page.tsx                    Landing page
  (auth)/login|register       Auth pages
  (dashboard)/
    dashboard/                Stats, charts, streak
    log/                      2-step activity logger
    history/                  Paginated activity list
    insights/                 Tips & global comparison
    profile/                  Account settings
components/
  ui/           Button, Card, Input, Badge
  charts/       AreaChart (trend), PieChart (categories)
  layout/       Sidebar (desktop), MobileNav (mobile)
  dashboard/    StatCard with animations
contexts/       AuthContext (JWT management)
lib/            api.ts (fetch wrapper), utils.ts
```
