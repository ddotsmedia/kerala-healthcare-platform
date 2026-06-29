# Security — Kerala Health Portal

*Status: Phase 0. Additive edits only.*

This document defines the security model. It complements [COMPLIANCE.md](../compliance/COMPLIANCE.md) (legal/regulatory) and [AI_SAFETY.md](../ai-safety/AI_SAFETY.md) (AI guardrails).

---

## 1. Security principles

- **Least privilege.** Every role gets the minimum access needed (roles in [AGENTS.md](../../AGENTS.md) §8).
- **Defense in depth.** No single control is the only barrier.
- **Secure by default.** Endpoints authenticated unless explicitly public.
- **Data minimisation.** Collect only what is needed; isolate health data.
- **Auditability.** Sensitive actions (verification, publish, data export) are logged.
- **Additive only.** Security migrations never drop or weaken existing protections.

---

## 2. Authentication

- **Mobile OTP** primary login. OTPs short-lived, single-use, rate-limited.
- **JWT access token**: 15-minute lifetime.
- **Refresh token**: 30 days, stored server-side in Redis, revocable on logout / suspicion.
- Tokens signed with secrets from environment variables (`JWT_SECRET`, `JWT_REFRESH_SECRET`) — never committed.

---

## 3. Authorization

- Role-based access control enforced server-side on every request.
- Patients access **own data only**. Doctors access **own** profile/appointments. Hospital admins scoped to **own** hospital.
- **Editorial separation of duties:** `content_editor` can create/edit but **cannot publish**; publishing requires a publish-capable role.
- Provider listing requires `verification_agent` / `platform_admin` approval.

---

## 4. Data protection

- **In transit:** TLS everywhere.
- **At rest:** database and backups encrypted.
- **Column-level encryption** for sensitive fields: mobile, email, date of birth.
- **PHR isolation:** patient health records in a separate schema protected by **row-level security**.
- **Soft delete** (`deleted_at`) preserves audit trail; hard deletion handled only through the compliance-approved DPDP deletion flow.

---

## 5. Input handling

- **Parameterised SQL only** — no string concatenation, ever.
- Validate and sanitise all user input at the boundary.
- **AI prompt-injection defense:** strip injection patterns from any user input before it enters a model prompt; system prompt is hardcoded and non-overridable.
- Output encoding to prevent XSS in rendered content.

---

## 6. Rate limiting & abuse

- Public endpoints: 20 req/min per IP.
- Authenticated endpoints: 100 req/min per user.
- AI assistant: 20 messages per user per hour.
- OTP request throttling to prevent SMS-bombing and enumeration.

---

## 7. Secrets management

- All secrets via environment variables (see [CLAUDE.md](../../CLAUDE.md) env list).
- Never commit secrets. `.env*` is git-ignored.
- Rotate credentials on exposure; refresh tokens revocable.

---

## 8. Provider verification (trust integrity)

- Mandatory verification before any doctor/hospital is public.
- Doctor registration numbers cross-checked against the **NMC registry**.
- Verification actions logged with actor, timestamp, and evidence reference.

---

## 9. Logging & audit

- Audit trail for: provider verification, content publish, role changes, data export/deletion, AI interactions (`ai_interaction_log`).
- No secrets or full sensitive values written to logs.

---

## 10. Dependency & supply chain

- **No new npm packages** unless zero alternative (logged in BLOCKERS.md) — shrinks attack surface.
- CI runs lint and tests on every push/PR (see `.github/workflows/ci.yml`).
- Pin and review dependencies; prefer first-party utilities in `packages/utils`.

---

## 11. Incident response (baseline)

1. Contain (revoke tokens / disable affected role or endpoint).
2. Assess scope (audit logs, affected data).
3. Notify per DPDP Act 2023 obligations (see [COMPLIANCE.md](../compliance/COMPLIANCE.md)).
4. Remediate and log under `[FIXED]` / `[NEEDS DECISION]` in BLOCKERS.md.

---

## 12. Reporting a vulnerability

Report suspected vulnerabilities privately to the platform security contact. Do not open public issues for security matters.

---

*Security model v1.0 · additive edits only.*
