# P-E5 — Disease Encyclopedia Expansion

**Track:** Track E — Knowledge & Content
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
FEATURE: P-E5 — Disease Encyclopedia Expansion
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Expand from 12 disease pages to 200+.
Structured content for every major disease.

NO SCHEMA CHANGE — uses existing disease_details.
Expand seed data significantly.

CONTENT EXPANSION
Seed 100 additional diseases via seed-prod.sh:
  Organised by category:
  Cardiovascular (15): heart attack, hypertension,
    heart failure, arrhythmia, valve disease...
  Diabetes & Endocrine (10): T1, T2, thyroid,
    PCOD, Cushing's...
  Respiratory (10): asthma, COPD, pneumonia,
    TB, COVID-19...
  Neurological (10): stroke, Parkinson's,
    epilepsy, migraine, dementia...
  Cancer (10): breast, lung, colon, cervical,
    prostate, blood...
  Gastrointestinal (10): GERD, IBS, hepatitis,
    cirrhosis, Crohn's...
  Musculoskeletal (10): arthritis, osteoporosis,
    back pain, gout, fibromyalgia...
  Mental Health (10): depression, anxiety,
    bipolar, schizophrenia, PTSD...
  Women's Health (10): PCOS, endometriosis,
    fibroids, ovarian cysts, menopause...
  Infectious (10): dengue, typhoid, malaria,
    leptospirosis, hepatitis B...
  Paediatric (5): RSV, kawasaki, intussusception...

All with: symptoms, causes, risk factors,
  diagnosis, treatment, prevention, emergency signs
  in Malayalam and English

DISEASE A-Z INDEX UPGRADE
apps/web/app/[locale]/diseases/page.js
  — A-Z index with count per letter
  — Category filter
  — Search by symptom → related diseases

Smoke tests:
  Disease count in DB > 100 after seed
  A-Z index renders all entries
  Category filter works


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
