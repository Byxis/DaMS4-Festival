CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'guest'
);

CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('publisher')),
    name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'PUBLISHER' CHECK (type IN ('PUBLISHER', 'GUEST')),
    first_name TEXT,
    last_name TEXT
);

CREATE OR REPLACE VIEW publisher AS 
    SELECT id, name
    FROM entities 
    WHERE type = 'PUBLISHER';

CREATE OR REPLACE VIEW other AS 
    SELECT id, name, first_name, last_name
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

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER REFERENCES festivals(id) ON DELETE CASCADE,
    entity_id INTEGER REFERENCES entities(id) ON DELETE CASCADE,
    presented_by_them BOOLEAN DEFAULT FALSE,
    table_count INT DEFAULT 0,
    big_table_count INT DEFAULT 0,
    town_table_count INT DEFAULT 0,
    status TEXT DEFAULT 'TO_BE_CONTACTED' CHECK (status IN ('TO_BE_CONTACTED', 'CONTACTED', 'IN_DISCUSSION', 'FACTURED', 'AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED'))
);

SELECT setval('entities_id_seq', (SELECT MAX(id) FROM entities) + 1);
SELECT setval('contact_id_seq', (SELECT MAX(id) FROM contact) + 1);
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users) + 1);
SELECT setval('festivals_id_seq', (SELECT MAX(id) FROM festivals) + 1);

CREATE OR REPLACE FUNCTION insert_into_other_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO entities (name, first_name, last_name, type)
    VALUES (NEW.name, NEW.first_name, NEW.last_name, 'GUEST')
    RETURNING id INTO NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insert_other
INSTEAD OF INSERT ON other
FOR EACH ROW EXECUTE FUNCTION insert_into_other_func();