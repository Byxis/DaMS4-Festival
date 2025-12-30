import { Router } from "express";
import pool from "../db/database.js";
import { requireAdmin } from "../middleware/auth-admin.js";


const router = Router();
// Festivals's list
// To the intent of the forgetful developer that I am, 
//routers.gets are used to handle the get requests for festivals data from the database.
router.get("/", async (_req, res) => {
    const { rows } = await pool.query("SELECT id, name, location, " +
        "start_date, end_date, table_count, big_table_count, town_table_count FROM festivals");
    res.json(rows);
});


//get only one festival by id 
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


//Deleting a festival by id. Requires admin rights.
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

//Creation of a festival. Requires admin rights, and a verify token also on server.ts route
router.post("/", requireAdmin, async (req, res) => {
    console.log("Creating a festival...");
    console.log(req.body);
    const b = req.body;
    console.log("Données reçues pour le festival : ", b);
    // const { name, location, start_date, end_date, table_count, big_table_count, town_table_count } = b;

    if (!b.name || !b.location || !b.start_date || !b.end_date) {
        console.log("Voici les champs reçus : ", b.name, b.location, b.start_date, b.end_date, b.table_count, b.big_table_count, b.town_table_count);
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

export default router;