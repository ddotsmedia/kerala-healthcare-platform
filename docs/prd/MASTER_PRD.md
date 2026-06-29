# Master PRD — Kerala Health Portal

*Status: Phase 0 (Foundation). Living document — additive edits only.*

---

## 1. Vision

A Kerala-first, Malayalam-first digital healthcare ecosystem that lets every Keralite **find verified doctors and hospitals, book appointments, read trustworthy health information, and discover healthcare jobs** — with an AI assistant that **guides, never diagnoses**.

Built for Kerala first, architected to scale across India.

---

## 2. Non-goals (hard boundaries)

- **No clinical diagnosis.** The platform never tells a user what condition they have.
- **No treatment or prescription advice.** Always redirect to a qualified professional.
- **No unverified medical claims.** No content ships without editorial approval.
- **No telemedicine consultation in Phase 0–4.** Directory + booking + content + jobs first.
- **No insurance underwriting / payments-as-bank.** Out of scope.

---

## 3. Target users

| User | Need |
|---|---|
| Patient / caregiver | Find verified care nearby in Malayalam; book; read reliable info. |
| Doctor | Verified public profile; manage availability and appointments. |
| Hospital admin | Manage hospital profile, staff, appointment slots. |
| Content editor | Author health knowledge content (no publish power). |
| Verification agent | Verify provider identity and registration. |
| Jobseeker | Find healthcare jobs in Kerala. |
| Employer | Post verified healthcare job openings. |
| Platform admin | Operate, moderate, and govern the platform. |

---

## 4. Product pillars

### 4.1 Healthcare Directory
Verified, searchable directory of doctors and hospitals. SEO-optimised public profiles. Search in Malayalam script and Manglish. Filter by specialty, district, language, availability.

### 4.2 Appointments & Patient Portal
Slot-based booking with double-booking prevention. Patient account holds own appointments and health records (separate, RLS-protected schema). OTP login.

### 4.3 Health Knowledge Centre
Editorially-approved health articles in Malayalam and English. Non-dismissable medical disclaimer on every health page. Sources cited. No diagnostic tools.

### 4.4 Healthcare Jobs Portal
Verified employers post healthcare jobs. Schema.org `JobPosting`. Jobseeker profiles and applications.

### 4.5 AI Health Assistant
Claude-powered (`claude-haiku-20241022`) guidance assistant. RAG over approved knowledge base. Guides and navigates only — never prescribes or diagnoses. Emergency redirect (`112` / `108`). Every response labelled AI-generated and recommends a professional. Full rules in [AI_SAFETY.md](../ai-safety/AI_SAFETY.md).

---

## 5. Functional requirements (high level)

| ID | Requirement |
|---|---|
| FR-1 | Every provider (doctor/hospital) MUST be verified before public listing. |
| FR-2 | Doctor registration numbers cross-checked against NMC registry. |
| FR-3 | All public profiles emit Schema.org structured data. |
| FR-4 | Appointment booking MUST prevent double-booking under concurrency. |
| FR-5 | Health content MUST pass editorial publish approval (editor ≠ publisher). |
| FR-6 | All health pages MUST show a non-dismissable medical disclaimer. |
| FR-7 | AI assistant MUST cite sources and never diagnose or prescribe. |
| FR-8 | All UI MUST default to Malayalam and support English. |
| FR-9 | Search MUST support Malayalam script and Manglish. |
| FR-10 | Patient data MUST be DPDP Act 2023 compliant (consent, minimisation, deletion). |

---

## 6. Non-functional requirements

| Area | Target |
|---|---|
| Scale | Millions of users; horizontally scalable. |
| Performance | Mobile-first; Lighthouse SEO ≥ 90 on directory pages. |
| Availability | Enterprise-grade; graceful degradation. |
| Security | Encryption at rest and in transit; least-privilege roles. See [SECURITY.md](../security/SECURITY.md). |
| Accessibility | Readable Malayalam typography (Noto Sans Malayalam); WCAG-aware. |
| Privacy | DPDP Act 2023; PHR isolated with row-level security. |

---

## 7. SEO requirements

- Doctor URL: `/doctors/dr-[firstname]-[lastname]-[specialty]-[district]`.
- Hospital URL: `/hospitals/[name]-[district]`.
- Slugs permanent once published — never changed.
- Required structured data: `Physician`, `Hospital`, `MedicalWebPage`, `JobPosting`.
- Unique `<title>` (<60 chars) and meta description (<160 chars) per page.

---

## 8. Success metrics (initial)

- Verified providers listed.
- Appointment completion rate.
- Knowledge articles published (editorially approved).
- Malayalam-locale session share.
- AI assistant safe-redirect rate (emergencies correctly escalated).
- Zero published unverified providers; zero diagnosis incidents.

---

## 9. Phasing

See [ROADMAP.md](../roadmap/ROADMAP.md). Phase 0 = foundation (this repo). Phases 1–5 build the pillars above.

---

*Master PRD v1.0 · additive edits only.*
