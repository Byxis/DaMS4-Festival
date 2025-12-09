import { Router } from "express";
import pool from "../db/database.js";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middleware/auth-admin.js";
import fetch from "node-fetch";
import { DOMParser } from 'xmldom';


const router = Router();



router.get("/search", async (req, res) => {
 const gameName = (req.query.gameName || '').toString();
  try {
    const q = `
      SELECT g.id, g.name, g.minimum_number_of_player, g.maximum_number_of_player,
             g.editor_id, g.type_of_games_id, g.logo,
             e.name AS editor_name
      FROM games g
      JOIN editors e ON e.id = g.editor_id
      WHERE g.name ILIKE $1
      ORDER BY g.id;
    `;
    const params = [`%${gameName}%`]; 
    const result = await pool.query(q, params);
    res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de la recherche par game's name" });
  }
});

router.post("/", async (req, res) => {
  console.log("POST /api/game", req.body);
  const { name, editor, type, minimum_number_of_player, maximum_number_of_player } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO games (name, editor, type, minimum_number_of_player, maximum_number_of_player)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, editor, type, minimum_number_of_player, maximum_number_of_player]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de l'ajout du jeu" });
  }
});

router.get("/loadAll", async (req, res) => {
  console.log("loadAll /api/game", req.body);
  
  try {
    const result = await pool.query(
      `
      SELECT g.id,
             g.name,
             g.minimum_number_of_player,
             g.maximum_number_of_player,
             g.editor_id,
             g.type_of_games_id,
             g.logo,
             e.name AS editor_name,
             t.description AS type
      FROM games g
      LEFT JOIN editors e ON e.id = g.editor_id
      LEFT JOIN type_of_games t ON g.type_of_games_id = t.id
      ORDER BY g.id;
    `);
    res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de l'ajout du jeu" });
  }
});

router.delete("/delete", async (req, res) => {
  console.log("delete", req.body);
   const { id } = req.body;
  try {
    const result = await pool.query(
      `DELETE FROM games WHERE id=$1 RETURNING*`,
      [id]
    );
    res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});


router.get("/filterByEditor", async (req, res) => {
  const editorName = (req.query.editorName || '').toString();
  try {
    const q = `
      SELECT g.id, g.name, g.minimum_number_of_player, g.maximum_number_of_player,
             g.editor_id, g.type_of_games_id, g.logo,
             e.name AS editor_name
      FROM games g
      JOIN editors e ON e.id = g.editor_id
      WHERE e.name ILIKE $1
      ORDER BY g.id;
    `;
    const params = [`%${editorName}%`]; 
    const result = await pool.query(q, params);
    res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de la recherche par editor" });
  }
});


export default router;