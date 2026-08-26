-- Demo appointment waitlists
-- Using existing doctors and patients from seed data

INSERT INTO appointment_waitlists
  (doctor_id, patient_id, appointment_date, consultation_mode, status, position, created_at)
SELECT
  (SELECT id FROM doctors WHERE slug = 'dr-anand-nair' LIMIT 1),
  (SELECT id FROM users WHERE email LIKE '%arjun%' LIMIT 1),
  CURRENT_DATE + INTERVAL '5 days',
  'in-person',
  'waiting',
  1,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM doctors WHERE slug = 'dr-anand-nair')
  AND EXISTS (SELECT 1 FROM users WHERE email LIKE '%arjun%')
ON CONFLICT DO NOTHING;

INSERT INTO appointment_waitlists
  (doctor_id, patient_id, appointment_date, consultation_mode, status, position, created_at)
SELECT
  (SELECT id FROM doctors WHERE slug = 'dr-anand-nair' LIMIT 1),
  (SELECT id FROM users WHERE email LIKE '%priya%' LIMIT 1),
  CURRENT_DATE + INTERVAL '5 days',
  'in-person',
  'waiting',
  2,
  CURRENT_TIMESTAMP - INTERVAL '1 hour'
WHERE EXISTS (SELECT 1 FROM doctors WHERE slug = 'dr-anand-nair')
  AND EXISTS (SELECT 1 FROM users WHERE email LIKE '%priya%')
ON CONFLICT DO NOTHING;

INSERT INTO appointment_waitlists
  (doctor_id, patient_id, appointment_date, consultation_mode, status, position, created_at)
SELECT
  (SELECT id FROM doctors WHERE slug = 'dr-priya-menon' LIMIT 1),
  (SELECT id FROM users WHERE email LIKE '%amit%' LIMIT 1),
  CURRENT_DATE + INTERVAL '3 days',
  'video',
  'waiting',
  1,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM doctors WHERE slug = 'dr-priya-menon')
  AND EXISTS (SELECT 1 FROM users WHERE email LIKE '%amit%')
ON CONFLICT DO NOTHING;

INSERT INTO appointment_waitlists
  (doctor_id, patient_id, appointment_date, consultation_mode, status, position, created_at)
SELECT
  (SELECT id FROM doctors WHERE slug = 'dr-priya-menon' LIMIT 1),
  (SELECT id FROM users WHERE email LIKE '%sneha%' LIMIT 1),
  CURRENT_DATE + INTERVAL '3 days',
  'video',
  'offered',
  2,
  CURRENT_TIMESTAMP - INTERVAL '2 hours',
  CURRENT_TIMESTAMP - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM doctors WHERE slug = 'dr-priya-menon')
  AND EXISTS (SELECT 1 FROM users WHERE email LIKE '%sneha%')
ON CONFLICT DO NOTHING;

INSERT INTO appointment_waitlists
  (doctor_id, patient_id, appointment_date, consultation_mode, status, position, created_at)
SELECT
  (SELECT id FROM doctors WHERE specialty ILIKE '%cardio%' LIMIT 1),
  (SELECT id FROM users WHERE email LIKE '%rajesh%' LIMIT 1),
  CURRENT_DATE + INTERVAL '7 days',
  'in-person',
  'waiting',
  1,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM doctors WHERE specialty ILIKE '%cardio%')
  AND EXISTS (SELECT 1 FROM users WHERE email LIKE '%rajesh%')
ON CONFLICT DO NOTHING;
