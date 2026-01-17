import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db/database.js";
import { requireAdmin } from "../middleware/auth-admin.js";
import type { Festival } from "../types/festival.js";
import type { Tarif_Zone } from "../types/tarif_zone.js";
import type { Game_Zone } from "../types/game_zone.js";
import path from "path";
import fs from "fs";
import multer from "multer";

/**
 * Routes for managing festivals, tarif zones, and game zones, including logo uploads.
 * All routes that modify data require admin privileges (marked with !).
 *
 * Endpoints:
 * - GET /api/festivals - Retrieve all festivals without their tariff and game zone
 * !- POST /api/festivals - Create a new festival
 *
 * - GET /api/festivals/:id - Retrieve a specific festival by ID
 * !- DELETE /api/festivals/:id - Delete a specific festival by ID
 * !- PUT /api/festivals/:id - Update a specific festival by ID
 *
 * !- POST /api/festivals/:id/tarif-zones - Add a tarif zone to a festival
 * !- DELETE /api/festivals/:id/tarif-zones/:tarifZoneId - Delete a tarif zone
 * !- PUT /api/festivals/:id/tarif-zones/:tarifZoneId - Update a tarif zone
 *
 * !- POST /api/festivals/:id/tarif-zones/:tarifZoneId/game-zones - Add a game zone to a tarif zone
 * !- DELETE /api/festivals/:id/tarif-zones/:tarifZoneId/game-zones/:gameZoneId - Delete a game zone
 * !- PUT /api/festivals/:id/tarif-zones/:tarifZoneId/game-zones/:gameZoneId - Update a game zone
 *
 * - GET /api/festivals/:id/logo - Retrieve the logo of a specific festival
 * !- POST /api/festivals/:id/logo - Upload a logo for a specific festival
 * !- DELETE /api/festivals/:id/logo - Delete the logo of a specific festival
 */

const router = Router();

const FESTIVAL_LOGO_DIR = "./uploads/festival-logos";

// Ensure logo directory exists
if (!fs.existsSync(FESTIVAL_LOGO_DIR)) {
    fs.mkdirSync(FESTIVAL_LOGO_DIR, { recursive: true });
}

const upload = multer({
    storage: multer.diskStorage({
        destination: FESTIVAL_LOGO_DIR,
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

        if (ext && mime) {
            return cb(null, true);
        } else {
            return cb(
                new Error(
                    "Invalid file type. Only JPEG, JPG, PNG, GIF, or WEBP images are allowed."
                )
            );
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

/* ---------- /api/festivals ----------*/

// GET /api/festivals - Retrieve all festivals 
router.get("/", async (_req: Request, res: Response) => {
    try {
        const { rows: festivalRows } = await pool.query<Festival>(
            "SELECT id, name, location, start_date, end_date, table_count, big_table_count, town_table_count FROM festivals"
        );

        // Add logo URL if logo exists
        festivalRows.forEach((festival) => {
            const logoFiles = fs
                .readdirSync(FESTIVAL_LOGO_DIR)
                .filter((f: string) => f.startsWith(`${festival.id}.`));

            if (logoFiles.length > 0) {
                festival.logoUrl = `/festivals/${festival.id}/logo`;
            }
        });

        res.json(festivalRows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not retrieve festivals: " + err.message,
        });
    }
});

//! POST /api/festivals - Create a new festival
router.post("/", requireAdmin, async (req: Request, res: Response) => {
    const {
        name,
        location,
        start_date,
        end_date,
        table_count,
        big_table_count,
        town_table_count,
    } = req.body;

    if (!name || !location || !start_date || !end_date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const { rows } = await pool.query<Festival>(
            "INSERT INTO festivals (name, location, start_date, end_date, table_count, big_table_count, town_table_count) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [
                name,
                location,
                start_date,
                end_date,
                table_count || 0,
                big_table_count || 0,
                town_table_count || 0,
            ]
        );
        res.status(201).json(rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not create festival: " + err.message,
        });
    }
});

/* ---------- /api/festivals/:id ----------*/

// GET /api/festivals/:id - Retrieve a specific festival by ID
router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query<Festival>(
            "SELECT * FROM festivals WHERE id = $1",
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Festival not found" });
        }

        const festival = rows[0];

        if (!festival) {
            return res.status(404).json({ error: "Festival not found" });
        }

        // Get tarif zones
        const { rows: tarifZoneRows } = await pool.query<Tarif_Zone>(
            "SELECT * FROM tarif_zone WHERE festival_id = $1",
            [id]
        );
        festival.tarif_zones = tarifZoneRows;

        // Get game zones for each tarif zone
        for (const tarifZone of festival.tarif_zones) {
            const { rows: gameZoneRows } = await pool.query<Game_Zone>(
                "SELECT * FROM game_zone WHERE tarif_zone_id = $1",
                [tarifZone.id]
            );
            tarifZone.game_zones = gameZoneRows;
        }

        // Check for logo
        const logoFiles = fs
            .readdirSync(FESTIVAL_LOGO_DIR)
            .filter((f: string) => f.startsWith(`${id}.`));

        if (logoFiles.length > 0) {
            festival.logoUrl = `/festivals/${id}/logo`;
        }

        res.json(festival);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not retrieve festival: " + err.message,
        });
    }
});

//! DELETE /api/festivals/:id - Delete a specific festival by ID
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query(
            "DELETE FROM festivals WHERE id = $1",
            [id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: "Festival not found" });
        }

        // Delete logo if exists
        const files = fs
            .readdirSync(FESTIVAL_LOGO_DIR)
            .filter((f: string) => f.startsWith(`${id}.`));
        files.forEach((f: string) =>
            fs.unlinkSync(`${FESTIVAL_LOGO_DIR}/${f}`)
        );

        res.status(204).send();
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not delete festival: " + err.message,
        });
    }
});

//! PUT /api/festivals/:id - Update a specific festival by ID
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        name,
        location,
        start_date,
        end_date,
        table_count,
        big_table_count,
        town_table_count,
    } = req.body;

    if (!name && !location && !start_date && !end_date) {
        return res
            .status(400)
            .json({ error: "At least one field is required" });
    }

    try {
        const { rows } = await pool.query<Festival>(
            "UPDATE festivals SET name = COALESCE($1, name), location = COALESCE($2, location), start_date = COALESCE($3, start_date), end_date = COALESCE($4, end_date), table_count = COALESCE($5, table_count), big_table_count = COALESCE($6, big_table_count), town_table_count = COALESCE($7, town_table_count) WHERE id = $8 RETURNING *",
            [
                name,
                location,
                start_date,
                end_date,
                table_count,
                big_table_count,
                town_table_count,
                id,
            ]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Festival not found" });
        }
        res.json(rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not update festival: " + err.message,
        });
    }
});

/* ---------- /api/festivals/:id/tarif-zones ----------*/

//! POST /api/festivals/:id/tarif-zones - Add a tarif zone to a festival
router.post(
    "/:id/tarif-zones",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, price, numberOutlets, maxTable } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        try {
            // Check if festival exists
            const { rows: festivalRows } = await pool.query(
                "SELECT id FROM festivals WHERE id = $1",
                [id]
            );
            if (festivalRows.length === 0) {
                return res.status(404).json({ error: "Festival not found" });
            }

            const { rows } = await pool.query<Tarif_Zone>(
                "INSERT INTO tarif_zone (festival_id, name, price, numberOutlets, maxTable) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [id, name, price || 0, numberOutlets || 0, maxTable || 0]
            );
            res.status(201).json(rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not create tarif zone: " + err.message,
            });
        }
    }
);

//! DELETE /api/festivals/:id/tarif-zones/:tarifZoneId - Delete a tarif zone
router.delete(
    "/:id/tarif-zones/:tarifZoneId",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { tarifZoneId } = req.params;
        try {
            const { rowCount } = await pool.query(
                "DELETE FROM tarif_zone WHERE id = $1",
                [tarifZoneId]
            );
            if (rowCount === 0) {
                return res.status(404).json({ error: "Tarif zone not found" });
            }
            res.status(204).send();
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not delete tarif zone: " + err.message,
            });
        }
    }
);

//! PUT /api/festivals/:id/tarif-zones/:tarifZoneId - Update a tarif zone
router.put(
    "/:id/tarif-zones/:tarifZoneId",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { tarifZoneId } = req.params;
        const { name, price, numberOutlets, maxTable } = req.body;

        if (!name && price === undefined && numberOutlets === undefined && maxTable === undefined) {
            return res
                .status(400)
                .json({ error: "At least one field is required" });
        }

        try {
            const { rows } = await pool.query<Tarif_Zone>(
                "UPDATE tarif_zone SET name = COALESCE($1, name), price = COALESCE($2, price), numberOutlets = COALESCE($3, numberOutlets), maxTable = COALESCE($4, maxTable) WHERE id = $5 RETURNING *",
                [name, price, numberOutlets, maxTable, tarifZoneId]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: "Tarif zone not found" });
            }
            res.json(rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not update tarif zone: " + err.message,
            });
        }
    }
);

/* ---------- /api/festivals/:id/tarif-zones/:tarifZoneId/game-zones ----------*/

//! POST /api/festivals/:id/tarif-zones/:tarifZoneId/game-zones - Add a game zone to a tarif zone
router.post(
    "/:id/tarif-zones/:tarifZoneId/game-zones",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { tarifZoneId } = req.params;
        const { name, reserved_table, reserved_big_table, reserved_town_table } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        try {
            // Check if tarif zone exists
            const { rows: tarifZoneRows } = await pool.query(
                "SELECT id FROM tarif_zone WHERE id = $1",
                [tarifZoneId]
            );
            if (tarifZoneRows.length === 0) {
                return res.status(404).json({ error: "Tarif zone not found" });
            }

            const { rows } = await pool.query<Game_Zone>(
                "INSERT INTO game_zone (tarif_zone_id, name, reserved_table, reserved_big_table, reserved_town_table) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [
                    tarifZoneId,
                    name,
                    reserved_table || 0,
                    reserved_big_table || 0,
                    reserved_town_table || 0,
                ]
            );
            res.status(201).json(rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not create game zone: " + err.message,
            });
        }
    }
);

//! DELETE /api/festivals/:id/tarif-zones/:tarifZoneId/game-zones/:gameZoneId - Delete a game zone
router.delete(
    "/:id/tarif-zones/:tarifZoneId/game-zones/:gameZoneId",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { gameZoneId } = req.params;
        try {
            const { rowCount } = await pool.query(
                "DELETE FROM game_zone WHERE id = $1",
                [gameZoneId]
            );
            if (rowCount === 0) {
                return res.status(404).json({ error: "Game zone not found" });
            }
            res.status(204).send();
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not delete game zone: " + err.message,
            });
        }
    }
);

//! PUT /api/festivals/:id/tarif-zones/:tarifZoneId/game-zones/:gameZoneId - Update a game zone
router.put(
    "/:id/tarif-zones/:tarifZoneId/game-zones/:gameZoneId",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { gameZoneId } = req.params;
        const { name, reserved_table, reserved_big_table, reserved_town_table } = req.body;

        if (!name && reserved_table === undefined && reserved_big_table === undefined && reserved_town_table === undefined) {
            return res
                .status(400)
                .json({ error: "At least one field is required" });
        }

        try {
            const { rows } = await pool.query<Game_Zone>(
                "UPDATE game_zone SET name = COALESCE($1, name), reserved_table = COALESCE($2, reserved_table), reserved_big_table = COALESCE($3, reserved_big_table), reserved_town_table = COALESCE($4, reserved_town_table) WHERE id = $5 RETURNING *",
                [name, reserved_table, reserved_big_table, reserved_town_table, gameZoneId]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: "Game zone not found" });
            }
            res.json(rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not update game zone: " + err.message,
            });
        }
    }
);

/* ---------- /api/festivals/:id/logo ----------*/

// GET /api/festivals/:id/logo - Retrieve the logo of a specific festival
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

//! POST /api/festivals/:id/logo - Upload a logo for a specific festival
router.post(
    "/:id/logo",
    requireAdmin,
    upload.single("logo"),
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { rows } = await pool.query(
            "SELECT id FROM festivals WHERE id = $1",
            [id]
        );
        if (rows.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Festival not found" });
        }

        const existingFiles = fs
            .readdirSync(FESTIVAL_LOGO_DIR)
            .filter((f: string) => f.startsWith(`${id}.`));

        existingFiles.forEach((f: string) =>
            fs.unlinkSync(`${FESTIVAL_LOGO_DIR}/${f}`)
        );

        const ext = path.extname(req.file.originalname);
        const newPath = `${FESTIVAL_LOGO_DIR}/${id}${ext}`;

        fs.renameSync(req.file.path, newPath);

        res.json({
            message: "Logo updated",
            url: `/festivals/${id}/logo`,
        });
    }
);

//! DELETE /api/festivals/:id/logo - Delete the logo of a specific festival
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

        files.forEach((f: string) =>
            fs.unlinkSync(`${FESTIVAL_LOGO_DIR}/${f}`)
        );
        res.json({ message: "Logo deleted" });
    }
);

export default router;