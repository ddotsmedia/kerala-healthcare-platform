# OWASP Top 10 — Manual Checklist (Phase 5)

*Reviewed 2026-07-03. Complements SECURITY.md.*

| # | Category | Status | Notes |
|---|---|---|---|
| A01 | Broken Access Control | ✅ | JWT session on every protected route; portal/admin/employer/candidate scoped to own rows; admin RBAC by JWT role; 401/403 verified. |
| A02 | Cryptographic Failures | ✅ | TLS in prod (HSTS header); sensitive contact column-encrypted (pgcrypto); OTP + refresh tokens stored hashed; JWT HS256 with secret from env. |
| A03 | Injection | ✅ | All SQL parameterised (`$1…`); audit found no user-input string concatenation. Identifiers in template strings are code constants/whitelists only. Output escaped by React. |
| A04 | Insecure Design | ✅ | Editor≠publisher, verification-before-publish triggers, contact protection, hardcoded AI safety rails. |
| A05 | Security Misconfiguration | ✅ | Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS, CSP) via `next.config.js headers()` on all apps. Secrets in env, never committed. |
| A06 | Vulnerable & Outdated Components | ✅ | **Upgraded to Next.js 15.5.20 (2026-07-03, commit e31c31f).** The 6 framework high advisories (DoS / SSRF / middleware-bypass) are resolved — `pnpm audit` now reports **0 high/critical**, 1 moderate. No high/critical in first-party deps. |
| A07 | Identification & Auth Failures | ✅ | OTP (hashed, 5-min TTL, attempt cap), JWT 15-min access + rotating 30-day refresh, revoke on logout. |
| A08 | Software & Data Integrity | ✅ | pnpm lockfile committed; additive migrations with checksum guard in the runner. |
| A09 | Logging & Monitoring | ✅ | ai_interaction_log, notification_log, provider_verifications audit trail, cache hit/miss logs. No secrets logged. |
| A10 | SSRF | ✅ | No user-controlled outbound URLs; AI calls a fixed Anthropic endpoint; CSP `connect-src` allowlisted. |

## Dependency audit
- `pnpm audit` (post Next 15 upgrade, 2026-07-03): **0 high · 0 critical · 1 moderate**. The 6 previous highs (all `next@14.2.x`) are cleared by `next@15.5.20`.
- No high/critical vulnerabilities in any dependency.

## Action items
- [x] Next 15 upgrade to clear framework advisories — DONE (commit e31c31f); build + lint green, smoke passed.
- [ ] Confirm reverse-proxy + WAF in production deployment.
