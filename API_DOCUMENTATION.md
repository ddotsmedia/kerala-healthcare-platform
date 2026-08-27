# Kerala Healthcare Platform — API Documentation

## Overview
Production REST API for healthcare features across 14 advanced modules. All endpoints follow `/api/v1/` convention (ready for versioning).

## Authentication
- **Mobile OTP Flow**: POST `/api/auth/request-otp` → POST `/api/auth/verify-otp`
- **JWT Tokens**: 15-minute access token + 30-day refresh token in Redis
- **Session Management**: `getSession()` for authenticated endpoints
- **Role-Based**: `patient`, `doctor`, `hospital_admin`, `platform_admin`

## Rate Limiting
- Public endpoints: 20 req/min per IP
- Authenticated endpoints: 100 req/min per user
- Admin endpoints: 500 req/min
- Booking endpoints: 5 req/min (spam prevention)
- Payment endpoints: 10 req/min

## 14 Feature Endpoints

### 1. Prescriptions Management
```
GET  /api/health/prescriptions
POST /api/health/prescriptions (refill request)
```
- **Auth**: Required (patient or doctor)
- **Returns**: List with doctor info, expiry tracking
- **Refill Logic**: Decrement refills_left, validate expiry
- **Cache**: None (user-specific data)
- **Rate Limit**: 100 req/min

### 2. Appointment Waiting List
```
GET  /api/health/waiting-list
POST /api/health/waiting-list (join queue)
```
- **Auth**: Required (patient)
- **Queue Position**: Auto-incrementing counter per appointment
- **Duplicate Check**: ON CONFLICT DO NOTHING
- **Cache**: None (user-specific)
- **Returns**: Position, ahead count, appointment details

### 3. Health Challenges (Gamification)
```
GET  /api/health/challenges
POST /api/health/challenges (join)
```
- **Auth**: Not required for GET; Required for POST
- **Returns**: Active challenges with reward points
- **Cache**: 1 hour (setex with key invalidation)
- **Join Tracking**: user_challenge_participation table
- **Scope**: App-wide leaderboard

### 4. Lab Reports (Digital Storage)
```
GET  /api/health/lab-reports
POST /api/health/lab-reports (upload)
```
- **Auth**: Required (patient)
- **Returns**: Sorted DESC by test_date
- **Upload**: JSONB results, file_url (S3/R2)
- **Status**: normal/abnormal/pending
- **Retention**: Indefinite (soft delete)

### 5. Insurance Policies
```
GET  /api/insurance/policies
POST /api/insurance/policies (add)
```
- **Auth**: Required (patient)
- **Returns**: List of active policies with coverage
- **Coverage Details**: JSONB (copay, limits, networks)
- **Status Tracking**: active/expired/suspended
- **Cache**: None (user-specific)

### 6. Nursing Services Booking
```
GET  /api/nursing-services
POST /api/nursing-services (book)
```
- **Auth**: Not required for GET; Required for POST
- **Returns**: Nurses filtered by availability, rating
- **Booking**: Date range, special notes, status='pending'
- **Professional Data**: qualification, languages, certifications
- **Rating**: User-submitted scores

### 7. Lab Tests Booking
```
GET  /api/lab-tests
POST /api/lab-tests (book)
```
- **Auth**: Not required for GET; Required for POST
- **Returns**: Test catalog with price, turnaround
- **Fasting Required**: Boolean flag in response
- **Sample Types**: blood, urine, stool, swab
- **Collection**: Date/time slot, home pickup option
- **Cache**: 30 minutes

### 8. Medical Equipment Rental
```
GET  /api/equipment
POST /api/equipment (rent)
```
- **Auth**: Not required for GET; Required for POST
- **Stock**: stock_available field, real-time tracking
- **Pricing**: daily_rental_rate × duration
- **Delivery**: Address capture and tracking
- **Status**: pending/confirmed/delivered/returned
- **Cache**: 1 hour

### 9. Medicines Marketplace
```
GET  /api/medicines
POST /api/medicines (order)
```
- **Auth**: Not required for GET; Required for POST
- **Search**: Name or manufacturer (ILIKE queries)
- **Prescription Check**: requires_prescription flag
- **Quantity**: Max 100 units per order
- **Price**: Automatic calculation
- **Cache**: 30 minutes per search term

### 10. Payments (Razorpay Integration)
```
POST /api/payments/create-order
POST /api/payments/verify (webhook)
```
- **Auth**: Required for create-order
- **Razorpay Integration**: Basic auth with API key
- **Verification**: HMAC-SHA256 signature validation
- **Status Pipeline**: pending → completed → failed
- **Transaction Tracking**: Full audit trail
- **Idempotency**: Transaction ID as unique key

### 11. Notifications (SMS/Email)
```
POST /api/notifications/send-otp
```
- **Auth**: Not required (registration flow)
- **OTP Generation**: 6 digits, 10-minute expiry
- **Channels**: SMS (primary) + email (fallback)
- **Gateway**: Configured via env variables
- **Logging**: All sends tracked in notification_logs
- **Rate Limit**: 5 OTP attempts per phone/email per 15 min

### 12. Admin Analytics Dashboard
```
GET /api/admin/analytics
```
- **Auth**: Required (admin role only)
- **Metrics**: Users, appointments, doctors, revenue
- **Timeframes**: All-time + last 30 days
- **Aggregation**: SUM, COUNT, AVG, MAX
- **Data**: Top doctors, appointment trends
- **Cache**: 5 minutes (real-time focus)
- **Exports**: Ready for CSV (LIMIT 10000)

### 13. i18n Translations
```
GET /api/translations
```
- **Auth**: Not required
- **Languages**: English, Malayalam, Hindi, Tamil, Kannada
- **Namespaces**: common, health, services, settings
- **Format**: JSON with key-value pairs
- **Cache**: 24 hours
- **Fallback**: English on missing translations

### 14. Video Consultations (Jitsi Integration)
```
GET  /api/video-consultations
POST /api/video-consultations (start)
GET  /api/video-consultations/[id]
PATCH /api/video-consultations/[id] (end)
```
- **Auth**: Required (doctor/patient only)
- **Room ID**: Auto-generated with timestamp + random string
- **Eligibility**: 15 min before to 60 min after appointment
- **Recording**: Storage URL captured on end
- **Duration**: Automatic calculation
- **History**: Retained for 90 days

---

## Supporting Endpoints

### Appointment Details
```
GET /api/appointments/[id]
```
- Used by video consultation feature
- Returns can_join_video flag
- Minutes until appointment calculation

### Video Consultation History
```
GET /api/appointments/my (show only user's appointments with video status)
```

---

## Error Handling

All endpoints return standard error envelope:
```json
{
  "error": "Error message",
  "timestamp": "2026-08-27T10:30:00Z",
  "statusCode": 400
}
```

Common status codes:
- `200`: Success
- `400`: Invalid input
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `409`: Conflict (duplicate booking, etc)
- `429`: Rate limited
- `500`: Server error

---

## Database Schema

### Core Tables (12 features)
1. **prescriptions**: doctor_id, patient_id, medications (JSONB), issue_date, expiry_date, refills_left
2. **appointment_waiting_list**: appointment_id, user_id, queue_position, status
3. **health_challenges**: name, description, emoji, target_days, reward_points, active
4. **user_challenge_participation**: user_id, challenge_id, started_at, completed_at, status
5. **lab_reports**: patient_id, test_name, lab_name, results (JSONB), file_url, status
6. **video_consultations**: appointment_id, jitsi_room_id, status, started_at, ended_at, recording_url
7. **user_insurance_policies**: user_id, provider_name, coverage_amount, coverage_details (JSONB)
8. **insurance_claims**: user_id, policy_id, amount_claimed, status
9. **payments**: user_id, amount, gateway, status, transaction_id
10. **notification_logs**: recipient, channel, template_id, status, sent_at
11. **lab_tests**: test_name, test_code, price, sample_type, fasting_required
12. **lab_test_bookings**: patient_id, test_id, collection_date, status
13. **medical_equipment**: name, daily_rental_rate, stock_available, specifications (JSONB)
14. **equipment_rentals**: patient_id, equipment_id, rental_start_date, rental_end_date
15. **nursing_services**: user_id, qualification, experience_years, hourly_rate, languages (JSONB)
16. **nursing_bookings**: patient_id, nurse_id, start_date, end_date, status
17. **medicines**: name, dosage, price, stock_quantity, requires_prescription
18. **medicine_orders**: patient_id, medicine_id, quantity, pharmacy_id, status

### Indexing Strategy
- All `patient_id`, `doctor_id`, `user_id` columns: B-tree index
- `created_at`, `scheduled_at`: Index for time-range queries
- `status` columns: Hash index for equality filters
- `JSONB` fields: GiST index for contains queries

### Soft Deletes
All tables include `deleted_at` column (NULL = active). Queries filter with `WHERE deleted_at IS NULL`.

---

## Caching Strategy

| Resource | Duration | Cache Key | Invalidation |
|----------|----------|-----------|---------------|
| Health Challenges | 1 hour | `challenges:active` | On create/update/delete |
| Lab Tests | 30 min | `labtests:active` | On stock change |
| Equipment | 1 hour | `equipment:available` | On stock change |
| Medicines | 30 min | `medicines:active` or `medicines:search:*` | On price/stock change |
| Leaderboard | 10 min | `leaderboard:*` | Hourly refresh |
| Translations | 24 hours | `translations:*` | On deploy |
| Analytics | 5 min | `analytics:*` | Real-time updates |

Cache backend: Redis (URL via `REDIS_URL` env)

---

## Security Features

- ✅ Rate limiting on all endpoints
- ✅ Input validation with sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ CSRF protection via session tokens
- ✅ XSS prevention (HTML escaping)
- ✅ CORS headers on all responses
- ✅ JWT signature verification
- ✅ Role-based access control
- ✅ Error tracking to database
- ✅ Request logging for audit trail

---

## Performance Targets

- GET public endpoints: <100ms (with cache)
- GET authenticated endpoints: <200ms
- POST endpoints: <500ms (including payment gateway)
- List endpoints: <300ms (paginated, limit 50)
- Admin analytics: <1s (complex aggregation)

---

## Deployment Checklist

- [ ] All environment variables set (JWT_SECRET, RAZORPAY_KEY, etc)
- [ ] Redis instance running and accessible
- [ ] Database migrations run (`pnpm db:migrate`)
- [ ] Seed demo data optional (`pnpm db:seed:demo`)
- [ ] Rate limit middleware configured
- [ ] Error tracking logging enabled
- [ ] CDN configured for S3/R2 assets
- [ ] Jitsi server configured or use meet.jit.si
- [ ] SMS gateway API keys set
- [ ] Email SES configured
- [ ] Monitoring alerts enabled
- [ ] Backup strategy in place

---

## Future Enhancements (Phase 4)

- GraphQL API alongside REST
- WebSocket support for real-time notifications
- Machine learning for doctor recommendation
- Payment plan support (installments)
- Prescription fulfillment tracking
- Telemedicine chat alongside video
- Insurance claim automation
- Prescription reminder notifications
- AI health risk assessment

