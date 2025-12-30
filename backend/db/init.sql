CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT, 
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT DEFAULT 'guest'
); 