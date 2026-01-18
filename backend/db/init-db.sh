#!/bin/bash
set -e


# Attendre que PostgreSQL soit prêt
until pg_isready -h localhost -U secureapp; do
  echo "⏳ PostgreSQL pas encore prêt..."
  sleep 2
done

echo " PostgreSQL is ready"


psql -U secureapp -h localhost << EOF
DROP DATABASE IF EXISTS secureapp;
CREATE DATABASE secureapp;
EOF


psql -U secureapp -h localhost -d secureapp -f /docker-entrypoint-initdb.d/init.sql


psql -U secureapp -h localhost -d secureapp -c "SELECT COUNT(*) as games FROM games; SELECT COUNT(*) as editors FROM editors;"

echo " Database setted up succesfully"