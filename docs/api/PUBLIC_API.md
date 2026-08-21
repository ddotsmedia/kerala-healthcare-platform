# MalayaliDoctor Public API v1

REST API for partner integrations — hospitals, insurers, government health
departments, and developers. Read-only, privacy-safe data.

Base URL: `https://malayalidoctor.com/api/public/v1`

## Authentication

Every request must send your API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: khp_live_xxxxxxxx" \
  https://malayalidoctor.com/api/public/v1/doctors
```

- Keys are issued by the platform admin (Admin → API keys) and shown once.
- Missing key → `401 missing_api_key`; invalid/revoked → `401 invalid_api_key`.
- A key may be restricted to specific endpoints → `403 endpoint_not_allowed`.

## Rate limits

- Per key, default **1000 requests/hour** (configurable per key).
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`.
- Over limit → `429 rate_limit_exceeded` with a `Retry-After` header (seconds).

## Response envelope

```json
{ "data": <payload>, "meta": { "page": 1, "limit": 20, "count": 20 }, "errors": null }
```

## Endpoints

### GET /doctors
Verified, published doctors. Public fields only — **no contact details**.
Query: `page`, `limit` (max 100), `district` (uuid), `specialty` (uuid).
```json
{ "data": [{ "id": "…", "slug": "dr-…", "display_name": "Dr …",
  "years_experience": 12, "consultation_fee": 500, "languages": ["ml","en"],
  "verification_status": "verified", "specialty": "Cardiology", "district": "Ernakulam" }] }
```

### GET /hospitals
Published hospitals. Query: `page`, `limit`, `district`.
Fields: `id, slug, name_en, name_ml, emergency_24x7, district`.

### GET /specialties
All specialties. Fields: `id, slug, name_en, name_ml`.

### GET /districts
Kerala districts (with Tamil/Hindi names). Fields: `id, code, name_en, name_ml, name_ta, name_hi`.

### GET /health-data/diseases/{slug}
A published disease article. Fields: `slug, title_en, title_ml, excerpt_en, excerpt_ml, body_en, body_ml, published_at`. Unknown slug → `404 not_found`.

## Terms of use

- Data is provided for integration and informational purposes only and is **not
  medical advice**. Do not present it as a diagnosis.
- Do not attempt to re-identify individuals or scrape beyond your rate limit.
- Attribute MalayaliDoctor when displaying provider data.
- The platform may revoke a key at any time for misuse.

## Errors

| Status | error | Meaning |
|--------|-------|---------|
| 401 | missing_api_key / invalid_api_key | No or bad key |
| 403 | endpoint_not_allowed | Key not scoped to this endpoint |
| 404 | not_found | Resource does not exist |
| 429 | rate_limit_exceeded | Hourly limit hit; see Retry-After |
