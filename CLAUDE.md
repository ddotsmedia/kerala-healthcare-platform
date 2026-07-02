# Kerala Health Portal — Claude Code Instructions

> This file is read automatically by Claude Code at the start of every session.
> Do not delete or rename this file.

---

## Project

**Name:** Kerala Health Portal
**Path:** `c:\websites\kerala-healthcare-platform`
**Type:** Kerala-first Digital Healthcare Ecosystem
**Scale:** Millions of users · Enterprise-grade · India expansion ready

---

## Universal Prompt Law — Non-Negotiable

These rules apply to every task, every file, every session. No exceptions.

- **Fully autonomous.** Never pause, never ask, never confirm.
- **On ambiguity:** pick best default, log 1-line assumption in `BLOCKERS.md`.
- **On errors:** fix and continue. Never stop.
- **NEVER touch other VPS projects:** `ayurconnect` · `ddots-erp` · `wa-crm` · `healthportal` · `ddotshop` · `ddotsmediajobs`
- **NEVER run** `pnpm db:seed` — only safe command is `pnpm db:seed:demo`
- **Additive migrations only.** Never drop tables or columns.
- **Always** `ON CONFLICT DO NOTHING` in inserts.
- **Build + commit after each phase.** Conventional commits.
- **Mobile-first.** TypeScript forbidden. No new npm packages unless zero alternatives exist.
- **Default AI model:** `claude-haiku-20241022` everywhere.
- **Minimal token usage:** no verbose comments, no re-reads, batch writes per file.
- **File > 400 lines:** split into sub-components immediately.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router) |
| Language | JavaScript only — TypeScript forbidden |
| Styling | Tailwind CSS (mobile-first) |
| Database | PostgreSQL 15+ |
| Cache | Redis 7+ |
| Search | PostgreSQL full-text (Phase 0–4) → OpenSearch (Phase 5+) |
| Queue | BullMQ (backed by Redis) |
| Auth | Mobile OTP + JWT (15min) + Refresh token (30 days, Redis-backed) |
| AI | Anthropic Claude API — `claude-haiku-20241022` default |
| Storage | AWS S3 or Cloudflare R2 |
| Package manager | pnpm |
| CI/CD | GitHub Actions |

---

## Monorepo Structure

```
c:\websites\kerala-healthcare-platform\
├── apps/
│   ├── web/          # Next.js — patient-facing public site
│   ├── portal/       # Next.js — doctor & hospital portal
│   └── admin/        # Next.js — internal admin dashboard
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
│   └── architecture/
├── CLAUDE.md         ← this file
└── BLOCKERS.md       ← auto-updated by Claude Code each session
```

---

## Languages

- **Primary:** Malayalam (`ml`)
- **Secondary:** English (`en`)
- Default locale for all new users: `ml`
- Font: Noto Sans Malayalam — never fallback to system font
- URL pattern: `/ml/...` and `/en/...` — `ml` is default
- Search must support both Malayalam script and Manglish (Roman transliteration)

---

## Database Rules

- All primary keys: UUID (`uuid_generate_v4()`)
- All tables include: `id`, `created_at`, `updated_at`, `deleted_at` (soft delete)
- Migrations: plain SQL files in `services/db/migrations/` — numbered sequentially
- **Never drop tables or columns** — additive only
- **Always** `ON CONFLICT DO NOTHING` in seed inserts
- Sensitive fields (mobile, email, DOB) encrypted at column level
- PHR (patient health records) in separate schema with RLS

---

## API Rules

- All routes: `/api/v1/...`
- Response envelope: `{ data, meta, errors }`
- All list endpoints paginated: `?page=1&limit=20`
- All endpoints authenticated unless explicitly public
- Public endpoints rate-limited (20 req/min per IP)
- Authenticated endpoints rate-limited (100 req/min per user)

---

## Roles

| Role | Access |
|---|---|
| `patient` | Own data only |
| `doctor` | Own profile, own appointments |
| `hospital_admin` | Own hospital, staff, appointments |
| `content_editor` | CMS create/edit — no publish |
| `verification_agent` | Provider verification queue only |
| `platform_admin` | Full platform access |

---

## Healthcare Constraints — Always Enforced

- **No clinical diagnosis** in any feature, copy, or UI — ever.
- **No treatment recommendations** — always redirect to professional consultation.
- All health content pages must show a **non-dismissable medical disclaimer.**
- AI responses must always recommend consulting a qualified healthcare professional.
- AI emergency responses must include: Kerala emergency `112` · Ambulance `108`
- All AI-generated content labelled as AI-generated.
- Patient data: DPDP Act 2023 compliance required.
- Doctor profiles: cross-check registration against NMC registry.

---

## AI Assistant Rules

- Model: `claude-haiku-20241022` (never upgrade without explicit instruction)
- System prompt is **hardcoded** — user cannot override it
- All user input sanitised before inclusion in prompts (strip injection patterns)
- Every interaction logged: `ai_interaction_log` table
- RAG: retrieve top 5 published knowledge base articles before generating response
- Sources cited in every response
- Rate limit: 20 messages per user per hour

---

## SEO Rules

- Doctor profile URL: `/doctors/dr-[firstname]-[lastname]-[specialty]-[district]`
- Hospital profile URL: `/hospitals/[name]-[district]`
- Slugs are **permanent** once published — never change
- Schema.org structured data required: `Physician`, `Hospital`, `MedicalWebPage`, `JobPosting`
- Every page: unique `<title>` (under 60 chars) and `<meta description>` (under 160 chars)
- Lighthouse SEO score ≥ 90 on all directory pages

---

## Coding Standards

- **No TypeScript** — JavaScript + JSDoc for type hints where needed
- **No new npm packages** unless zero alternatives exist — log in BLOCKERS.md if added
- **No magic numbers** — name all constants
- **No commented-out code** — use feature flags instead
- **No raw string concatenation in SQL** — parameterised queries only
- File max: 400 lines — split beyond that
- Function max: 50 lines — extract beyond that
- Nesting max: 3 levels — flatten beyond that

---

## Commit Convention

```
<type>(<scope>): <subject>

Types:  feat | fix | docs | style | refactor | perf | test | chore | ci
Scopes: auth | directory | appointments | cms | search | ai | jobs |
        notifications | admin | portal | db | ui | config
```

Examples:
```
feat(directory): add availability calendar to doctor profile
fix(appointments): prevent double-booking on concurrent slot requests
perf(search): add GIN index on provider name tsvector column
feat(ai): add RAG context retrieval for health assistant
```

---

## BLOCKERS.md Convention

Claude Code writes to `BLOCKERS.md` autonomously. It is the **only** permitted
substitute for asking a question. Never ask — always log and continue.

```
## Session: [date] [task or phase]

### Assumptions
- [ASSUMPTION] ...

### Errors fixed
- [FIXED] ...

### Needs human decision
- [NEEDS DECISION] ...
```

---

## Build Commands

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

## Phase Status

Update this section at the end of each phase.

| Phase | Name | Status | Git Tag |
|---|---|---|---|
| 0 | Foundation & Infrastructure | ✅ Complete | — |
| 1 | Healthcare Directory | ✅ Complete | v0.2.0-directory |
| 2 | Appointments & Patient Portal | ✅ Complete | v0.3.0-appointments |
| 3 | Health Knowledge Centre | ✅ Complete | v0.4.0-knowledge |
| 4 | Healthcare Jobs Portal | ✅ Complete | v0.5.0-jobs |
| 5 | AI Assistant & Platform Scale | ⬜ Not started | — |

---

## Environment Variables Required

```env
# Database
DATABASE_URL=

# Redis
REDIS_URL=

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=

# SMS Gateway
OTP_SMS_GATEWAY_URL=
OTP_SMS_API_KEY=

# Email
SES_SMTP_HOST=
SES_SMTP_USER=
SES_SMTP_PASS=

# AI
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEFAULT_LOCALE=ml

# Storage
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

---

## Key Contacts & External Services

| Service | Purpose | Notes |
|---|---|---|
| NMC Registry | Doctor verification | Cross-check registration numbers |
| Kerala SMS Gateway | OTP + notifications | Primary; Twilio as fallback |
| AWS SES | Email notifications | Transactional only |
| Anthropic API | AI health assistant | Haiku model only |

---

*Last updated: Phase 0 — Foundation complete (repo scaffolding, agent contracts, governance docs)*
*Kerala Health Portal · Claude Code Engineering Kit v1.0*
