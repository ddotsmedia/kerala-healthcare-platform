# MALAYALIMED COMPLETE PLATFORM REBUILD

## Objective
Rebuild the complete MalayaliMed healthcare platform from scratch with full autonomy. Create all database migrations, API endpoints, frontend pages, UI components, and business logic.

## Deliverables
1. ✅ Database schema (124 migrations)
2. ✅ Backend APIs (60+ endpoints)
3. ✅ Frontend pages (30+ core pages)
4. ✅ UI components (50+ components)
5. ✅ Business logic modules (50+ modules)
6. ✅ Admin panel (8+ pages)
7. ✅ Docker configuration
8. ✅ All code committed to git
9. ✅ Site live at https://malayalimed.com

## Execution Steps

### STEP 1: Database Foundation (30 min)
Create services/db/migrations/ directory with these migrations:

**0001_extensions.sql** - Enable UUID, pgcrypto
**0002_reference_districts.sql** - Districts table
**0003_specialties.sql** - Medical specialties
**0004_users.sql** - User accounts table
**0005_user_sessions.sql** - Session management
**0006_user_otp.sql** - OTP verification
**0007_doctors.sql** - Doctor profiles
**0008_doctor_specialties.sql** - Doctor specialty junction
**0009_doctor_availability.sql** - Available slots
**0010_hospitals.sql** - Hospital profiles
**0011_hospital_departments.sql** - Departments
**0012_hospital_services.sql** - Services
**0013_appointments.sql** - Appointment bookings
**0014_reviews.sql** - Doctor reviews
**0015_ratings.sql** - Star ratings
**0016_payments.sql** - Payment records
**0017_prescriptions.sql** - Digital prescriptions
**0018_notifications.sql** - Notification log
**0019_audit_logs.sql** - Activity tracking
... continue through 0124

Then run:
```bash
pnpm db:migrate
```

Verify all tables created in PostgreSQL.

### STEP 2: Core Services (20 min)
Create services/db/pool.js with PostgreSQL connection pool
Create services/db/sql.js with SQL template helpers
Create services/cache/index.js with Redis client

### STEP 3: Authentication Endpoints (20 min)
Create apps/web/app/api/auth/ with routes:
- register/patient/route.js
- register/doctor/route.js
- register/hospital/route.js
- login/route.js
- logout/route.js
- refresh/route.js
- otp/request/route.js
- otp/verify/route.js

Each route validates input, calls database, returns JWT token or error.

### STEP 4: Doctor APIs (30 min)
Create apps/web/app/api/doctors/ with routes:
- route.js (GET list, POST create)
- [id]/route.js (GET detail, PUT update)
- [id]/reviews/route.js (GET reviews, POST review)
- [id]/availability/route.js (GET slots, POST slot)
- search/route.js (advanced search)

### STEP 5: Appointment APIs (25 min)
Create apps/web/app/api/appointments/ with routes:
- route.js (GET list, POST book)
- [id]/route.js (GET detail, PUT reschedule)
- [id]/cancel/route.js (POST cancel)
- [id]/rate/route.js (POST rating)
- slots/route.js (GET available slots)

### STEP 6: Hospital APIs (20 min)
Create apps/web/app/api/hospitals/ with routes:
- route.js (GET list, POST create)
- [id]/route.js (GET detail, PUT update)
- [id]/departments/route.js (GET departments)
- search/route.js (search hospitals)

### STEP 7: Payment APIs (15 min)
Create apps/web/app/api/payments/ with routes:
- route.js (POST create payment)
- [id]/route.js (GET status)
- [id]/refund/route.js (POST refund)

### STEP 8: Frontend Pages (60 min)
Create apps/web/app/[locale]/page.js - Homepage
Create apps/web/app/[locale]/jobs/page.js - Job listings
Create apps/web/app/[locale]/doctors/page.js - Doctor directory
Create apps/web/app/[locale]/hospitals/page.js - Hospital directory
Create apps/web/app/[locale]/womens-health/page.js - Women's health
Create apps/web/app/[locale]/mental-health/page.js - Mental health
Create apps/web/app/[locale]/child-health/page.js - Child health
Create apps/web/app/register/patient/page.js - Patient signup
Create apps/web/app/register/doctor/page.js - Doctor signup
Create apps/web/app/register/hospital/page.js - Hospital signup
Create apps/web/app/dashboard/patient/page.js - Patient dashboard
Create apps/web/app/dashboard/doctor/page.js - Doctor dashboard
Create apps/web/app/dashboard/hospital/page.js - Hospital dashboard

Each page uses "use client" directive, accepts locale params, renders responsive UI.

### STEP 9: UI Components (90 min)

**Navigation:**
- Navbar.js - Top navigation with logo, menu, language selector
- Sidebar.js - Left sidebar for dashboards
- Footer.js - Footer with links

**Cards:**
- DoctorCard.js - Display doctor with rating, specialty
- HospitalCard.js - Display hospital info
- JobCard.js - Job listing card

**Filters:**
- SpecialtyFilter.js - Filter by specialty
- LocationFilter.js - Filter by location
- PriceFilter.js - Filter by price range

**Forms:**
- AppointmentForm.js - Book appointment
- ReviewForm.js - Post review
- PaymentForm.js - Payment processing
- SearchBar.js - Search input

**Tables:**
- AppointmentTable.js - List appointments
- UserTable.js - List users (admin)
- AnalyticsTable.js - Analytics data

**Modals:**
- ConfirmDialog.js - Confirmation modal
- ErrorModal.js - Error display
- SuccessModal.js - Success message

**Other:**
- RatingDisplay.js - Star rating component
- AvailabilityCalendar.js - Slot selection
- VideoRoom.js - Jitsi integration
- ChatWindow.js - Message interface
- LoadingSpinner.js - Loading state
- EmptyState.js - No data message

Each component is functional, uses React hooks, accepts props, is reusable, under 300 lines.

### STEP 10: Business Logic (60 min)

Create apps/web/lib/ modules:
- doctors.js - Doctor CRUD, search, filtering
- hospitals.js - Hospital CRUD, search
- appointments.js - Booking, rescheduling, cancellation
- payments.js - Payment processing
- auth.js - Authentication helpers
- validators.js - Input validation
- formatters.js - Data formatting
- notifications.js - Email/SMS sending
- search.js - Advanced search logic
- filters.js - Filtering utilities

Each module exports pure functions, has clear documentation, handles errors.

### STEP 11: Admin Panel (40 min)

Create apps/admin/app/ pages:
- dashboard/page.js - Main dashboard with KPIs
- users/page.js - User management table
- doctors/page.js - Doctor verification queue
- hospitals/page.js - Hospital verification
- analytics/page.js - Analytics dashboard
- reports/page.js - Report generation
- settings/page.js - Admin settings
- audit/page.js - Audit logs

Each admin page displays data in tables, has action buttons, shows statistics.

### STEP 12: Integration (30 min)

1. Wire all services together
2. Test all API endpoints with curl
3. Test all pages load
4. Test all components render
5. Fix any import errors
6. Verify database connections
7. Test authentication flow
8. Test appointment booking flow
9. Log all errors

### STEP 13: Docker Setup (20 min)

Create/verify:
- Dockerfile.web - Web app image
- docker-compose.prod.yml - All services
- infra/scripts/deploy.sh - Deployment script

Build and test:
```bash
docker compose build
docker compose up -d
docker compose ps
```

### STEP 14: Git & Commit (10 min)

```bash
git add -A
git commit -m "feat: complete-platform-rebuild-all-features"
git log --oneline -5
```

## Success Criteria

✅ All 124 migrations run successfully
✅ All 60+ API endpoints return 200 OK
✅ All 30+ pages load (200 OK or 307)
✅ All 50+ components render without errors
✅ Homepage loads
✅ Job portal works
✅ Doctor listing works
✅ Appointment booking flow works
✅ Admin panel works
✅ All code committed to git
✅ Docker builds without errors
✅ All containers running
✅ Database is healthy
✅ No console errors
✅ Zero manual interventions

## Important Rules

- Fully autonomous - no pauses
- JavaScript only (no TypeScript)
- No new npm packages
- Mobile-first design
- Files >400 lines must be split
- Additive-only migrations
- All commits use conventional commits
- On errors: log to BLOCKERS.md and continue
- Final report lists working/broken features

## Estimated Time
**Total: 6-8 hours fully autonomous execution**
