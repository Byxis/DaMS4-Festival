import { Router } from "express";
import pool from "../db/database.js";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middleware/auth-admin.js";
import fetch from "node-fetch";
import { DOMParser } from 'xmldom';


const router = Router();



router.get("/search", async (req, res) => {
  const gameName = (req.query.gameName || '').toString().trim();
  try {
    const q = `
      SELECT g.id, g.name, g.minimum_number_of_player, g.maximum_number_of_player,
             g.editor_id, g.type_of_games_id, g.logo,
             e.name AS editor_name,
             t.description AS type
      FROM games g
      LEFT JOIN editors e ON e.id = g.editor_id
      LEFT JOIN type_of_games t ON t.id = g.type_of_games_id
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
  const {
    name,
    editor_name,
    type,
    minimum_number_of_player,
    maximum_number_of_player,
    logo
  } = req.body;

  let finalEditorId : number|null = null;
  let finalTypeOfGameID : number|null = null;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    
    //check if editors exists in the db
    if (editor_name && editor_name.toString().trim() !== "") {
      const r = await client.query(
        "SELECT id FROM editors WHERE LOWER(name) = LOWER($1) LIMIT 1",
        [editor_name]
      );
      if (r.rowCount) {
        finalEditorId = r.rows[0].id;
      } else {
        const ins = await client.query(
          "INSERT INTO editors(name) VALUES($1) RETURNING id",
          [editor_name]
        );
        finalEditorId = ins.rows[0].id;
      }
    }

   
    
    //check if the type of game exists in the db
   if (type && type.toString().trim() !== "") {
      const r2 = await client.query(
        "SELECT id FROM type_of_games WHERE LOWER(description) = LOWER($1) LIMIT 1",
        [type]
      );
      if (r2.rowCount) {
        finalTypeOfGameID = r2.rows[0].id;
      } else {
        const ins2 = await client.query(
          "INSERT INTO type_of_games(description) VALUES($1) RETURNING id",
          [type]
        );
        finalTypeOfGameID = ins2.rows[0].id;
      }
    }

    
    const result = await client.query(
      `INSERT INTO games (name, minimum_number_of_player, maximum_number_of_player, logo, editor_id, type_of_games_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        name,
        minimum_number_of_player ?? null,
        maximum_number_of_player ?? null,
        logo ?? null,
        finalEditorId,
        finalTypeOfGameID
      ]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Erreur lors de l'ajout du jeu" });
  } finally {
    client.release();
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
      JOIN editors e ON e.id = g.editor_id    
      LEFT JOIN type_of_games t ON t.id = g.type_of_games_id
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



router.get("/filter", async (req, res) => {
  
  const typeDesc   = (req.query.type || '').toString().trim();
  const minPlayers = req.query.min ? Number(req.query.min) : null;
  const maxPlayers = req.query.max ? Number(req.query.max) : null;
  
   try {
    const conditions: string[] = [];
    const params: any[] = [];

    
    if (typeDesc !== '') {
      params.push(`%${typeDesc}%`);
      const idx = params.length;
      conditions.push(`t.description ILIKE $${idx}`);
    }
   
    if (minPlayers !== null && !Number.isNaN(minPlayers)) {
      params.push(minPlayers);
      const idx = params.length;
      conditions.push(`g.minimum_number_of_player >= $${idx}`);
    }
    if (maxPlayers !== null && !Number.isNaN(maxPlayers)) {
      params.push(maxPlayers);
      const idx = params.length;
      conditions.push(`g.maximum_number_of_player <= $${idx}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const q = `
      SELECT g.id, g.name, g.minimum_number_of_player, g.maximum_number_of_player,
             g.editor_id, g.type_of_games_id, g.logo,
             e.name AS editor_name,
             t.description AS type
      FROM games g
      LEFT JOIN editors e ON e.id = g.editor_id
      LEFT JOIN type_of_games t ON t.id = g.type_of_games_id
      ${where}
      
    `;

    const result = await pool.query(q, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors du filtrage des jeux" });
  }
});



export default router;