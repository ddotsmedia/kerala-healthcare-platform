# OWASP Top 10 — Manual Checklist (Phase 5)

*Reviewed 2026-07-03. Complements SECURITY.md.*

| # | Category | Status | Notes |
|---|---|---|---|
| A01 | Broken Access Control | ✅ | JWT session on every protected route; portal/admin/employer/candidate scoped to own rows; admin RBAC by JWT role; 401/403 verified. |
| A02 | Cryptographic Failures | ✅ | TLS in prod (HSTS header); sensitive contact column-encrypted (pgcrypto); OTP + refresh tokens stored hashed; JWT HS256 with secret from env. |
| A03 | Injection | ✅ | All SQL parameterised (`$1…`); audit found no user-input string concatenation. Identifiers in template strings are code constants/whitelists only. Output escaped by React. |
| A04 | Insecure Design | ✅ | Editor≠publisher, verification-before-publish triggers, contact protection, hardcoded AI safety rails. |
| A05 | Security Misconfiguration | ✅ | Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS, CSP) via `next.config.js headers()` on all apps. Secrets in env, never committed. |
| A06 | Vulnerable & Outdated Components | ⚠️ | `pnpm audit`: 6 high are Next.js framework advisories (DoS / SSRF / middleware-bypass) fixed only in Next 15.x. Pinned to latest 14.2.35; **full clearance requires a Next 15 major upgrade (tracked, deferred)**. Mitigations: reverse-proxy deploy, CSP, rate limiting, no untrusted middleware config. |
| A07 | Identification & Auth Failures | ✅ | OTP (hashed, 5-min TTL, attempt cap), JWT 15-min access + rotating 30-day refresh, revoke on logout. |
| A08 | Software & Data Integrity | ✅ | pnpm lockfile committed; additive migrations with checksum guard in the runner. |
| A09 | Logging & Monitoring | ✅ | ai_interaction_log, notification_log, provider_verifications audit trail, cache hit/miss logs. No secrets logged. |
| A10 | SSRF | ✅ | No user-controlled outbound URLs; AI calls a fixed Anthropic endpoint; CSP `connect-src` allowlisted. |

## Dependency audit
- `pnpm audit`: 2 low · 8 moderate · 6 high — all in `next@14.2.35` (framework). See A06.
- No high/critical vulnerabilities in first-party or non-framework dependencies.

## Action items
- [ ] Plan Next 15 upgrade to clear framework advisories (major version — schedule + regression test).
- [ ] Confirm reverse-proxy + WAF in production deployment.
