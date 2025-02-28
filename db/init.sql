-- Création des types énumérés
CREATE TYPE vehicle_type AS ENUM ('car', 'motorcycle', 'boat');
CREATE TYPE car_category AS ENUM ('sedan', 'suv', 'no_license', 'city_car', 'coupe');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'canceled', 'in_progress', 'completed');
CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Table location
CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    city VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    country VARCHAR NOT NULL
);

-- Table user
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE
);

-- Table specification
CREATE TABLE specification (
    id SERIAL PRIMARY KEY,
    weight INT NOT NULL,
    length INT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL
);

-- Table vehicle
CREATE TABLE vehicle (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicle(id),
    location_id INT REFERENCES location(id)
);

-- Table subscription_plan
CREATE TABLE subscription_plan (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price INT NOT NULL
);

-- Table subscription
CREATE TABLE subscription (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "user"(id),
    plan_id INT REFERENCES subscription_plan(id),
    start_date TIMESTAMP DEFAULT now(),
    end_date TIMESTAMP DEFAULT now(),
    archived BOOLEAN DEFAULT FALSE
);

-- Table plan_vehicle
CREATE TABLE plan_vehicle (
    id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES subscription_plan(id),
    vehicle_type vehicle_type NOT NULL,
    category car_category
);

-- Table reservation
CREATE TABLE reservation (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservation(id),
    return_date TIMESTAMP DEFAULT now(),
    location_id INT REFERENCES location(id),
    condition VARCHAR,
    return_mileage INT
);

-- Table payment
CREATE TABLE payment (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "user"(id),
    amount DECIMAL(10,2) NOT NULL,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    subscription_id INT REFERENCES subscription(id),
    reservation_id INT REFERENCES reservation(id),
    created_at TIMESTAMP DEFAULT now()
);
