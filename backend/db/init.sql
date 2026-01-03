CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS publisher (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
); 

CREATE TABLE IF NOT EXISTS contact (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER REFERENCES publisher(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    family_name TEXT NOT NULL,
    role TEXT,
    telephone TEXT,
    email TEXT
); 

CREATE TABLE IF NOT EXISTS festivals (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    table_count INT DEFAULT 0,
    big_table_count INT DEFAULT 0,
    town_table_count INT DEFAULT 0
); 



SELECT setval('publisher_id_seq', (SELECT MAX(id) FROM publisher) + 1);
SELECT setval('contact_id_seq', (SELECT MAX(id) FROM contact) + 1);
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users) + 1);
SELECT setval('festivals_id_seq', (SELECT MAX(id) FROM festivals) + 1);