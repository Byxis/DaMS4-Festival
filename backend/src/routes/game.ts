import bcrypt from "bcryptjs";
import {Router} from "express";
import type {Request, Response} from "express";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import {DOMParser} from 'xmldom';

import pool from "../db/database.js";
import {requireAdmin} from "../middleware/auth-admin.js";
import {verifyToken} from "../middleware/token-management.js";

/**
 * Routes for managing games and their logos.
 * All routes that modify data require admin privileges (and are marked with !).
 *
 * Endpoints:
 * - GET /api/games/search - Search games by name for a specific publisher
 * - GET /api/games/:gameName - Check if a game name is available for a publisher
 *
 * - GET /api/games/numberOfGameExisting/:publisherId - Check if a publisher has games in the games table
 * - GET /api/games/numberOfPresentedGame/:publisherId - Count games presented by a publisher
 * - GET /api/games/gamesByEditorID/:publisherId - Retrieve all games from an editor (not yet added to publisher)
 * - GET /api/games/filterByPublisherID/:publisherID - Retrieve all games presented by a publisher
 *
 * - GET /api/games/:id/logo - Retrieve the logo of a specific game
 * !- POST /api/games/:id/logo - Upload a logo for a specific game
 */

const router = Router();
// GET /api/games/search - Retrieve game by his name
router.get("/search", async (req, res) => {
    const gameName = (req.query.gameName || '').toString().trim();
    const publisherId = req.query.publisherId ? Number(req.query.publisherId) : null;
    if (!publisherId || Number.isNaN(publisherId))
    {
        return res.status(400).json({error: "publisherId is required"});
    }
    try
    {
        const q = `
      SELECT g.id,
             g.name,
             g.minimum_number_of_player,
             g.maximum_number_of_player,
             g.type_of_games_id,
             g.logo,
             p.name AS editor_name,
             t.description AS type
      FROM games_publisher g
      LEFT JOIN publisher p ON p.id = g.publisher_id
      LEFT JOIN type_of_games t ON t.id = g.type_of_games_id
      WHERE g.publisher_id = $1
      AND g.name ILIKE $2
      ORDER BY g.id;
    `;
        const params = [publisherId, `%${gameName}%`];
        const result = await pool.query(q, params);
        res.status(200).json(result.rows);
    }
    catch (e)
    {
        console.error(e);
        res.status(500).json({error: "Erreur lors de la recherche par game's name"});
    }
});

// GET /api/games/:gameName - Check is the name is available before creation
router.get("/:gameName", async (req: Request, res: Response) => {
    const {gameName} = req.params;
    const {publisherId} = req.query;
    if (!gameName)
    {
        return res.status(400).json({error: "Name is required"});
    }
    try
    {
        const result = await pool.query(
            `SELECT id FROM games_publisher 
       WHERE LOWER(name) = LOWER($1) AND publisher_id = $2`,
            [gameName, publisherId || null]);

        res.status(200).json({exists: result.rowCount! > 0});
    }
    catch (e)
    {
        console.error(e);
        res.status(500).json({error: "Erreur lors de la vérification"});
    }
});

// GET /api/games/numberOfGameExisting/:publisherId - Check is the publisher has already somes games in the games table
router.get("/numberOfGameExisting/:publisherId", async (req: Request, res: Response) => {
    const {publisherId} = req.params;
    if (!publisherId || !/^\d+$/.test(publisherId))
    {
        return res.status(400).json({error: "Invalid publisher ID"});
    }
    try
    {
        const publisherResult = await pool.query(`SELECT id, name FROM publisher WHERE id = $1`, [publisherId]);
        if (!publisherResult.rowCount || publisherResult.rowCount === 0)
        {
            return res.status(200).json({hasGames: false});
        }
        const publisherName = publisherResult.rows[0].name;
        const editorResult = await pool.query(`SELECT id FROM editors WHERE LOWER(name) = LOWER($1)`, [publisherName]);
        if (!editorResult.rowCount || editorResult.rowCount === 0)
        {
            return res.status(200).json({hasGames: false});
        }
        const editorExists = editorResult.rowCount > 0;
        let gameCount = 0;
        if (editorExists)
        {
            const editorId = editorResult.rows[0].id;
            const gamesResult =
                await pool.query(`SELECT COUNT(*) as count FROM games WHERE editor_id = $1`, [editorId]);
            gameCount = parseInt(gamesResult.rows[0].count, 10);
        }
        res.status(200).json({hasGames: gameCount > 0});
    }
    catch (e)
    {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        res.status(500).json({error: errorMessage});
    }
});

// GET /api/games/numberOfPresentedGame/:publisherId - Count how many games are on the list of the publisher
router.get("/numberOfPresentedGame/:publisherId", async (req: Request, res: Response) => {
    const {publisherId} = req.params;

    if (!publisherId || !/^\d+$/.test(publisherId))
    {
        return res.status(400).json({error: "Invalid publisher ID"});
    }
    try
    {
        const numberOfGame =
            await pool.query(`SELECT COUNT(*) as count FROM games_publisher WHERE publisher_id = $1`, [publisherId]);
        const gameCount = parseInt(numberOfGame.rows[0].count, 10);
        res.status(200).json({
            gameCount: gameCount,
        });
    }
    catch (e)
    {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        res.status(500).json({error: errorMessage});
    }
});

// GET /api/gamesByEditorID/:publisherId - Retrieve all games from an editor (not yet added to publisher)
router.get("/gamesByEditorID/:publisherId", async (req: Request, res: Response) => {
    const {publisherId} = req.params;
    if (!publisherId || !/^\d+$/.test(publisherId))
    {
        return res.status(400).json({error: "Invalid publisher ID"});
    }
    try
    {
        const publisherResult = await pool.query(`SELECT name FROM publisher WHERE id = $1`, [publisherId]);
        if (!publisherResult.rowCount || publisherResult.rowCount === 0)
        {
            return res.status(404).json({error: "Publisher not found"});
        }
        const publisherName = publisherResult.rows[0].name;
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
      INNER JOIN editors e ON e.id = g.editor_id
      LEFT JOIN type_of_games t ON g.type_of_games_id = t.id
      WHERE LOWER(e.name) = LOWER($1)
     AND LOWER(g.name) NOT IN (
        SELECT LOWER(name) FROM games_publisher 
        WHERE publisher_id = $2
      )
      ORDER BY g.name;
      `,
            [publisherName, publisherId]);
        res.status(200).json(result.rows);
    }
    catch (e)
    {
        console.error(e);
        res.status(500).json({error: "Erreur lors de la récupération des jeux"});
    }
});

// GET /api/games/filterByPublisherID - Retrieve all games presented by a publisher
router.get("/filterByPublisherID/:publisherID", async (req, res) => {
    const {publisherID} = req.params;

    if (Number.isNaN(publisherID))
    {
        return res.status(400).json({error: "publisherID invalid"});
    }
    try
    {
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
      ORDER BY g.name;
    `;
        const params = [publisherID];
        const result = await pool.query(q, params);
        const rows = result.rows.map(row => ({...row, logoUrl: row.logo ? `/games/${row.id}/logo` : null}));
        res.status(200).json(rows);
    }
    catch (e)
    {
        console.error(e);
        res.status(500).json({error: "Erreur lors de la recherche par publisher"});
    }
});


/* ---------- PUT/DELETE /api/games/:id ----------*/

//! PUT /api/games/:id - Update a specific game
router.put("/:id", verifyToken, requireAdmin, async (req: Request, res: Response) => {
    const {id} = req.params;
    if (!id || !/^\d+$/.test(id))
    {
        return res.status(400).json({error: "Invalid ID"});
    }

    const {name, type, minimum_number_of_player, maximum_number_of_player, editor_name} = req.body;

    try
    {
        let typeOfGamesId = null;
        if (type)
        {
            const typeResult = await pool.query(`SELECT id FROM type_of_games WHERE description = $1`, [type]);
            if (typeResult.rowCount && typeResult.rowCount > 0)
            {
                typeOfGamesId = typeResult.rows[0].id;
            }
        }

        const result = await pool.query(
            `UPDATE games_publisher 
       SET name = COALESCE($1, name),
           type_of_games_id = COALESCE($2, type_of_games_id),
           minimum_number_of_player = COALESCE($3, minimum_number_of_player),
           maximum_number_of_player = COALESCE($4, maximum_number_of_player)
       WHERE id = $5
       RETURNING *`,
            [name, typeOfGamesId, minimum_number_of_player, maximum_number_of_player, id]);

        if (result.rowCount === 0)
        {
            return res.status(404).json({error: "Game not found"});
        }

        res.status(200).json(result.rows[0]);
    }
    catch (e)
    {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        res.status(500).json({error: errorMessage});
    }
});

//! DELETE /api/games/:id - Delete a specific game
router.delete("/:id", verifyToken, requireAdmin, async (req: Request, res: Response) => {
    const {id} = req.params;
    if (!id || !/^\d+$/.test(id))
    {
        return res.status(400).json({error: "Invalid ID"});
    }

    try
    {
        const uploadDir = path.resolve("./uploads/logos");
        if (fs.existsSync(uploadDir))
        {
            const files = fs.readdirSync(uploadDir).filter((f: string) => f.startsWith(`game-${id}.`));

            for (const file of files)
            {
                const filePath = path.join(uploadDir, file);
                fs.unlinkSync(filePath);
            }
        }

        const result = await pool.query(`DELETE FROM games_publisher WHERE id = $1 RETURNING id`, [id]);

        if (result.rowCount === 0)
        {
            return res.status(404).json({error: "Game not found"});
        }

        res.status(200).json({message: "Game deleted successfully", id: result.rows[0].id});
    }
    catch (e)
    {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        res.status(500).json({error: errorMessage});
    }
});


/* ---------- /api/games/:id/logo ----------*/

//! POST /api/games/:id/logo - Upload a logo for a specific game
router.post("/:id/logo", async (req: Request, res: Response) => {
    const {id} = req.params;
    if (!id || !/^\d+$/.test(id))
    {
        return res.status(400).json({error: "Invalid ID"});
    }
    try
    {
        if (!req.file)
        {
            return res.status(400).json({error: "No logo file provided"});
        }

        const uploadDir = "./uploads/logos";
        const ext = req.file.originalname.split('.').pop() || "jpg";
        const filename = `game-${id}.${ext}`;
        const fullPath = path.join(uploadDir, filename);
        if (!fs.existsSync(uploadDir))
        {
            fs.mkdirSync(uploadDir, {recursive: true});
        }
        fs.renameSync(req.file.path, fullPath);
        await pool.query(`UPDATE games_publisher SET logo = $1 WHERE id = $2`, [fullPath, id]);
        res.status(200).json({logoUrl: fullPath});
    }
    catch (e)
    {
        const errorMessage = e instanceof Error ? e.message : String(e);
        res.status(500).json({error: errorMessage});
    }
});
// GET /api/games/:id/logo - Retrieve the logo of a specific game
router.get("/:id/logo", async (req: Request, res: Response) => {
    const {id} = req.params;
    if (!id || !/^\d+$/.test(id))
    {
        return res.status(400).json({error: "Invalid ID"});
    }
    try
    {
        const uploadDir = path.resolve("./uploads/logos");
        if (!fs.existsSync(uploadDir))
        {
            return res.status(404).json({error: "Upload directory not found"});
        }
        const files = fs.readdirSync(uploadDir).filter((f: string) => f.startsWith(`game-${id}.`));

        if (files.length === 0)
        {
            return res.status(404).json({error: "Logo not found"});
        }
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        const filePath = path.resolve(uploadDir, files[0] as string);
        res.sendFile(filePath);
    }
    catch (e)
    {
        const errorMessage = e instanceof Error ? e.message : String(e);
        res.status(500).json({error: errorMessage});
    }
});



export default router;