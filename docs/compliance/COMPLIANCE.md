# Compliance — Kerala Health Portal

*Status: Phase 0. Additive edits only.*
*This document is operational guidance, not legal advice. Confirm with qualified counsel before launch.*

---

## 1. Scope

Regulatory and ethical obligations for a healthcare platform operating in Kerala, India:

- **DPDP Act 2023** (Digital Personal Data Protection Act) — personal & health data.
- **Healthcare practice boundaries** — no diagnosis, no prescription, no medical claims.
- **Provider authenticity** — NMC registry cross-checks.
- **Content integrity** — editorial approval of all health information.

---

## 2. DPDP Act 2023 — data protection

### 2.1 Lawful basis & consent
- Collect personal data only with **clear, informed, revocable consent**.
- Consent requests in **Malayalam and English**, in plain language.
- Separate, explicit consent for sensitive health data (PHR).

### 2.2 Data minimisation & purpose limitation
- Collect only data needed for the stated purpose.
- No secondary use without fresh consent.

### 2.3 Data principal rights
- **Access** — user can view their data.
- **Correction** — user can correct inaccurate data.
- **Erasure** — user can request deletion (compliance-approved hard-delete flow; soft delete is not sufficient for erasure requests).
- **Grievance redressal** — published contact and response process.

### 2.4 Security safeguards
- Encryption in transit and at rest; column-level encryption for mobile/email/DOB.
- PHR isolated in a separate schema with row-level security.
- Access logged and least-privilege (see [SECURITY.md](../security/SECURITY.md)).

### 2.5 Breach notification
- Detect, contain, assess, and notify affected data principals and the Data Protection Board within DPDP-required timelines.

### 2.6 Children's data
- Extra protection for minors; verifiable parental consent where applicable; no behavioural tracking of children.

---

## 3. Healthcare practice boundaries

| Rule | Enforcement |
|---|---|
| **No clinical diagnosis** | No feature, copy, or UI states what condition a user has. |
| **No treatment/prescription advice** | Always redirect to a qualified professional. |
| **Non-dismissable medical disclaimer** | Shown on every health content page. |
| **Emergency redirect** | AI and content surface Kerala emergency `112` and ambulance `108`. |
| **AI-generated labelling** | All AI output labelled as AI-generated. |

These boundaries are also enforced in the AI layer — see [AI_SAFETY.md](../ai-safety/AI_SAFETY.md).

---

## 4. Provider verification & authenticity

- **Mandatory verification** before any doctor or hospital is listed publicly.
- **NMC registry cross-check** of doctor registration numbers.
- Verification evidence retained and audit-logged.
- Misrepresentation → delist + audit record.

---

## 5. Content governance

- All health content authored under editorial workflow.
- **Separation of duties:** `content_editor` creates/edits; a publish-capable role approves and publishes.
- Sources cited; claims verifiable; no unverified medical claims.
- Versioned content with audit trail of who approved and when.

---

## 6. Medical disclaimer (canonical text intent)

Every health page must carry a **non-dismissable** disclaimer conveying:

> This information is for general awareness only. It is not a medical diagnosis or treatment advice. Always consult a qualified healthcare professional. In an emergency call **112** or ambulance **108**.

Provided in Malayalam (primary) and English.

---

## 7. Records & retention

- Retain only as long as necessary for the stated purpose or legal requirement.
- Soft delete preserves audit trail; DPDP erasure requests trigger compliant hard deletion.
- Audit logs retained per policy and protected from tampering.

---

## 8. Compliance checklist (per release)

- [ ] No new diagnosis/prescription capability introduced.
- [ ] All new health content passed editorial publish approval.
- [ ] Consent flows present and revocable for any new data collection.
- [ ] New sensitive fields encrypted and access-controlled.
- [ ] Provider listings verified (NMC cross-check for doctors).
- [ ] Disclaimers present on all health pages.
- [ ] DPDP data-principal rights still satisfiable.

---

## 9. Open compliance items

Tracked in [BLOCKERS.md](../../BLOCKERS.md) under `[NEEDS DECISION]` — e.g. final legal review, DPO appointment, data-residency confirmation.

---

*Compliance v1.0 · additive edits only · not a substitute for legal counsel.*
