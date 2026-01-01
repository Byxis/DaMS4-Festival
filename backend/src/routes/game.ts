import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db/database.js";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middleware/auth-admin.js";
import fetch from "node-fetch";
import { DOMParser } from 'xmldom';

import fs from "fs";  
import path from "path";


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

router.post("/addGameToPublisher", async (req, res) => {
  const {
    name,
    publisher_id,
    type,
    minimum_number_of_player,
    maximum_number_of_player,
    logo
  } = req.body;

 
  if (!publisher_id || Number.isNaN(Number(publisher_id))) {
    return res.status(400).json({ error: "publisher_id is required and must be a number" });
  }

  if (!name || name.toString().trim() === "") {
    return res.status(400).json({ error: "name is required" });
  }

  let finalTypeOfGameID: number | null = null;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    if (type && type.toString().trim() !== "") {
      const r = await client.query(
        "SELECT id FROM type_of_games WHERE LOWER(description) = LOWER($1) LIMIT 1",
        [type]
      );
      if (r.rowCount) {
        finalTypeOfGameID = r.rows[0].id;
      } else {
        const ins = await client.query(
          "INSERT INTO type_of_games(description) VALUES($1) RETURNING id",
          [type]
        );
        finalTypeOfGameID = ins.rows[0].id;
      }
    }

    
  
    const result = await client.query(
      `INSERT INTO games_publisher (name, publisher_id, minimum_number_of_player, maximum_number_of_player, logo, type_of_games_id)
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *, (SELECT name FROM publisher WHERE id = $2) AS editor_name`,
      [
        name,
        publisher_id,
        minimum_number_of_player ?? null,
        maximum_number_of_player ?? null,
        logo ?? null,
        finalTypeOfGameID
      ]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Erreur lors de l'ajout du jeu au publisher" });
  } finally {
    client.release();
  }
});



  
router.get("/numberOfGameExisting/:publisherId", async (req: Request, res: Response) => {
  const { publisherId } = req.params;

  if (!publisherId || !/^\d+$/.test(publisherId)) {
    return res.status(400).json({ error: "Invalid publisher ID" });
  }

  try {
    
     const publisherResult = await pool.query(
      `SELECT id, name FROM publisher WHERE id = $1`,
      [publisherId]
    );

     if (!publisherResult.rowCount || publisherResult.rowCount === 0) {
      return res.status(200).json({ hasGames: false });
    }

    const publisherName = publisherResult.rows[0].name;

     const editorResult = await pool.query(
      `SELECT id FROM editors WHERE LOWER(name) = LOWER($1)`,
      [publisherName]
    );

    if (!editorResult.rowCount || editorResult.rowCount === 0) {
      return res.status(200).json({ hasGames: false });
    }

    const editorExists = editorResult.rowCount > 0;

    let gameCount = 0;
    if (editorExists) {
      const editorId = editorResult.rows[0].id;
      const gamesResult = await pool.query(
        `SELECT COUNT(*) as count FROM games WHERE editor_id = $1`,
        [editorId]
      );
      gameCount = parseInt(gamesResult.rows[0].count, 10);
    }
    console.log("hasGames :", gameCount > 0);
     res.status(200).json({
      hasGames: gameCount > 0
    });

    
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: errorMessage });
  }
});




router.get("/numberOfPresentedGame/:publisherId", async (req: Request, res: Response) => {
  const { publisherId } = req.params;

  if (!publisherId || !/^\d+$/.test(publisherId)) {
    return res.status(400).json({ error: "Invalid publisher ID" });
  }

  try {
    
    const numberOfGame = await pool.query(
      `SELECT COUNT(*) as count FROM games_publisher WHERE publisher_id = $1`,
      [publisherId]
    );

    const gameCount = parseInt(numberOfGame.rows[0].count, 10);
   console.log("gameCount : ", gameCount);
    res.status(200).json({
      gameCount: gameCount, 
      
    });
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: errorMessage });
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


router.post("/:id/logo", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No logo file provided" });
    }

    const uploadDir = "./uploads/logos";
   
    const ext = req.file.originalname.split('.').pop() || "jpg";
    const filename = `game-${id}.${ext}`;
    const fullPath = path.join(uploadDir, filename);


    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.renameSync(req.file.path, fullPath);
    
    console.log('✅ Fichier sauvegardé:', fullPath);
    console.log('📄 Existe?', fs.existsSync(fullPath));
    console.log('📊 Taille:', fs.statSync(fullPath).size);

    // ✅ Update BD
    await pool.query(
      `UPDATE games_publisher SET logo = $1 WHERE id = $2`,
      [fullPath, id]  
    );

    res.status(200).json({ logoUrl: fullPath });
    } catch (e) {
    console.error('❌ Erreur:', e);
    
    const errorMessage = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: errorMessage });
  }
});



router.get("/:id/logo", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const uploadDir = path.resolve("./uploads/logos");
    
    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({ error: "Upload directory not found" });
    }

    const files = fs
      .readdirSync(uploadDir)
      .filter((f: string) => f.startsWith(`game-${id}.`));

    console.log('🔍 Cherche:', `game-${id}.*`);
    console.log('📁 Fichiers trouvés:', files);

    if (files.length === 0) {
      return res.status(404).json({ error: "Logo not found" });
    }

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // ✅ Type-cast avec "as string" (garanti d'exister ici)
    const filePath = path.resolve(uploadDir, files[0] as string);
    res.sendFile(filePath);
  } catch (e) {
    console.error('❌ Erreur GET logo:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: errorMessage });
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


router.get("/filterByPublisherID", async (req, res) => {
  const publisherID = Number(req.query.publisherID);
  if (Number.isNaN(publisherID)) {
    return res.status(400).json({ error: "publisherID invalid" });
  }
  try {
    const q = `
      SELECT g.id,
             g.name,
             g.minimum_number_of_player,
             g.maximum_number_of_player,
             g.publisher_id,
             g.type_of_games_id,
             g.logo,
             p.name AS editor_name,
             t.description AS type
      FROM games_publisher g
       LEFT JOIN publisher p ON p.id = g.publisher_id
      LEFT JOIN type_of_games t ON t.id = g.type_of_games_id
      WHERE g.publisher_id = $1
      ORDER BY g.id;
    `;
    const params = [publisherID];  
    const result = await pool.query(q, params);
    
    // ✅ Utilise le même pattern que publisher
    const rows = result.rows.map(row => ({
      ...row,
      logoUrl: row.logo ? `/games/${row.id}/logo` : null
    }));
    
    res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de la recherche par publisher" });
  }
});



router.get("/getEditorNameByID", async (req, res) => {
  const editorID = Number(req.query.editorID);
  if (Number.isNaN(editorID)) {
    return res.status(400).json({ error: "editorID invalid" });
  }
  try {
    const q = `
      SELECT e.name
      FROM editors e
      WHERE e.id = $1;
    `;
    const params = [editorID];
    const result = await pool.query(q, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Editor not found" });
    }
    res.status(200).json({ name: result.rows[0].name });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de la recherche de l'editor" });
  }
});



router.get("/filter", async (req, res) => {
  const editorName = (req.query.editor_name || '').toString().trim();
  const typeDesc   = (req.query.type || '').toString().trim();
  const minPlayers = req.query.min ? Number(req.query.min) : null;
  const maxPlayers = req.query.max ? Number(req.query.max) : null;
  
   try {
    const conditions: string[] = [];
    const params: any[] = [];

     if (editorName !== '') {
      params.push(`%${editorName}%`);
      const idx = params.length;
      conditions.push(`e.name ILIKE $${idx}`);
    }

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