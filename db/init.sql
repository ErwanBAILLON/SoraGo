-- Table des clients
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des véhicules
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INT,
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',  -- available, rented, maintenance
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des locations
CREATE TABLE rentals (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  rental_start TIMESTAMP NOT NULL,
  rental_end TIMESTAMP,
  total_cost NUMERIC(10,2),
  status VARCHAR(20) NOT NULL DEFAULT 'ongoing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
