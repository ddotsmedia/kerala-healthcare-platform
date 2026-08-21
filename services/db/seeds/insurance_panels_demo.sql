-- P-H9 seed: demo insurance panels for published doctors + hospitals. Idempotent
-- (WHERE NOT EXISTS on entity+insurer). AI-generated demo data; human review pending.

-- Doctors: attach a spread of insurers to the first few published doctors.
INSERT INTO insurance_panels (entity_type, entity_id, insurer_name, policy_types, network_type, max_cashless_limit_inr, is_verified)
SELECT 'doctor', d.id, v.insurer, v.policies, v.network, v.limit, true
FROM (
  SELECT id, row_number() OVER (ORDER BY display_name) AS rn
    FROM doctors WHERE listing_status='published' AND deleted_at IS NULL
) d
JOIN (VALUES
  (1, 'Star Health',        ARRAY['cashless','reimbursement'], 'preferred',  200000),
  (1, 'HDFC Ergo',          ARRAY['cashless'],                 'empanelled', 150000),
  (2, 'New India Assurance',ARRAY['cashless','reimbursement'], 'empanelled', 100000),
  (2, 'United India',       ARRAY['reimbursement'],            'empanelled', NULL),
  (3, 'National Insurance', ARRAY['cashless'],                 'preferred',  120000),
  (3, 'Star Health',        ARRAY['cashless','reimbursement'], 'empanelled', 200000)
) AS v(rn, insurer, policies, network, "limit") ON v.rn = d.rn
WHERE NOT EXISTS (
  SELECT 1 FROM insurance_panels ip WHERE ip.entity_type='doctor' AND ip.entity_id=d.id AND ip.insurer_name=v.insurer AND ip.deleted_at IS NULL
);

-- Hospitals: insurers + PMJAY (Ayushman Bharat) on a couple.
INSERT INTO insurance_panels (entity_type, entity_id, insurer_name, policy_types, network_type, max_cashless_limit_inr, is_verified)
SELECT 'hospital', h.id, v.insurer, v.policies, v.network, v.limit, true
FROM (
  SELECT id, row_number() OVER (ORDER BY name_en) AS rn
    FROM hospitals WHERE listing_status='published' AND deleted_at IS NULL
) h
JOIN (VALUES
  (1, 'PMJAY (Ayushman Bharat)', ARRAY['cashless'],                 'empanelled', 500000),
  (1, 'Star Health',             ARRAY['cashless','reimbursement'], 'preferred',  500000),
  (1, 'New India Assurance',     ARRAY['cashless'],                 'empanelled', 300000),
  (2, 'HDFC Ergo',               ARRAY['cashless','reimbursement'], 'empanelled', 250000),
  (2, 'United India',            ARRAY['reimbursement'],            'empanelled', NULL),
  (3, 'PMJAY (Ayushman Bharat)', ARRAY['cashless'],                 'empanelled', 500000),
  (3, 'National Insurance',      ARRAY['cashless'],                 'preferred',  300000)
) AS v(rn, insurer, policies, network, "limit") ON v.rn = h.rn
WHERE NOT EXISTS (
  SELECT 1 FROM insurance_panels ip WHERE ip.entity_type='hospital' AND ip.entity_id=h.id AND ip.insurer_name=v.insurer AND ip.deleted_at IS NULL
);
