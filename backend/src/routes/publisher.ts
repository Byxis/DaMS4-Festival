import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db/database.js";
import type { Publisher } from "../types/publisher.js";
import path from "path";
import fs from "fs";
import multer from "multer";
import type { Contact } from "../types/contact.js";
import { requireAdmin } from "../middleware/auth-admin.js";

/**
 * Routes for managing publishers and their contacts, including logo uploads.
 * All routes that modify data require admin privileges.
 *
 * Endpoints:
 * - GET /api/publishers - Retrieve all publishers with their contacts
 * - POST /api/publishers - Create a new publisher
 *
 * - GET /api/publishers/:id - Retrieve a specific publisher by ID
 * - DELETE /api/publishers/:id - Delete a specific publisher by ID
 *
 * - POST /api/publishers/:id/contacts - Add a contact to a specific publisher
 * - DELETE /api/publishers/:id/contacts/:contactId - Delete a specific contact from a specific publisher
 *
 * - GET /api/publishers/:id/logo - Retrieve the logo of a specific publisher
 * - POST /api/publishers/:id/logo - Upload a logo for a specific publisher
 * - DELETE /api/publishers/:id/logo - Delete the logo of a specific publisher
 */

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

/* ---------- /api/publishers ----------*/

// GET /api/publishers - Retrieve all publishers with their contacts
router.get("/", async (_req: Request, res: Response) => {
    const { rows: publisherRows } = await pool.query<Publisher>(
        "SELECT * FROM publisher"
    );
    const { rows: contactRows } = await pool.query<Contact>(
        "SELECT * FROM contact"
    );
    publisherRows.forEach((publisher) => {
        publisher.contacts = contactRows.filter(
            (contact) => contact.publisher_id === publisher.id
        );
    });
    res.json(publisherRows);
});

// POST /api/publishers - Create a new publisher
router.post("/", requireAdmin, async (req: Request, res: Response) => {
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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not create publisher: " + err.message,
        });
    }
});

/* ---------- /api/publishers/:id ----------*/

// GET /api/publishers/:id - Retrieve a specific publisher by ID
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

// DELETE /api/publishers/:id - Delete a specific publisher by ID
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query(
            "DELETE FROM publisher WHERE id = $1",
            [id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: "Publisher not found" });
        }
        res.status(204).send();
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not delete publisher: " + err.message,
        });
    }
});

/* ---------- /api/publishers/:id/contacts ----------*/

// POST /api/publishers/:id/contacts - Add a contact to a specific publisher
router.post(
    "/:id/contacts",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, family_name, role, telephone, email } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        if (!family_name) {
            return res.status(400).json({ error: "Family name is required" });
        }

        if (!(telephone || email)) {
            return res
                .status(400)
                .json({ error: "Phone or email is required" });
        }
        try {
            const { rows } = await pool.query<Contact>(
                "INSERT INTO contact (publisher_id, name, family_name, role, telephone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [id, name, family_name, role, telephone, email]
            );
            res.status(201).json(rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not create contact: " + err.message,
            });
        }
    }
);

// DELETE /api/publishers/:id/contacts/:contactId - Delete a specific contact from a specific publisher
router.delete(
    "/:id/contacts/:contactId",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { contactId } = req.params;
        try {
            const { rowCount } = await pool.query(
                "DELETE FROM contact WHERE id = $1",
                [contactId]
            );
            if (rowCount === 0) {
                return res.status(404).json({ error: "Contact not found" });
            }
            res.status(204).send();
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not delete contact: " + err.message,
            });
        }
    }
);

/* ---------- /api/publishers/:id/logo ----------*/

// GET /api/publishers/:id/logo - Retrieve the logo of a specific publisher
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

// POST /api/publishers/:id/logo - Upload a logo for a specific publisher
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

// DELETE /api/publishers/:id/logo - Delete the logo of a specific publisher
router.delete(
    "/:id/logo",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const files = fs
            .readdirSync("./uploads/logos")
            .filter((f: string) => f.startsWith(`${id}.`));

        if (files.length === 0) {
            return res.status(404).json({ error: "Logo not found" });
        }

        files.forEach((f: string) => fs.unlinkSync(`./uploads/logos/${f}`));
        res.json({ message: "Logo deleted" });
    }
);

export default router;
