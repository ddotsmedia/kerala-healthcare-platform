# P-B8 — Salary Benchmarking

**Track:** Track B — Jobs Portal
**Priority:** 🟡 High
**Project:** malayalidoctor.com (kerala-healthcare-platform)
**VPS:** 194.164.151.202

---

## How to execute

1. Open Claude Code in VS Code
2. First message: `Read CLAUDE.md and confirm rules`
3. Second message: paste everything from the line below

---

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
• Build + commit after each task. Conventional commits.
• Mobile-first. TypeScript forbidden. No new npm packages
  unless zero alternatives exist.
• Default AI model: claude-haiku everywhere.
• No verbose comments, no re-reads, batch writes per file.
• File >400 lines: split into sub-components.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Kerala Healthcare Platform — malayalidoctor.com
FEATURE: P-B8 — Salary Benchmarking
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Show salary ranges by role/specialty/district based
on actual job listing data. High SEO value.
"Nurse salary Kerala", "Doctor salary Kochi" etc.

NO NEW SCHEMA — query from job_listings.

AGGREGATION SERVICE
services/jobs/salary.js:
  getSalaryBenchmark(role_category, specialty_id, district_id):
    SELECT
      role_category,
      specialty_id,
      district_id,
      PERCENTILE_CONT(0.25) WITHIN GROUP
        (ORDER BY salary_min) as p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP
        (ORDER BY salary_min) as median,
      PERCENTILE_CONT(0.75) WITHIN GROUP
        (ORDER BY salary_min) as p75,
      AVG(salary_min) as avg_min,
      AVG(salary_max) as avg_max,
      COUNT(*) as sample_size
    FROM job_listings
    WHERE salary_min IS NOT NULL
      AND status = 'active'
      AND deleted_at IS NULL
    GROUP BY role_category, specialty_id, district_id
  
  Cache results: Redis TTL 6 hours

PAGES
apps/web/app/[locale]/jobs/salary-guide/page.js
  — "Healthcare Salary Guide — Kerala"
  — Role category tabs: Doctors · Nurses ·
    Allied Health · Administration
  — Salary table by specialty + experience level
  — District comparison: same role, different pay
  — Disclaimer: "Based on job listings on
    MalayaliDoctor. Actual salaries may vary."
  — Schema.org: SpecialAnnouncement or FAQPage
    for SEO ("What is nurse salary in Kerala?")

API ROUTE
GET /api/jobs/salary?role=&specialty=&district=

Add salary info to job listing pages:
  "Salary range for this role in [District]:
  ₹[P25]–₹[P75]/month based on [N] listings"

Smoke tests:
  Salary guide page renders with data
  Role filter changes displayed salaries
  District comparison works
  API returns correct percentile data


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPLOY TO VPS AFTER COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SSH into 194.164.151.202
cd /opt/kerala-healthcare-platform
git pull origin main
docker compose -f infra/docker/docker-compose.prod.yml \
  --env-file .env.production up -d --build
Verify: curl -I https://malayalidoctor.com/ml/[new-route]
Report: commit hash, migration count, live URL check.
```
