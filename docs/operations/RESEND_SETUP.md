# Resend Domain Verification — malayalidoctor.com

Transactional email (OTP, notifications) is sent via the Resend HTTP API
(`services/notifications/email.js`). Resend only delivers from a **verified
domain**, so the DNS records below must be live before real email works.

## 1. DNS records to add in Hostinger

Add these in Hostinger → Domains → malayalidoctor.com → DNS / Nameservers.
Copy the exact DKIM value from the Resend dashboard (Domains → Add Domain).

| Type | Name/Host | Value | Priority |
|------|-----------|-------|----------|
| TXT  | `resend._domainkey` | `[DKIM value from Resend]` | — |
| MX   | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
| TXT  | `send` | `v=spf1 include:amazonses.com ~all` | — |

> Notes
> - Hostinger appends the root domain automatically — enter the host as
>   `resend._domainkey` and `send` (not the fully-qualified name).
> - DNS can take up to a few hours to propagate. Resend re-checks automatically.

## 2. Verify in Resend

1. Resend dashboard → Domains → malayalidoctor.com → **Verify**.
2. Wait until DKIM + SPF + MX all show **Verified** (green).

## 3. Environment variables (`.env.production`)

```env
RESEND_API_KEY=re_xxxxxxrealkeyxxxxxx      # or reuse SES_SMTP_PASS (must start re_)
EMAIL_FROM=no-reply@malayalidoctor.com     # MUST be on the verified domain
EMAIL_FROM_NAME=Kerala Health Portal
EMAIL_VERIFIED_DOMAIN=malayalidoctor.com   # optional; used only for a startup warning
```

If `EMAIL_FROM` is not on the verified domain, `email.js` logs a warning and
Resend rejects the send with a 403.

## 4. Test

```bash
# From the VPS, with .env.production sourced:
node --input-type=module -e "import {sendEmail} from '@khp/notifications'; \
  console.log(await sendEmail('admin@malayalidoctor.com','Resend test','<p>It works.</p>'));"
# Expect: { status: 'sent' }
```

Then confirm the message arrives in the inbox (and Resend dashboard → Emails).

## Status

- [ ] DKIM/SPF/MX added in Hostinger
- [ ] Domain verified in Resend
- [ ] `.env.production` updated with real `RESEND_API_KEY` + verified `EMAIL_FROM`
- [ ] Test email delivered to a real inbox

Until the above are ticked, `sendEmail` returns `status: 'simulated'` (no key)
or `failed` (unverified domain), and the app continues without blocking.
