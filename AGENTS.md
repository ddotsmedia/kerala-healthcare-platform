# AGENTS.md — Cross-Agent Contract

> The single source of truth for **every** AI agent operating in this repository
> (Claude Code, OpenAI Codex, and any future agent).
> Agent-specific files ([CLAUDE.md](CLAUDE.md), [CODEX.md](CODEX.md)) defer to this file on any conflict.

---

## 1. Mission

Build and operate the **Kerala Health Portal** — a Kerala-first, Malayalam-first digital healthcare ecosystem that helps people **find verified care and trustworthy health information**. The platform guides; it never practises medicine.

---

## 2. Inviolable rules (ranked — higher wins on conflict)

1. **Patient safety first.** No clinical diagnosis. No treatment or prescription recommendation. Any health-risk situation redirects the user to a qualified professional and surfaces emergency numbers — Kerala emergency `112`, ambulance `108`.
2. **No fake medical claims.** Every health statement is verifiable, sourced, and editorially approved before publish.
3. **AI guides only.** The AI assistant informs and navigates. It never prescribes, diagnoses, or replaces a clinician. Every AI response recommends consulting a qualified professional and is labelled AI-generated.
4. **Verification mandatory.** No doctor or hospital is published without identity and registration verification (NMC registry cross-check for doctors).
5. **Privacy & compliance.** DPDP Act 2023 compliant. Patient data minimised, encrypted, access-controlled. See [docs/compliance/COMPLIANCE.md](docs/compliance/COMPLIANCE.md).
6. **Additive only.** Never delete files. Never drop tables or columns. Never destroy data. Inserts use `ON CONFLICT DO NOTHING`.
7. **Editorial approval gate.** Health content cannot be published by an authoring agent or `content_editor` alone — a publish role must approve.
8. **Protected neighbours.** Never touch these sibling VPS projects: `ayurconnect` · `ddots-erp` · `wa-crm` · `healthportal` · `ddotshop` · `ddotsmediajobs`.

---

## 3. Autonomy protocol

- Agents are **fully autonomous**: never pause, never ask, never wait for confirmation.
- On **ambiguity** → choose the best default consistent with this contract, log one line in [BLOCKERS.md](BLOCKERS.md) under `[ASSUMPTION]`, continue.
- On **error** → fix and continue; log under `[FIXED]`. Never halt.
- On a decision that **cannot** be auto-resolved (e.g. legal, irreversible, cross-project) → log under `[NEEDS DECISION]` and route around it; do not block other work.

---

## 4. Engineering standards

| Rule | Value |
|---|---|
| Language | JavaScript only — TypeScript forbidden (JSDoc for types) |
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS, mobile-first |
| DB | PostgreSQL 15+ — UUID PKs, soft-delete columns on every table |
| Cache/Queue | Redis 7+ / BullMQ |
| Package mgr | pnpm — no new packages unless zero alternative |
| File size | ≤ 400 lines per file |
| Function size | ≤ 50 lines |
| Nesting | ≤ 3 levels |
| SQL | Parameterised only — no string concatenation |
| Secrets | Never commit; environment variables only |

---

## 5. Localisation contract

- Default locale **`ml` (Malayalam)** for all new users; **`en`** secondary.
- Routes `/ml/...` and `/en/...`.
- Noto Sans Malayalam font — never fall back to a system font.
- Search must accept Malayalam script **and** Manglish (Roman transliteration).

---

## 6. Database safety

- Migrations: numbered plain-SQL files in `services/db/migrations/`, additive only.
- Every table has `id` (UUID), `created_at`, `updated_at`, `deleted_at`.
- Sensitive columns (mobile, email, DOB) encrypted at column level.
- Patient health records live in a separate schema with row-level security.
- Seed only via `pnpm db:seed:demo`. **Never** run `pnpm db:seed`.

---

## 7. AI assistant contract

- Model: `claude-haiku-20241022`. System prompt hardcoded; users cannot override it.
- Sanitise all user input before prompt inclusion (strip injection patterns).
- RAG: retrieve top 5 published, editorially-approved knowledge-base articles; cite sources in every response.
- Log every interaction to `ai_interaction_log`.
- Rate limit: 20 messages per user per hour.
- Full guardrails in [docs/ai-safety/AI_SAFETY.md](docs/ai-safety/AI_SAFETY.md).

---

## 8. Roles

| Role | Access |
|---|---|
| `patient` | Own data only |
| `doctor` | Own profile, own appointments |
| `hospital_admin` | Own hospital, staff, appointments |
| `content_editor` | CMS create/edit — **no publish** |
| `verification_agent` | Provider verification queue only |
| `platform_admin` | Full platform access |

---

## 9. Definition of done (per task)

- [ ] Obeys every rule in §2.
- [ ] Builds clean (`pnpm build`) and lints clean (`pnpm lint`).
- [ ] No TypeScript, no new packages (or logged in BLOCKERS.md).
- [ ] Additive only — nothing deleted or dropped.
- [ ] Assumptions/errors logged in BLOCKERS.md.
- [ ] Conventional commit after each phase.

---

## 10. Commit convention

```
<type>(<scope>): <subject>
type:  feat | fix | docs | style | refactor | perf | test | chore | ci
scope: auth | directory | appointments | cms | search | ai | jobs |
       notifications | admin | portal | db | ui | config
```

---

*This contract is binding on all agents. Agent-specific files defer here on conflict.*
*Kerala Health Portal · Cross-Agent Contract v1.0*
