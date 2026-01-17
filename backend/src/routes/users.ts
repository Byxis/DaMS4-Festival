import { Router } from "express";
import pool from "../db/database.js";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middleware/auth-admin.js";

const router = Router();
// Liste des utilisateurs

router.get("/", async (_req, res) => {
    const { rows } = await pool.query("SELECT id, email, first_name AS \"firstName\", last_name AS \"lastName\", role FROM users");
    res.json(rows);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, role } = req.body;

  try {
    const safeFirstName = (firstName ?? "").trim();
    const safeLastName = (lastName ?? "").trim();

    const result = await pool.query(
      `UPDATE users
       SET first_name=$1, last_name=$2, email=$3, role=$4
       WHERE id=$5
       RETURNING id, first_name as \"firstName\", last_name as \"lastName\", email, role`,
      [safeFirstName, safeLastName, email, role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    return res.status(200).json({
      message: "Utilisateur modifié",
      user: result.rows[0],
    });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query(
        "SELECT id, email, first_name AS \"firstName\", last_name AS \"lastName\", role FROM users WHERE id = $1",
        [id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(rows[0]);
});

// Création d'un utilisateur
router.post("/register", async (req, res) => {
    const { email, password, firstName, lastName, role} = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email requis" });
    }

    const safeFirstName = (firstName ?? "").trim();
    const safeLastName = (lastName ?? "").trim();
    const safeRole = (role ?? "guest").trim();

    const passwordToUse = password ?? crypto.randomUUID();

    try {
        const hash = await bcrypt.hash(passwordToUse, 10);
        const result = await pool.query(
            "INSERT INTO users (first_name, last_name, email, role, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name AS \"firstName\", last_name AS \"lastName\", role",
            [safeFirstName, safeLastName, email, safeRole, hash]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        if (err.code === "23505") {
            res.status(409).json({ error: "Email déjà existant" });
        } else {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }
    
});

// Création d'un utilisateur par un admin (invitation)
router.post("/invite", requireAdmin, async (req, res) => {
  const { email, firstName, lastName, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email et rôle requis" });
  }

  try {
    // Check if user already exists
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const existingUser = rows[0];

    if (existingUser) {
      return res.status(409).json({ error: "Utilisateur déjà existant" });
    }

    const { rows: newRows } = await pool.query(
      `INSERT INTO users (email, first_name, last_name, role, password_hash)
       VALUES ($1, $2, $3, $4, NULL)
       RETURNING id, email, first_name, last_name, role`,
      [
        email,
        firstName || null,
        lastName || null,
        role,
      ]
    );

    const user = newRows[0];

    return res.status(201).json({
      message: "Utilisateur invité",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});



router.get("/me", async (req, res) => {
    const user = req.user;
    const { rows } = await pool.query(
        "SELECT id, email, first_name AS \"firstName\", last_name AS \"lastName\", role FROM users WHERE id=$1",
        [user?.id]
    );
    res.json(rows[0]);
});
// Liste de tous les utilisateurs (réservée aux admins)
router.get("/", requireAdmin, async (_req, res) => {
    const { rows } = await pool.query(
        "SELECT id, email, first_name AS \"firstName\", last_name AS \"lastName\", role FROM users ORDER BY id"
    );
    res.json(rows);
});

router.delete("/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    res.json({
        message: "Utilisateur supprimé",
        user: rows[0],
    });
});

export default router;
