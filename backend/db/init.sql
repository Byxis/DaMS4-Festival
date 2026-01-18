CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT, 
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'guest'
);

-- REFERENCE TABLES (loaded from CSV) --
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
    editor_id INTEGER REFERENCES editors(id), -- Reference to Reference Table
    type_of_games_id INTEGER REFERENCES type_of_games(id)
); 

-- APP TABLES --
CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    type TEXT DEFAULT 'PUBLISHER' CHECK (type IN ('PUBLISHER', 'GUEST'))
);

CREATE OR REPLACE VIEW publisher AS 
    SELECT id, name, logo
    FROM entities 
    WHERE type = 'PUBLISHER';

CREATE OR REPLACE VIEW other AS 
    SELECT id, name
    FROM entities 
    WHERE type <> 'PUBLISHER';


CREATE TABLE IF NOT EXISTS contact (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER REFERENCES entities(id) ON DELETE CASCADE, 
    name TEXT NOT NULL,
    family_name TEXT NOT NULL,
    role TEXT,
    telephone TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS games_publisher (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER REFERENCES entities(id) ON DELETE CASCADE, -- Reference to App Table
    name TEXT NOT NULL,
    type TEXT DEFAULT 'other',
    minimum_number_of_player INTEGER,
    maximum_number_of_player INTEGER,
    logo TEXT,
    type_of_games_id INTEGER REFERENCES type_of_games(id)
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

CREATE TABLE IF NOT EXISTS tarif_zone(
    id SERIAL PRIMARY KEY,
    festival_id INTEGER REFERENCES festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    numberOutlets INTEGER DEFAULT 0,
    electricalOutletPrice INTEGER DEFAULT 0,
    maxTable INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS game_zone(
    id SERIAL PRIMARY KEY,
    tarif_zone_id INTEGER REFERENCES tarif_zone(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    reserved_table INTEGER DEFAULT 0,
    reserved_big_table INTEGER DEFAULT 0,
    reserved_town_table INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER REFERENCES festivals(id) ON DELETE CASCADE,
    entity_id INTEGER REFERENCES entities(id) ON DELETE CASCADE,
    presented_by_them BOOLEAN DEFAULT FALSE,
    table_count INT DEFAULT 0,
    big_table_count INT DEFAULT 0,
    town_table_count INT DEFAULT 0,
    electrical_outlets INT DEFAULT 0,
    note TEXT,
    status TEXT DEFAULT 'TO_BE_CONTACTED' CHECK (status IN ('TO_BE_CONTACTED', 'CONTACTED', 'IN_DISCUSSION', 'FACTURED', 'AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'ABSENT'))
);

CREATE TABLE IF NOT EXISTS reservation_interactions (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    description TEXT,
    interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservation_games (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL,
    amount INT DEFAULT 0,
    table_count INT DEFAULT 0,
    big_table_count INT DEFAULT 0,
    town_table_count INT DEFAULT 0,
    electrical_outlets INT DEFAULT 0,
    floor_space INT DEFAULT 0,
    zone_id INTEGER REFERENCES game_zone(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'ASKED' CHECK (status IN ('ASKED', 'CONFIRMED', 'RECEIVED', 'CANCELLED'))
);

CREATE OR REPLACE FUNCTION insert_into_other_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO entities (name, type)
    VALUES (NEW.name, 'GUEST')
    RETURNING id INTO NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insert_other
INSTEAD OF INSERT ON other
FOR EACH ROW EXECUTE FUNCTION insert_into_other_func();

-- Load Data (Reference Tables Only)
COPY editors(id, name, logo) FROM '/tmp/editorsData.csv' WITH (FORMAT csv, HEADER);
COPY type_of_games(id, description) FROM '/tmp/typesOfGamesData.csv' WITH (FORMAT csv, HEADER);
COPY games(id, name, minimum_number_of_player, maximum_number_of_player, editor_id, type_of_games_id, logo) 
FROM '/tmp/GamesDATA.csv' WITH (FORMAT csv, HEADER);

-- Fix sequences after data load
SELECT setval('editors_id_seq', (SELECT MAX(id) FROM editors) + 1);
SELECT setval('games_id_seq', (SELECT MAX(id) FROM games) + 1);


-- Fix sequences after data load
SELECT setval('entities_id_seq', (SELECT MAX(id) FROM entities) + 1);
SELECT setval('contact_id_seq', (SELECT MAX(id) FROM contact) + 1);
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users) + 1);
SELECT setval('tarif_zone_id_seq', (SELECT MAX(id) FROM tarif_zone) + 1);
SELECT setval('game_zone_id_seq', (SELECT MAX(id) FROM game_zone) + 1);
SELECT setval('festivals_id_seq', (SELECT MAX(id) FROM festivals) + 1);
