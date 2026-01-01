import { Router } from "express";
import pool from "../db/database.js";
import { requireAdmin } from "../middleware/auth-admin.js";

/**
 * Routes for managing festivals CRUD. 
 * All routes that modify data require rights. (and  will be marked with ! )
 * 
 * Endpoints:
 * GET /api/festivals/ : Get all festivals
 * ! POST /api/festivals/ ! : Create a new festival (admin only)
 * 
 * GET /api/festivals/:id : Get a festival by ID
 * ! DELETE /api/festivals/:id ! : Delete a festival by ID (admin only)
 */

const router = Router();


//---------- /api/festivals/ ----------*/

//GET /api/festivals - Retrieve all festivals
router.get("/", async (_req, res) => {
    const { rows } = await pool.query("SELECT id, name, location, " +
        "start_date, end_date, table_count, big_table_count, town_table_count FROM festivals");
    res.json(rows);
});


//POST /api/festivals - Create a new festival ! Requires admin rights
router.post("/", requireAdmin, async (req, res) => {
    const b = req.body;
    // const { name, location, start_date, end_date, table_count, big_table_count, town_table_count } = b;

    if (!b.name || !b.location || !b.start_date || !b.end_date) {
        return res.status(400).json({ error: "Champs manquants" });
    }
    try {
        const { rows } = await pool.query(
            "INSERT INTO festivals (name, location, start_date, end_date, table_count, big_table_count, town_table_count) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [b.name, b.location, b.start_date, b.end_date, b.table_count || 0, b.big_table_count || 0, b.town_table_count || 0]
        );
        res.status(201).json({ id: rows[0].id });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création du festival" });
    }
});

/* ---------- /api/festivals/:id ----------*/


//GET /api/festivals/:id -Retrieve a festival by its ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query(
        "SELECT id, name, location, start_date, end_date, table_count, big_table_count, town_table_count FROM festivals WHERE id = $1",
        [id]
    );
if (rows.length === 0) {
        return res.status(404).json({ error: "Festival non trouvé" });
    }
    res.json(rows[0]);
});


//DELETE /api/festivals/:id - Delete a festival by its ID ! Requires admin rights
router.delete("/:id", requireAdmin,  async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query(
            "DELETE FROM festivals WHERE id = $1",
            [id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: "Festival non trouvé" });
        }
        res.json({ message: "Festival supprimé" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression du festival" });
    }
});


export default router;