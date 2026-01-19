import pkg from 'pg'

const {Pool} = pkg
// Récupération de la variable d'environnement Docker

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://ayae-festival:ayae-festival@localhost:5432/ayae-festival',
});


export default pool