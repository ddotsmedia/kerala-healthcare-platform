-- 0058_medical_equipment_suppliers.sql
-- P-A16: Medical equipment supplier / rental / repair directory. Additive only.
-- (Spec labelled this 0054; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS medical_equipment_suppliers (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                 varchar(255) UNIQUE NOT NULL,
  name_ml              text,
  name_en              text NOT NULL,
  type                 varchar(50),
  address_ml           text,
  address_en           text,
  district_id          uuid REFERENCES districts(id),
  phone                text[],
  email                text,
  website              text,
  equipment_categories text[],
  has_rental           boolean NOT NULL DEFAULT false,
  has_delivery         boolean NOT NULL DEFAULT false,
  has_installation     boolean NOT NULL DEFAULT false,
  has_repair_service   boolean NOT NULL DEFAULT false,
  verification_status  varchar(20) NOT NULL DEFAULT 'pending'
                         CHECK (verification_status IN ('pending','verified','rejected')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);
CREATE INDEX IF NOT EXISTS idx_equip_district ON medical_equipment_suppliers (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_equip_rental ON medical_equipment_suppliers (has_rental) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_equip_verified ON medical_equipment_suppliers (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_equip_categories ON medical_equipment_suppliers USING gin (equipment_categories);
