
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user'
); 






CREATE TABLE IF NOT EXISTS editors (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    logo TEXT
);

CREATE TABLE IF NOT EXISTS type_of_games (
    id SERIAL PRIMARY KEY,
    description TEXT UNIQUE NOT NULL
); 


CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'other',
    minimum_number_of_player INTEGER,
    maximum_number_of_player INTEGER,
    logo TEXT,
    editor_id INTEGER REFERENCES editors(id),
    type_of_games_id INTEGER REFERENCES type_of_games(id)
); 





COPY editors(id, name, logo)
FROM '/Data/editorsData.csv'
DELIMITER ','
CSV HEADER;

-- Pour les types de jeux
COPY type_of_games(id, description)
FROM '/Data/typesOfGamesData.csv'
DELIMITER ','
CSV HEADER;

-- Pour les jeux
COPY games(id, name, minimum_number_of_player, maximum_number_of_player, editor_id, type_of_games_id, logo)
FROM '/Data/GamesDATA.csv'
DELIMITER ','
CSV HEADER;

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

CREATE TABLE IF NOT EXISTS games_publisher (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER REFERENCES publisher(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'other',
    minimum_number_of_player INTEGER,
    maximum_number_of_player INTEGER,
    logo TEXT,
    type_of_games_id INTEGER REFERENCES type_of_games(id)
); 




