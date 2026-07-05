# P-H1 — SMS Gateway & Email Verification

**Track:** Track H — Infrastructure
**Priority:** 🔴 Critical
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
FEATURE: P-H1 — SMS Gateway & Email Verification
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Wire Fast2SMS for OTP once Indian SIM available.
Verify Resend domain for email delivery.

TASK 1 — Fast2SMS (when API key available)
services/notifications/sms.js update:
  Current: simulated SMS
  Replace with real Fast2SMS API call:
  
  async function sendOTP(mobile, otp, locale) {
    const response = await fetch(
      process.env.OTP_SMS_GATEWAY_URL,
      {
        method: 'POST',
        headers: {
          'authorization': process.env.OTP_SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: mobile,
          flash: 0
        })
      }
    );
    const result = await response.json();
    if (result.return === false) {
      throw new Error(result.message);
    }
    return result;
  }

  Test: send OTP to verified Indian mobile

TASK 2 — Resend Domain Verification
  Add to docs/operations/RESEND_SETUP.md:
  DNS records to add in Hostinger:
  TXT resend._domainkey [DKIM value from Resend]
  MX send feedback-smtp.us-east-1.amazonses.com 10
  TXT send v=spf1 include:amazonses.com ~all

  After adding DNS, verify in Resend dashboard.
  Then test: send email to admin@malayalidoctor.com

  Update services/notifications/email.js:
  Verify FROM address is from verified domain.

Smoke tests:
  SMS OTP delivered to Indian mobile
  Email OTP delivered to Gmail/Yahoo
  Both within 30 seconds of request


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
