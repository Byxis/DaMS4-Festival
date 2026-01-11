import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db/database.js";
import type { Publisher } from "../types/publisher.js";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import multer from "multer";
import type { Contact } from "../types/contact.js";
import { requireAdmin } from "../middleware/auth-admin.js";

/**
 * Routes for managing publishers and their contacts, including logo uploads.
 * All routes that modify data require admin privileges (and are marked with and !).
 *
 * Endpoints:
 * - GET /api/publishers - Retrieve all publishers with their contacts
 * !- POST /api/publishers - Create a new publisher
 *
 * ! POST /api/publishers/addGameToPublisher -  Create a new game, and add it to the publisher's list of games
 * - GET /api/publishers/:id - Retrieve a specific publisher by ID
 * !- DELETE /api/publishers/:id - Delete a specific publisher by ID
 * !- PUT /api/publishers/:id - Update a specific publisher name by ID
 *
 * - POST /api/publishers/:id/contacts - Add a contact to a specific publisher
 * !- DELETE /api/publishers/:id/contacts/:contactId - Delete a specific contact from a specific publisher
 * !- PUT /api/publishers/:id/contacts/:contactId - Update a specific contact of a specific publisher
 *
 * - GET /api/publishers/:id/logo - Retrieve the logo of a specific publisher
 * !- POST /api/publishers/:id/logo - Upload a logo for a specific publisher
 * !- DELETE /api/publishers/:id/logo - Delete the logo of a specific publisher
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
        const logoFiles = fs
            .readdirSync("./uploads/logos")
            .filter((f: string) => f.startsWith(`${publisher.id}.`));

        if (logoFiles.length > 0) {
            publisher.logoUrl = `/publishers/${publisher.id}/logo`;
        }
    });
    res.json(publisherRows);
});

//! POST /api/publishers - Create a new publisher
router.post("/", requireAdmin, async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

     const client = await pool.connect();

    try {

 

        const publisherResult = await client.query<Publisher>(
      "INSERT INTO publisher (name) VALUES ($1) RETURNING *",
      [name]
    );
        const publisher = publisherResult.rows[0];
        return res.status(201).json(publisher);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not create publisher: " + err.message,
        });
    }
});

router.get("/check-exists/:name", async (req: Request, res: Response) => {
  const { name } = req.params;
  
  try {
    // ✅ Vérifie dans 'editors' (les éditeurs importables)
    const editorResult = await pool.query(
      "SELECT id, name, logo FROM editors WHERE LOWER(name) = LOWER($1) LIMIT 1",
      [name]
    );
    
    // ✅ Vérifie aussi dans 'publisher' (les publishers créés)
    const publisherResult = await pool.query(
      "SELECT id FROM publisher WHERE LOWER(name) = LOWER($1) LIMIT 1",
      [name]
    );

    res.json({
      existsInEditors: editorResult.rowCount && editorResult.rowCount > 0,
      editor: editorResult.rows[0] || null,  // Retourne les données de l'éditeur
      existsInPublisher: publisherResult.rowCount && publisherResult.rowCount > 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not check publisher" });
  }
});


//! POST /api/publishers/addGameToPublisher - Create a new game, and add it to the publisher's list of games
router.post("/addGameToPublisher", requireAdmin, async (req, res) => {
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




//! DELETE /api/publishers/:id - Delete a specific publisher by ID
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

//! PUT /api/publishers/:id - Update a specific publisher name by ID
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!id && !name) {
        return res.status(400).json({ error: "ID and Name are required" });
    }
    try {
        const { rows } = await pool.query<Publisher>(
            "UPDATE publisher SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Publisher not found" });
        }
        res.json(rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not update publisher: " + err.message,
        });
    }
});

/* ---------- /api/publishers/:id/contacts ----------*/

//! POST /api/publishers/:id/contacts - Add a contact to a specific publisher
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

//! DELETE /api/publishers/:id/contacts/:contactId - Delete a specific contact from a specific publisher
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

//! PUT /api/publishers/:id/contacts/:contactId - Update a specific contact of a specific publisher
router.put(
    "/:id/contacts/:contactId",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { contactId } = req.params;
        const { name, family_name, role, telephone, email } = req.body;
        if (!contactId) {
            return res.status(400).json({ error: "Contact ID is required" });
        }

        try {
            const { rows } = await pool.query<Contact>(
                "UPDATE contact SET name = $1, family_name = $2, role = $3, telephone = $4, email = $5 WHERE id = $6 RETURNING *",
                [name, family_name, role, telephone, email, contactId]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: "Contact not found" });
            }
            res.json(rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not update contact: " + err.message,
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

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.sendFile(path.resolve(`./uploads/logos/${files[0]}`));
});

//! POST /api/publishers/:id/logo - Upload a logo for a specific publisher
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

        existingFiles.forEach((f: string) =>
            fs.unlinkSync(`./uploads/logos/${f}`)
        );

        const ext = path.extname(req.file.originalname);
        const newPath = `./uploads/logos/${id}${ext}`;

        fs.renameSync(req.file.path, newPath);

        fs.accessSync(newPath);

        res.json({
            message: "Logo updated",
            url: `/publishers/${id}/logo`,
        });
    }
);

//! DELETE /api/publishers/:id/logo - Delete the logo of a specific publisher
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
