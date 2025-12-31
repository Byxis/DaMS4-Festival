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


INSERT INTO festivals (name, location, start_date, end_date, table_count, big_table_count, town_table_count) VALUES
    ('Festival du Jeu de Montpellier', 'Montpellier', '2024-08-23', '2024-08-25', 50, 10, 5),
    ('La gigue du feu du Vigan', 'Vigan(ligne 608)', '2024-07-11', '2024-07-14', 80, 15, 8),
    ('Ariège Gaming XVI', 'Montjoie En Couserans', '2024-06-20', '2024-06-23', 100, 20, 10)
ON CONFLICT (name) DO NOTHING;
