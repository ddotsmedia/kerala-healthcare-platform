# P-H6 — Malayalam Voice Search

**Track:** Track H — Infrastructure
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
FEATURE: P-H6 — Malayalam Voice Search
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Malayalam voice search using Web Speech API.
Users can speak their query — no typing needed.

NO NEW SCHEMA.
NO NEW PACKAGES — Web Speech API is native browser.

VOICE SEARCH SERVICE
packages/ui/components/VoiceSearch.js (client):
  Uses window.SpeechRecognition (webkit prefix fallback)
  lang: 'ml-IN' (Malayalam India)
  English fallback: 'en-IN'
  
  UI: microphone button on search bar
  States: idle → listening → processing → result
  Visual: animated mic icon while listening
  Error: "Voice search not supported" on unsupported browsers

INTEGRATION
  Add VoiceSearch button to:
  — Homepage search bar
  — /ml/doctors search bar
  — /ml/hospitals search bar
  — /ml/symptoms search bar
  
  On result: populate search input with transcript
  and auto-submit search

BROWSER SUPPORT NOTE
  Works in: Chrome, Edge, Safari
  Not supported in: Firefox, older browsers
  Graceful degradation: hide mic button if
  SpeechRecognition not available

Smoke tests:
  Mic button appears on search bar
  Click → browser requests microphone permission
  Speak "cardiologist in kochi" → search executes
  Unsupported browser: mic button hidden


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
