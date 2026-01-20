#!/bin/bash
set -e


# Attendre que PostgreSQL soit prêt
until pg_isready -h localhost -U ayae-festival; do
  echo "⏳ PostgreSQL pas encore prêt..."
  sleep 2
done

echo " PostgreSQL is ready"


psql -U ayae-festival -h localhost << EOF
DROP DATABASE IF EXISTS ayae-festival;
CREATE DATABASE ayae-festival;
EOF


psql -U ayae-festival -h localhost -d ayae-festival -f /docker-entrypoint-initdb.d/init.sql


psql -U ayae-festival -h localhost -d ayae-festival -c "SELECT COUNT(*) as games FROM games; SELECT COUNT(*) as editors FROM editors;"

echo " Database setted up succesfully"