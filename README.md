# DaMS-Festival

in order to load the game and editor data :

docker cp backend/db/init.sql secureapp_db_prod:/init.sql

docker exec -i secureapp_db_prod psql -U secureapp << 'EOF'
DROP DATABASE IF EXISTS secureapp;
CREATE DATABASE secureapp;
EOF

docker exec -it secureapp_db_prod psql -U secureapp -d secureapp -f /init.sql

