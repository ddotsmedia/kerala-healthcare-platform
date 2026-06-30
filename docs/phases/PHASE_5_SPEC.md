# Phase 5 — AI Assistant & Platform Scale

**Duration:** 3 weeks
**Status:** ⬜ Not started
**Prerequisite:** Phase 4 complete and all smoke tests passing

---

## What This Phase Builds

- AI health assistant: RAG over curated knowledge base, Malayalam + English
- Unified smart search: natural language across all entity types
- Platform analytics dashboard (admin)
- Performance hardening: Redis caching layer, query optimisation
- Elasticsearch / OpenSearch integration for production search quality
- Rate limiting, abuse prevention, and security hardening
- Admin platform dashboard: KPIs, user growth, content metrics

---

## Phase 5 Deliverables

| Deliverable | Definition of Done |
|---|---|
| AI assistant live | User asks health question in Malayalam → gets relevant, disclaimed response |
| Smart search | Natural language query returns mixed results: doctors, hospitals, articles |
| No diagnosis in AI | Test: ask AI to diagnose → response redirects to professional consultation |
| Analytics dashboard | Admin sees: total users, bookings today, new providers, content published |
| Redis caching | Search results, slot availability, and static pages served from cache |
| Rate limits enforced | Exceeding API rate limit returns 429 with retry-after header |
| Load tested | 1,000 concurrent users on search endpoint — p95 latency under 500ms |

---

## Claude Code Prompt — Phase 5

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
PHASE: 5 — AI Assistant & Platform Scale
PREREQUISITE: Phase 4 complete and all smoke tests passing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add the AI Assistant, upgrade search quality, and harden the platform
for production scale. Every AI interaction is logged, governed, and
safe. No diagnosis. No treatment recommendations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 TASKS — execute in order, commit after each
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 5.1 — AI assistant service
services/ai-assistant/index.js — core assistant logic
  Model: claude-haiku-20241022 (haiku is default per Universal Prompt Law)
  Context: 5 most relevant knowledge base articles via RAG (pg full-text)
  System prompt (hardcoded, not user-overridable):
    "You are Kerala Healthcare Platform's health information assistant.
     You explain health topics in simple language.
     You NEVER diagnose medical conditions.
     You NEVER recommend specific treatments or medications.
     You ALWAYS recommend consulting a qualified healthcare professional.
     You respond in the same language as the user's message.
     If asked about an emergency, provide emergency contact numbers first.
     Kerala emergency: 112 | Ambulance: 108"
  buildPrompt(userMessage, ragContext, locale) — assembles final prompt
  sanitiseInput(text) — strip any prompt injection attempts
    (remove: "ignore instructions", "system:", "assistant:", etc.)
services/ai-assistant/rag.js
  findRelevantContent(query, limit=5)
  — full-text search on content_items WHERE status='published'
  — returns top 5 by ts_rank, includes source URL for citation
services/ai-assistant/logger.js
  logInteraction(sessionId, inputHash, response, model, ragSourceIds)
  — ai_interaction_log table (id, session_id, input_hash TEXT,
    response_length INT, model VARCHAR, rag_source_ids uuid[],
    locale VARCHAR(5), created_at TIMESTAMPTZ DEFAULT now())
• Commit: feat(ai): health assistant with RAG, safety rails, and interaction logging

TASK 5.2 — AI assistant API and UI
POST /api/ai/chat  { message, locale, sessionId }
  — rate limited: 20 messages per user per hour
  — returns { response, sources[], disclaimer }
  — disclaimer always: "This is health information, not medical advice."
GET  /api/ai/history/:sessionId — last 10 interactions for continuity
apps/web/src/app/[locale]/assistant/page.js
  — chat interface: message input, response display
  — source citations shown below each response
  — disclaimer banner pinned above input (not dismissable)
  — Emergency banner always visible: "Emergency? Call 112 or 108"
  — In Malayalam by default; auto-detected from user locale
• Commit: feat(ai): AI assistant chat interface with safety UI

TASK 5.3 — Unified smart search
services/search/unified.js
  smartSearch(query, userLocale, userLocation):
    Run in parallel:
      searchProviders(query)  — doctors, hospitals, clinics
      searchContent(query)    — articles, diseases, procedures
      searchJobs(query)       — job listings (if user is healthcare pro)
    Merge and rank results:
      Verified providers boosted 1.5x
      Content type labelled in result (doctor|hospital|article|disease|job)
      Locale-matched content boosted
    Return top 10 combined results with type and url
API: GET /api/search?q=&locale=&type= (type optional filter)
apps/web/src/app/[locale]/search/page.js
  — unified search results page with type filter tabs
  — Instant results on keystroke (debounce 300ms, no new packages)
• Commit: feat(search): unified smart search across all entity types

TASK 5.4 — Redis caching layer
services/cache/index.js — Redis get/set/del helpers with TTL
Cache strategy:
  searchProviders results: TTL 300s (5 min)
  searchContent results: TTL 600s (10 min)
  getAvailableSlots: TTL 60s (1 min)
  Doctor profile page data: TTL 3600s (1 hour)
  Hospital profile page data: TTL 3600s (1 hour)
Cache invalidation:
  On provider profile update → delete provider cache key
  On appointment booked → delete slot cache for that provider+date
  On content publish → delete content search cache
• Add cache hit/miss logging to structured logs
• Commit: feat(perf): Redis caching for search, slots, and profile pages

TASK 5.5 — Rate limiting (API-wide)
services/ratelimit/index.js — Redis-based sliding window counter
  rateLimitMiddleware(key, limit, windowSeconds)
Apply:
  All unauthenticated routes: 20 req/min per IP
  All authenticated routes: 100 req/min per user
  OTP send: 5 per mobile per 10 min (already in Phase 0 — verify)
  AI chat: 20 messages per user per hour
  Response on exceeded: 429 { error: "Rate limit exceeded",
    retryAfter: N } with Retry-After header
• Commit: feat(security): Redis-backed rate limiting on all API routes

TASK 5.6 — Admin analytics dashboard
apps/admin/src/app/analytics/page.js
Metrics (all from DB aggregation queries, cached 5 min):
  Users: total registered, new today, new this week
  Appointments: total confirmed, today's count, cancellation rate
  Providers: total verified, pending verification
  Content: total published, awaiting review
  Jobs: active listings, applications this week
  AI: total interactions today, top query topics
• No external analytics package — plain SQL aggregates
• Commit: feat(admin): platform analytics dashboard

TASK 5.7 — Security hardening
• Helmet.js security headers (already available via Next.js config — use
  next.config.js headers() — no new package)
• CORS: restrict to own domain + explicitly allowed origins in env var
• Input validation: zod-free — add simple validate() helper in
  packages/utils/validate.js checking type, length, and format per field
• SQL injection audit: scan all db query files for string concatenation
  — fix any found, add ESLint rule to prevent future occurrences
• Dependency audit: pnpm audit — fix all high/critical vulnerabilities
• OWASP check: manually verify Top 10 items against the codebase,
  log findings in docs/security/owasp-checklist.md
• Commit: feat(security): security hardening — headers, CORS, input validation, audit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMOKE TESTS — verify before closing session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ AI: ask "What causes diabetes?" in Malayalam → relevant response, source cited
□ AI: ask "Diagnose me" → response declines, recommends professional
□ AI: ask about emergency → 112/108 numbers appear in response
□ Smart search: query "heart doctor kochi" → cardiologist + hospital results
□ Smart search: Malayalam query returns relevant results
□ Redis cache: second identical search request faster than first
□ Rate limit: 21st unauthenticated request per minute → 429 returned
□ Admin analytics dashboard loads under 2 seconds
□ pnpm audit — zero high or critical vulnerabilities
```
