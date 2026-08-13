-- 0090_procedure_ecg.sql
-- Adds ECG as the 20th seeded procedure (the spec's list includes it explicitly).
-- Additive/data-only; ON CONFLICT DO NOTHING.

INSERT INTO procedures
  (slug, name_ml, name_en, category, specialty_id, description_en, why_performed_en, preparation_en,
   what_happens_en, duration_minutes_min, duration_minutes_max, anaesthesia_type, recovery_en,
   hospital_stay_days_min, hospital_stay_days_max, risks_en, cost_range_min, cost_range_max, "references", is_published)
SELECT 'ecg-procedure', 'ഇസിജി', 'Electrocardiogram (ECG)', 'diagnostic', (SELECT id FROM specialties WHERE slug='cardiology'),
   'A quick, painless test that records the heart’s electrical activity.',
   'To investigate chest pain, palpitations, breathlessness or an irregular heartbeat.',
   'No special preparation; avoid oily creams on the chest so the electrodes stick.',
   'Small sticky electrodes are placed on the chest, arms and legs and the heart’s signals are recorded for a few minutes.',
   5, 10, 'none', 'No recovery needed; you can resume normal activity immediately.',
   0, 0, 'None; it is a safe, non-invasive test.', 200, 800, ARRAY['CSI'], true
ON CONFLICT (slug) DO NOTHING;
