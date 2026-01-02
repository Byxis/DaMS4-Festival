import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db/database.js";
import { requireAdmin } from "../middleware/auth-admin.js";
import type { Festival } from "../types/festival.js";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import multer from "multer";
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


const FESTIVAL_LOGO_DIR = "/uploads/festival-logos";

const upload = multer({
    storage: multer.diskStorage({
        destination: "FESTIVAL_LOGO_DIR",
        filename: (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, filename: string) => void
        ) => {
            cb(null, `temp-${Date.now()}${path.extname(file.originalname)}`);
        },
    }),
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const ext = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mime = allowedTypes.test(file.mimetype);
        cb(null, ext && mime);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});




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
router.delete("/:id", requireAdmin, async (req, res) => {
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




/* ---------- /api/festivals/:id/logo ----------*/

// GET /api/festivals/:id/logo - Retrieve a festival's logo
router.get("/:id/logo", async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || !/^\d+$/.test(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    const files = fs
        .readdirSync(FESTIVAL_LOGO_DIR)
        .filter((f: string) => f.startsWith(`${id}.`));

    if (files.length === 0) {
        return res.status(404).json({ error: "Logo not found" });
    }

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.sendFile(path.resolve(`${FESTIVAL_LOGO_DIR}/${files[0]}`));
});

// POST /api/festivals/:id/logo - Upload a logo for a festival
router.post(
    "/:id/logo",
    requireAdmin,
    upload.single("logo"),
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Check if the festival exists
        const { rows } = await pool.query(
            "SELECT id FROM festivals WHERE id = $1",
            [id]
        );
        if (rows.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Festival not found" });
        }

        // Delete old logos
        const existingFiles = fs
            .readdirSync(FESTIVAL_LOGO_DIR)
            .filter((f: string) => f.startsWith(`${id}.`));
        existingFiles.forEach((f: string) =>
            fs.unlinkSync(`${FESTIVAL_LOGO_DIR}/${f}`)
        );

        // Rename the new logo
        const ext = path.extname(req.file.originalname);
        const newPath = `${FESTIVAL_LOGO_DIR}/${id}${ext}`;
        fs.renameSync(req.file.path, newPath);

        res.json({
            message: "Logo updated",
            url: `/festivals/${id}/logo`,
        });
    }
);

// DELETE /api/festivals/:id/logo - Delete a festival's logo
router.delete(
    "/:id/logo",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const files = fs
            .readdirSync(FESTIVAL_LOGO_DIR)
            .filter((f: string) => f.startsWith(`${id}.`));

        if (files.length === 0) {
            return res.status(404).json({ error: "Logo not found" });
        }

        files.forEach((f: string) => fs.unlinkSync(`${FESTIVAL_LOGO_DIR}/${f}`));
        res.json({ message: "Logo deleted" });
    }
);

export default router;