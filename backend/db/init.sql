CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user'
); 

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    editor TEXT NOT NULL,
    type TEXT DEFAULT '--',
    minimum_number_of_player INTEGER,
    maximum_number_of_player integer
); 



