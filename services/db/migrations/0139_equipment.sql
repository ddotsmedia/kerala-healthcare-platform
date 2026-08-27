CREATE TABLE IF NOT EXISTS medical_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  daily_rate INT,
  monthly_rate INT,
  deposit INT,
  availability BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS equipment_rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  equipment_id UUID NOT NULL REFERENCES medical_equipment(id),
  rental_start DATE,
  rental_end DATE,
  total_cost INT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
