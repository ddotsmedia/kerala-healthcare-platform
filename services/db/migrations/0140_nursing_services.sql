CREATE TABLE IF NOT EXISTS nursing_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255),
  qualification VARCHAR(255),
  experience INT,
  hourly_rate INT,
  specialization VARCHAR(100),
  availability BOOLEAN DEFAULT true,
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS nursing_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  nurse_id UUID NOT NULL REFERENCES nursing_services(id),
  service_date DATE,
  duration INT,
  total_cost INT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
