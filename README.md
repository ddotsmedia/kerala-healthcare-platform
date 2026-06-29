# Kerala Health Portal

> Kerala-first digital healthcare ecosystem. Malayalam-first, English secondary. Built for millions of users, India-expansion ready.

[![CI](https://github.com/ddotsmedia/kerala-healthcare-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ddotsmedia/kerala-healthcare-platform/actions/workflows/ci.yml)

---

## What this is

A verified directory and patient services platform for Kerala healthcare: doctors, hospitals, appointments, a health knowledge centre, a healthcare jobs portal, and an AI guidance assistant.

**The platform guides. It never diagnoses, prescribes, or replaces a qualified healthcare professional.**

---

## Core principles

| Principle | Meaning |
|---|---|
| **No diagnosis** | No clinical diagnosis, no treatment recommendation — anywhere, ever. |
| **No fake claims** | No unverified medical claims in any copy, content, or UI. |
| **Malayalam-first** | Default locale `ml`. English (`en`) secondary. |
| **Kerala-first** | Built for Kerala first; architected to scale to India. |
| **Verification mandatory** | Every doctor and hospital verified before listing. |
| **AI guides only** | AI assistant never prescribes or diagnoses — always redirects to a professional. |
| **Editorial approval** | All health content passes editorial review before publish. |
| **Additive only** | Never delete or drop. Migrations and changes are additive. |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router) |
| Language | JavaScript only — TypeScript forbidden |
| Styling | Tailwind CSS (mobile-first) |
| Database | PostgreSQL 15+ |
| Cache | Redis 7+ |
| Search | PostgreSQL full-text → OpenSearch (Phase 5+) |
| Queue | BullMQ (Redis-backed) |
| Auth | Mobile OTP + JWT (15min) + Refresh token (30d, Redis-backed) |
| AI | Anthropic Claude API — `claude-haiku-20241022` |
| Storage | AWS S3 / Cloudflare R2 |
| Package manager | pnpm |
| CI/CD | GitHub Actions |

---

## Monorepo layout

```
kerala-healthcare-platform/
├── apps/
│   ├── web/          # Patient-facing public site
│   ├── portal/       # Doctor & hospital portal
│   └── admin/        # Internal admin dashboard
├── packages/
│   ├── ui/           # Shared React component library
│   ├── config/       # Shared ESLint, Tailwind configs
│   └── utils/        # Shared pure utility functions
├── services/
│   ├── auth/         # OTP, JWT, middleware
│   ├── db/           # PostgreSQL pool, migrations, seed
│   ├── cache/        # Redis helpers
│   ├── search/       # Search query builders
│   ├── notifications/ # SMS, email, templates
│   └── ai-assistant/ # Claude API, RAG, safety rails
├── infra/
│   ├── docker/
│   └── scripts/
├── docs/
│   ├── prd/          # Product requirements (MASTER_PRD.md)
│   ├── architecture/ # System design (ARCHITECTURE.md)
│   ├── security/     # Security model (SECURITY.md)
│   ├── compliance/   # DPDP Act 2023, healthcare (COMPLIANCE.md)
│   ├── ai-safety/    # AI guardrails (AI_SAFETY.md)
│   └── roadmap/      # Phase roadmap (ROADMAP.md)
├── README.md
├── CLAUDE.md         # Claude Code agent instructions
├── CODEX.md          # OpenAI Codex agent instructions
├── AGENTS.md         # Cross-agent contract
└── BLOCKERS.md       # Agent decision log
```

---

## AI-agent-ready repository

This repo is built to be operated by AI coding agents. Agent contracts:

- **[CLAUDE.md](CLAUDE.md)** — instructions for Claude Code.
- **[CODEX.md](CODEX.md)** — instructions for OpenAI Codex.
- **[AGENTS.md](AGENTS.md)** — shared contract all agents obey.
- **[BLOCKERS.md](BLOCKERS.md)** — agents log assumptions and decisions here instead of asking.

---

## Documentation

| Doc | Purpose |
|---|---|
| [docs/prd/MASTER_PRD.md](docs/prd/MASTER_PRD.md) | Product requirements & scope |
| [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) | System architecture |
| [docs/security/SECURITY.md](docs/security/SECURITY.md) | Security model & controls |
| [docs/compliance/COMPLIANCE.md](docs/compliance/COMPLIANCE.md) | DPDP Act 2023 & healthcare compliance |
| [docs/ai-safety/AI_SAFETY.md](docs/ai-safety/AI_SAFETY.md) | AI assistant guardrails |
| [docs/roadmap/ROADMAP.md](docs/roadmap/ROADMAP.md) | Delivery roadmap |

---

## Build commands

```bash
pnpm install          # install all dependencies
pnpm dev              # start all apps in dev mode
pnpm build            # build all apps and packages
pnpm lint             # lint all packages
pnpm test             # run all tests
pnpm db:migrate       # run pending migrations
pnpm db:seed:demo     # seed demo data (ONLY this — never db:seed)
```

---

## Status

**Phase 0 — Foundation.** Repository scaffolding only. No application code yet.

See [docs/roadmap/ROADMAP.md](docs/roadmap/ROADMAP.md) for phase plan.

---

## License

Proprietary. © Kerala Health Portal. All rights reserved.
