import { Router } from "express";
import pool from "../db/database.js";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middleware/auth-admin.js";

const router = Router();
// Liste des utilisateurs

router.get("/", async (_req, res) => {
    const { rows } = await pool.query("SELECT id, email, first_name, last_name, role FROM users");
    res.json(rows);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query(
        "SELECT id, email, first_name, last_name, role FROM users WHERE id = $1",
        [id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(rows[0]);
});

// Création d'un utilisateur
router.post("/", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Prénom, Nom, email et mot de passe requis" });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4)",
            [firstName, lastName, email, hash]
        );
        res.status(201).json({ message: "Utilisateur créé" });
    } catch (err: any) {
        if (err.code === "23505") {
            res.status(409).json({ error: "Email déjà existant" });
        } else {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }
});

router.get("/me", async (req, res) => {
    const user = req.user;
    const { rows } = await pool.query(
        "SELECT id, email, first_name, last_name, role FROM users WHERE id=$1",
        [user?.id]
    );
    res.json(rows[0]);
});
// Liste de tous les utilisateurs (réservée aux admins)
router.get("/", requireAdmin, async (_req, res) => {
    const { rows } = await pool.query(
        "SELECT id, email, first_name, last_name, role FROM users ORDER BY id"
    );
    res.json(rows);
});

export default router;
