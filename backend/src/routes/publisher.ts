import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db/database.js";
import type { Publisher } from "../types/publisher.js";
import path from "path";
import fs from "fs";
import multer from "multer";

const router = Router();
const upload = multer({
    storage: multer.diskStorage({
        destination: "./uploads/logos",
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

// GET /api/publishers
router.get("/", async (_req: Request, res: Response) => {
    const { rows } = await pool.query<Publisher>("SELECT * FROM publisher");
    res.json(rows);
});

// POST /api/publishers
router.post("/", async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    try {
        const { rows } = await pool.query<Publisher>(
            "INSERT INTO publisher (name) VALUES ($1) RETURNING *",
            [name]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/publishers/:id
router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rows } = await pool.query<Publisher>(
        "SELECT * FROM publisher WHERE id = $1",
        [id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Publisher not found" });
    }
    res.json(rows[0]);
});

// GET /api/publishers/:id/contacts
router.get("/:id/contacts", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rows } = await pool.query(
        "SELECT * FROM contact WHERE publisher_id = $1",
        [id]
    );
    res.json(rows);
});

// GET /api/publishers/:id/logo
router.get("/:id/logo", async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || !/^\d+$/.test(id)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Invalid ID" });
    }

    const logoPath = `./uploads/logos/${id}`;

    const files = fs
        .readdirSync("./uploads/logos")
        .filter((f: string) => f.startsWith(`${id}.`));

    if (files.length === 0) {
        return res.status(404).json({ error: "Logo not found" });
    }

    res.sendFile(path.resolve(`./uploads/logos/${files[0]}`));
});

// POST /api/publishers/:id/logo
router.post(
    "/:id/logo",
    upload.single("logo"),
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { rows } = await pool.query(
            "SELECT id FROM publisher WHERE id = $1",
            [id]
        );
        if (rows.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Publisher not found" });
        }

        const existingFiles = fs
            .readdirSync("./uploads/logos")
            .filter((f: string) => f.startsWith(`${id}.`));

        const ext = path.extname(req.file.originalname);
        const newPath = `./uploads/logos/${id}${ext}`;
        fs.renameSync(req.file.path, newPath);

        res.json({ message: "Logo updated", url: `/publishers/${id}/logo` });
    }
);

// DELETE /api/publishers/:id/logo
router.delete("/:id/logo", async (req: Request, res: Response) => {
    const { id } = req.params;

    const files = fs
        .readdirSync("./uploads/logos")
        .filter((f: string) => f.startsWith(`${id}.`));

    if (files.length === 0) {
        return res.status(404).json({ error: "Logo not found" });
    }

    files.forEach((f: string) => fs.unlinkSync(`./uploads/logos/${f}`));
    res.json({ message: "Logo deleted" });
});

export default router;
