import bcrypt from "bcryptjs";

import pool from "./database.js";

interface UserCredentials
{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
}

async function ensureUser(credentials: UserCredentials)
{
    const hash = await bcrypt.hash(credentials.password, 10);
    await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING`,
        [credentials.firstName, credentials.lastName, credentials.email, hash, credentials.role]);
    console.log(`👍 Compte ${credentials.role} (${credentials.email}) vérifié ou créé`);
}

export async function ensureAdmin()
{
    await ensureUser({
        email: process.env.ADMIN_EMAIL || "admin@ayaefestivals.fr",
        password: process.env.ADMIN_PASSWORD || "admin",
        firstName: process.env.ADMIN_FIRST_NAME || "Admin",
        lastName: process.env.ADMIN_LAST_NAME || "Istrateur",
        role: "admin"
    });
}

export async function ensureEditor()
{
    await ensureUser({
        email: process.env.EDITOR_EMAIL || "editor@ayaefestivals.fr",
        password: process.env.EDITOR_PASSWORD || "editor",
        firstName: process.env.EDITOR_FIRST_NAME || "Editor",
        lastName: process.env.EDITOR_LAST_NAME || "Default",
        role: "editor"
    });
}

export async function ensurePublisher()
{
    await ensureUser({
        email: process.env.PUBLISHER_EMAIL || "publisher@ayaefestivals.fr",
        password: process.env.PUBLISHER_PASSWORD || "publisher",
        firstName: process.env.PUBLISHER_FIRST_NAME || "Publisher",
        lastName: process.env.PUBLISHER_LAST_NAME || "Default",
        role: "publisher"
    });
}

export async function ensureGuest()
{
    await ensureUser({
        email: process.env.GUEST_EMAIL || "guest@ayaefestivals.fr",
        password: process.env.GUEST_PASSWORD || "guest",
        firstName: process.env.GUEST_FIRST_NAME || "Guest",
        lastName: process.env.GUEST_LAST_NAME || "User",
        role: "guest"
    });
}
