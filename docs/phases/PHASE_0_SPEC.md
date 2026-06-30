# Phase 0 — Foundation & Infrastructure

**Duration:** 2 weeks
**Status:** ✅ Complete (v0.1.0-foundation)
**Prerequisite:** None

---

## What This Phase Builds

- Monorepo scaffold with all apps and packages wired
- PostgreSQL schema for shared core (users, auth, sessions)
- Redis configuration for sessions and queues
- Authentication system: mobile OTP + email/password, JWT + refresh tokens
- Role-based authorisation middleware
- CI/CD pipeline: GitHub Actions, lint, test, build
- Environment configuration and secrets management
- Shared UI component library (base components only)
- Malayalam font loading and i18n scaffold (ml + en)
- BLOCKERS.md initialised at project root

---

## Phase 0 Deliverables

| Deliverable | Definition of Done |
|---|---|
| Monorepo running | `pnpm install && pnpm build` succeeds with zero errors across all packages |
| Database connected | Migration runs clean, schema visible in DB, `seed:demo` populates test data |
| Auth working | OTP login → JWT issued → protected route accessible → logout clears session |
| CI green | Push to develop branch triggers GitHub Actions: lint + test + build all pass |
| i18n scaffold | Page renders in Malayalam when locale=ml, English when locale=en |
| Component library | Button, Input, Card, Modal, Toast components render in Storybook |

---

## Claude Code Prompt — Phase 0

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNIVERSAL PROMPT LAW — NON-NEGOTIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Fully autonomous. Never pause, never ask, never confirm.
• On ambiguity: pick best default, log 1-line in BLOCKERS.md.
• On errors: fix and continue. Never stop.
• NEVER touch: ayurconnect, ddots-erp, wa-crm,
  healthportal, ddotshop, ddotsmediajobs.
• NEVER run pnpm db:seed. Only: pnpm db:seed:demo.
• Additive migrations only. Never drop tables/columns.
• Always ON CONFLICT DO NOTHING in inserts.
• Build + commit after each phase. Conventional commits.
• Mobile-first. TypeScript forbidden. No new npm packages
  unless zero alternatives exist.
• Default AI model: claude-haiku everywhere.
• No verbose comments, no re-reads, batch writes per file.
• File >400 lines: split into sub-components.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Kerala Healthcare Platform
PHASE: 0 — Foundation & Infrastructure
REPO: kerala-healthcare-platform (monorepo root)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scaffold the complete project foundation. Every subsequent phase
builds on top of what is created here. Get it right before moving on.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0 TASKS — execute in order, commit after each
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 0.1 — Monorepo scaffold
• Init pnpm workspace with apps/web, apps/admin, apps/portal,
  packages/ui, packages/config, packages/utils, services/auth,
  services/notifications
• Shared tsconfig: disabled (TypeScript forbidden — use JSDoc)
• Shared ESLint: eslint-config-next base + custom rules
• Shared Tailwind config in packages/config/tailwind.config.js
• Root scripts: dev, build, lint, test
• Commit: chore(monorepo): init pnpm workspace scaffold

TASK 0.2 — Database foundation
• PostgreSQL connection via pg pool in services/db/index.js
• Migration runner: plain SQL files in services/db/migrations/
• Migration 0001: create users table
  (id uuid PK, mobile VARCHAR(15) UNIQUE, email VARCHAR(255),
   name_ml TEXT, name_en TEXT, role VARCHAR(50) DEFAULT 'patient',
   locale VARCHAR(5) DEFAULT 'ml', is_active BOOLEAN DEFAULT true,
   created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ,
   deleted_at TIMESTAMPTZ)
• Migration 0002: create sessions table
  (id uuid PK, user_id uuid FK users, refresh_token TEXT UNIQUE,
   device_info JSONB, ip_address INET, expires_at TIMESTAMPTZ,
   created_at TIMESTAMPTZ DEFAULT now())
• Migration 0003: create audit_log table
  (id uuid PK, user_id uuid, action VARCHAR(100), entity VARCHAR(100),
   entity_id uuid, meta JSONB, ip_address INET,
   created_at TIMESTAMPTZ DEFAULT now())
• pnpm db:seed:demo: insert 3 test users (patient, doctor, admin roles)
• Commit: feat(db): foundation schema — users, sessions, audit_log

TASK 0.3 — Authentication service
• services/auth/otp.js — generate 6-digit OTP, store in Redis (TTL 10min)
• services/auth/jwt.js — sign access token (15min), refresh token (30 days)
• services/auth/middleware.js — verify JWT, attach user to request
• API routes in apps/web/src/app/api/auth/:
  POST /api/auth/otp/send     — send OTP to mobile
  POST /api/auth/otp/verify   — verify OTP, return tokens
  POST /api/auth/refresh      — rotate refresh token
  POST /api/auth/logout       — invalidate refresh token in Redis
• Rate limit: 5 OTP requests per mobile per 10 minutes (Redis counter)
• Account lockout: 5 failed verifications → 10 minute lockout
• Commit: feat(auth): OTP authentication with JWT + refresh token rotation

TASK 0.4 — Authorisation middleware
• packages/utils/rbac.js — role definitions and permission map
  Roles: patient | doctor | hospital_admin | content_editor |
         verification_agent | platform_admin
• withRole(roles) middleware — returns 403 if role not in list
• withOwnership(entity) middleware — returns 404 if user does not own resource
• Commit: feat(auth): RBAC middleware with role and ownership guards

TASK 0.5 — i18n scaffold
• packages/utils/i18n.js — simple key-value loader for ml/en JSON files
• packages/ui/locales/ml.json and en.json — empty objects, ready to populate
• useTranslation() hook in packages/ui/hooks/useTranslation.js
• Locale detection: URL prefix (/ml/... or /en/...) with ml as default
• Commit: feat(i18n): Malayalam-first i18n scaffold with ml/en locale support

TASK 0.6 — Base UI component library
• packages/ui/components/:
  Button (variants: primary, secondary, ghost, danger; sizes: sm, md, lg)
  Input (label, error state, Malayalam placeholder support)
  Card (header, body, footer slots)
  Modal (trap focus, close on Escape)
  Toast (success, error, warning, info — auto-dismiss 4s)
  Spinner (sizes: sm, md, lg)
  Badge (variants: verified, pending, inactive)
• All components mobile-first. No TypeScript. JSDoc for prop types.
• Commit: feat(ui): base component library — Button, Input, Card, Modal, Toast

TASK 0.7 — CI/CD pipeline
• .github/workflows/ci.yml:
  Trigger: push to any branch, PR to develop or main
  Jobs: install → lint → test → build
  Node version: 20 LTS
  pnpm caching enabled
• .github/workflows/deploy-staging.yml:
  Trigger: push to develop
  Job: build → deploy to staging environment
• Commit: ci: GitHub Actions pipeline for lint, test, build, and staging deploy

TASK 0.8 — Environment configuration
• .env.example at repo root with all required variables:
  DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET,
  OTP_SMS_GATEWAY_URL, OTP_SMS_API_KEY,
  ANTHROPIC_API_KEY, NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE
• services/config/index.js — validated config loader (throws on missing vars)
• Commit: chore(config): environment variable scaffold and validated config loader

TASK 0.9 — BLOCKERS.md initialisation
• Create BLOCKERS.md at repo root with header template
• Add to .gitignore: .env (not .env.example)
• Commit: chore: init BLOCKERS.md and gitignore

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMOKE TESTS — verify before closing session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ pnpm build — zero errors
□ pnpm lint  — zero errors
□ pnpm test  — all pass
□ POST /api/auth/otp/send with valid mobile → 200
□ POST /api/auth/otp/verify with correct OTP → JWT returned
□ GET /api/protected with valid JWT → 200
□ GET /api/protected with expired JWT → 401
□ pnpm db:seed:demo — runs without error
□ Database has users, sessions, audit_log tables
□ BLOCKERS.md exists at repo root
```
