import pool from "./database.js";
import bcrypt from "bcryptjs";

export async function ensureAdmin() {
    const hash = await bcrypt.hash("admin", 10);
    await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES ('admin', 'admin', 'admin', $1, 'admin')
        ON CONFLICT (email) DO NOTHING`,
        [hash]
    );
    
    console.log("👍 Compte admin vérifié ou créé");
}


