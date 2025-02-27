-- Création des types énumérés
CREATE TYPE vehicle_type AS ENUM ('car', 'motorcycle', 'boat');
CREATE TYPE car_category AS ENUM ('sedan', 'suv', 'no_license', 'city_car', 'coupe');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'canceled', 'in_progress', 'completed');
CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Table location
CREATE TABLE location (
    id INT PRIMARY KEY,
    city VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    country VARCHAR NOT NULL
);

-- Table user
CREATE TABLE "user" (
    id INT PRIMARY KEY,
    username VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    phone VARCHAR,
    password VARCHAR NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now()
);

-- Table brand
CREATE TABLE brand (
    id INT PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE
);

-- Table specification
CREATE TABLE specification (
    id INT PRIMARY KEY,
    weight INT NOT NULL,
    length INT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL
);

-- Table vehicle
CREATE TABLE vehicle (
    id INT PRIMARY KEY,
    type vehicle_type NOT NULL,
    brand_id INT REFERENCES brand(id),
    model VARCHAR NOT NULL,
    specification_id INT REFERENCES specification(id),
    category car_category,
    available BOOLEAN DEFAULT TRUE,
    mileage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- Table parking
CREATE TABLE parking (
    id INT PRIMARY KEY,
    vehicle_id INT REFERENCES vehicle(id),
    location_id INT REFERENCES location(id)
);

-- Table subscription_plan
CREATE TABLE subscription_plan (
    id INT PRIMARY KEY,
    name VARCHAR NOT NULL,
    price INT NOT NULL
);

-- Table subscription
CREATE TABLE subscription (
    id INT PRIMARY KEY,
    user_id INT REFERENCES "user"(id),
    plan_id INT REFERENCES subscription_plan(id),
    start_date TIMESTAMP DEFAULT now(),
    end_date TIMESTAMP DEFAULT now(),
    archived BOOLEAN DEFAULT FALSE
);

-- Table plan_vehicle
CREATE TABLE plan_vehicle (
    id INT PRIMARY KEY,
    plan_id INT REFERENCES subscription_plan(id),
    vehicle_type vehicle_type NOT NULL,
    category car_category
);

-- Table reservation
CREATE TABLE reservation (
    id INT PRIMARY KEY,
    user_id INT REFERENCES "user"(id),
    vehicle_id INT REFERENCES vehicle(id),
    start_date TIMESTAMP DEFAULT now(),
    expected_end_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    status reservation_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now()
);

-- Table return_log
CREATE TABLE return_log (
    id INT PRIMARY KEY,
    reservation_id INT REFERENCES reservation(id),
    return_date TIMESTAMP DEFAULT now(),
    location_id INT REFERENCES location(id),
    condition VARCHAR,
    return_mileage INT
);

-- Table payment
CREATE TABLE payment (
    id INT PRIMARY KEY,
    user_id INT REFERENCES "user"(id),
    amount DECIMAL(10,2) NOT NULL,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    subscription_id INT REFERENCES subscription(id),
    reservation_id INT REFERENCES reservation(id),
    created_at TIMESTAMP DEFAULT now()
);

-- =============================
-- Insertion de données de démo
-- =============================

-- 1. Table location
INSERT INTO location (id, city, address, country) VALUES
  (1, 'Paris', '10 rue de Rivoli', 'France'),
  (2, 'Lyon', '25 rue de la République', 'France'),
  (3, 'Marseille', '15 boulevard Baille', 'France');

-- 2. Table "user"
INSERT INTO "user" (id, username, lastname, email, phone, password, is_admin, created_at) VALUES
  (1, 'jdupont', 'Dupont', 'jdupont@example.com', '0102030405', 'motdepasse1', TRUE, now()),
  (2, 'msimon', 'Simon', 'msimon@example.com', '0607080910', 'motdepasse2', FALSE, now()),
  (3, 'lmartin', 'Martin', 'lmartin@example.com', '0708091011', 'motdepasse3', FALSE, now());

-- 3. Table brand
INSERT INTO brand (id, name) VALUES
  (1, 'Toyota'),
  (2, 'Honda'),
  (3, 'BMW');

-- 4. Table specification
INSERT INTO specification (id, weight, length, width, height) VALUES
  (1, 1200, 4200, 1750, 1450),
  (2, 800, 2000, 750, 1100),
  (3, 1500, 4500, 1800, 1500);

-- 5. Table vehicle
INSERT INTO vehicle (id, type, brand_id, model, specification_id, category, available, mileage, created_at) VALUES
  (1, 'car', 1, 'Corolla', 1, 'sedan', TRUE, 50000, now()),
  (2, 'motorcycle', 2, 'CBR500R', 2, 'no_license', TRUE, 15000, now()),
  (3, 'car', 3, 'X5', 3, 'suv', FALSE, 80000, now());

-- 6. Table parking
INSERT INTO parking (id, vehicle_id, location_id) VALUES
  (1, 1, 1),
  (2, 2, 2),
  (3, 3, 3);

-- 7. Table subscription_plan
INSERT INTO subscription_plan (id, name, price) VALUES
  (1, 'Basic', 29),
  (2, 'Premium', 59),
  (3, 'Ultimate', 99);

-- 8. Table subscription
INSERT INTO subscription (id, user_id, plan_id, start_date, end_date, archived) VALUES
  (1, 2, 1, now(), now() + interval '30 days', FALSE),
  (2, 3, 2, now(), now() + interval '30 days', FALSE);

-- 9. Table plan_vehicle
INSERT INTO plan_vehicle (id, plan_id, vehicle_type, category) VALUES
  (1, 1, 'car', 'city_car'),
  (2, 2, 'car', 'suv'),
  (3, 3, 'motorcycle', 'no_license');

-- 10. Table reservation
INSERT INTO reservation (id, user_id, vehicle_id, start_date, expected_end_date, actual_end_date, status, created_at) VALUES
  (1, 2, 1, now(), now() + interval '2 days', NULL, 'pending', now()),
  (2, 3, 3, now() - interval '3 days', now() - interval '1 day', now() - interval '1 day', 'completed', now() - interval '3 days');

-- 11. Table return_log
INSERT INTO return_log (id, reservation_id, return_date, location_id, condition, return_mileage) VALUES
  (1, 2, now() - interval '1 day', 3, 'Bon état', 80500);

-- 12. Table payment
INSERT INTO payment (id, user_id, amount, method, status, subscription_id, reservation_id, created_at) VALUES
  (1, 2, 59.99, 'credit_card', 'completed', 1, NULL, now()),
  (2, 3, 99.99, 'paypal', 'completed', 2, 2, now()),
  (3, 2, 15.50, 'bank_transfer', 'pending', NULL, 1, now());
