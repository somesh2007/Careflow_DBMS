-- ============================================================
-- CareFlow Hospital Management System — PostgreSQL Schema
-- ============================================================

-- Run as: psql -U postgres -f database.sql

CREATE DATABASE careflow;
\c careflow;

-- ─── DOCTORS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  specialization   VARCHAR(100) NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  email            VARCHAR(100) NOT NULL,
  room_no          VARCHAR(20)  NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── PATIENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  age              INT          NOT NULL CHECK (age BETWEEN 0 AND 130),
  gender           VARCHAR(10)  NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  address          VARCHAR(200) NOT NULL,
  blood_group      VARCHAR(5)   NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── APPOINTMENTS ───────────────────────────────────────────
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS appointments (
  id               SERIAL PRIMARY KEY,
  doctor_id        INT                NOT NULL REFERENCES doctors(id)  ON DELETE CASCADE,
  patient_id       INT                NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ        NOT NULL,
  reason           VARCHAR(200)       NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'scheduled',
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ─── ADMINS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Default admin: username=admin, password=admin123
INSERT INTO admins (username, password) VALUES
  ('admin', '$2b$10$9z0lFQKd5YnE6FzHsX9lUuYzQkLvNqDfCbCkSmLjH5MqKBXiXf3c6');

-- ─── SAMPLE DATA ────────────────────────────────────────────
INSERT INTO doctors (name, specialization, phone, email, room_no) VALUES
  ('Dr. Anjali Mehta',  'Cardiologist',   '+91-9876543210', 'anjali.mehta@hms.test',  'A-101'),
  ('Dr. Rohan Kapoor',  'Pediatrician',   '+91-9876501234', 'rohan.kapoor@hms.test',  'B-202'),
  ('Dr. Priya Iyer',    'Dermatologist',  '+91-9988776655', 'priya.iyer@hms.test',    'C-303');

INSERT INTO patients (name, age, gender, phone, address, blood_group) VALUES
  ('Aarav Sharma',  32, 'Male',   '+91-9123456780', '12 MG Road, Pune',  'O+'),
  ('Neha Patil',    37, 'Female', '+91-9988123456', '45 FC Road, Pune',  'A+'),
  ('Sameer Khan',   45, 'Male',   '+91-9112233445', '78 JM Road, Pune',  'B+');

INSERT INTO appointments (doctor_id, patient_id, appointment_date, reason, status) VALUES
  (1, 1, '2026-04-22 11:12:00+05:30', 'Routine cardiac check-up',       'cancelled'),
  (2, 2, '2026-04-22 17:00:00+05:30', 'Child vaccination follow-up',    'scheduled'),
  (2, 1, '2026-04-23 11:12:00+05:30', 'Cancelled — patient unavailable','cancelled'),
  (3, 3, '2026-04-18 11:12:00+05:30', 'Skin allergy follow-up',         'scheduled'),
  (1, 3, '2026-04-14 11:12:00+05:30', 'Chest pain consultation',        'completed'),
  (2, 1, '2026-04-11 11:12:00+05:30', 'General checkup',                'cancelled');
