CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitor_locations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  latitude NUMERIC NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  consent_given BOOLEAN NOT NULL CHECK (consent_given IS TRUE),
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE visitor_locations
  ALTER COLUMN latitude TYPE NUMERIC,
  ALTER COLUMN longitude TYPE NUMERIC;

CREATE INDEX IF NOT EXISTS visitor_locations_consented_at_idx
  ON visitor_locations (consented_at DESC);

CREATE TABLE IF NOT EXISTS reader_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(16) NOT NULL,
  comment TEXT NOT NULL CHECK (char_length(comment) <= 1000),
  publish_consent BOOLEAN NOT NULL CHECK (publish_consent IS TRUE),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reader_comments_created_at_idx
  ON reader_comments (created_at DESC);
