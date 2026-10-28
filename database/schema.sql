-- Liyu Restaurant Management System: database schema (PostgreSQL)
-- Structure only, no data.
--
-- Usage:
--   psql "$DATABASE_URL" -f database/schema.sql
-- (or paste this file into your provider's SQL editor, e.g. Neon)
--
-- After creating the tables, sign up a user in the app and promote it:
--   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- ---------------------------------------------------------------
-- Users (roles used by the app: customer, waiter, chef, admin)
-- ---------------------------------------------------------------
CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    username            VARCHAR(50)  NOT NULL UNIQUE,
    email               VARCHAR(80)  NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(20)  NOT NULL,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token         VARCHAR(255),
    reset_token_expires TIMESTAMP
);

-- ---------------------------------------------------------------
-- Menu
-- ---------------------------------------------------------------
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url   VARCHAR(500)
);

CREATE TABLE menu_items (
    id           SERIAL PRIMARY KEY,
    category_id  INTEGER REFERENCES categories(id),
    name         VARCHAR(50) NOT NULL,
    description  TEXT,
    price        NUMERIC NOT NULL,
    is_available BOOLEAN DEFAULT true,
    image_url    VARCHAR(500),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------
CREATE TABLE orders (
    id                    SERIAL PRIMARY KEY,
    user_id               INTEGER REFERENCES users(id),
    table_number          INTEGER,
    status                VARCHAR(50) DEFAULT 'pending_payment',
    total_amount          NUMERIC DEFAULT 0,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_type            VARCHAR(50) NOT NULL DEFAULT 'dine_in',
    delivery_address      TEXT,
    delivery_phone        VARCHAR(20),
    special_instructions  TEXT,
    payment_method        VARCHAR(20) NOT NULL,
    payment_status        VARCHAR(20) DEFAULT 'pending',
    payment_id            VARCHAR(100),
    payment_reference     VARCHAR(100),
    bank_reference_number VARCHAR(100),
    payment_verified_at   TIMESTAMP,
    tx_ref                VARCHAR(100) UNIQUE,
    updated_at            TIMESTAMP DEFAULT now(),

    CHECK (status IN ('pending_payment', 'payment_verified', 'preparing',
                      'ready', 'completed', 'payment_failed')),
    CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
    CHECK (payment_method IN ('bank_transfer', 'm_pesa', 'tele_birr')),
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
    -- delivery orders must have an address and a phone number
    CHECK (order_type <> 'delivery'
           OR (delivery_address IS NOT NULL AND delivery_phone IS NOT NULL))
);

CREATE TABLE order_items (
    id                   SERIAL PRIMARY KEY,
    order_id             INTEGER REFERENCES orders(id),
    menu_item_id         INTEGER REFERENCES menu_items(id),
    quantity             INTEGER NOT NULL,
    price_at_time        NUMERIC NOT NULL,
    special_instructions TEXT,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------
-- Reservations
-- ---------------------------------------------------------------
CREATE TABLE reservations (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER REFERENCES users(id),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guests           INTEGER NOT NULL,
    special_requests TEXT,
    status           VARCHAR(20) DEFAULT 'pending',
    table_number     INTEGER,
    created_at       TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------
CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    rating      INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------
-- Kitchen: low stock reports
-- ---------------------------------------------------------------
CREATE TABLE low_stock_reports (
    id               SERIAL PRIMARY KEY,
    reported_by      INTEGER REFERENCES users(id),
    item_name        VARCHAR(255) NOT NULL,
    current_quantity VARCHAR(100),
    unit             VARCHAR(50),
    notes            TEXT,
    status           VARCHAR(20) DEFAULT 'pending',
    created_at       TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------
-- Contact form messages
-- ---------------------------------------------------------------
CREATE TABLE contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    subject    VARCHAR(200) NOT NULL,
    message    TEXT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'unread',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (status IN ('unread', 'read', 'resolved'))
);