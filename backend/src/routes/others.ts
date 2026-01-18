
import {Router} from "express";
import type {Request, Response} from "express";

import pool from "../db/database.js";
import {requireAdmin} from "../middleware/auth-admin.js";
import type {Contact} from "../types/contact.js";
import type {Other} from "../types/other.js";

/**
 * Routes for managing 'Other' entities (Guests).
 *
 * Endpoints:
 * - GET /api/others - Retrieve all other entities with their contacts
 * !- POST /api/others - Create a new other entity
 *
 * - GET /api/others/:id - Retrieve a specific other entity by ID
 * !- DELETE /api/others/:id - Delete a specific other entity by ID
 * !- PUT /api/others/:id - Update a specific other entity name by ID
 *
 * - GET /api/others/:id/contacts - (Optional explicit get, usually included in GET /api/others)
 * !- POST /api/others/:id/contacts - Add a contact to a specific entity
 * !- DELETE /api/others/:id/contacts/:contactId - Delete a specific contact
 * !- PUT /api/others/:id/contacts/:contactId - Update a specific contact
 *
 * - GET /api/others/search - Search for other entities by name
 */

const router = Router();

/* ---------- /api/others ----------*/

// GET /api/others - Retrieve all other entities with their contacts
router.get("/", async (_req: Request, res: Response) => {
    try
    {
        const {rows: otherRows} = await pool.query<Other>("SELECT * FROM other ORDER BY name");
        const {rows: contactRows} = await pool.query<Contact>("SELECT * FROM contact");

        otherRows.forEach((other) => {
            other.contacts = contactRows.filter((contact) => contact.entity_id === other.id);
        });
        res.json(otherRows);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({error: "Could not fetch other entities"});
    }
});

//! POST /api/others - Create a new other entity
router.post("/", requireAdmin, async (req: Request, res: Response) => {
    const {name} = req.body;
    if (!name)
    {
        return res.status(400).json({error: "Name is required"});
    }

    try
    {
        // Insert into 'other' view which triggers insert into 'entities' with type='GUEST'
        const result = await pool.query<Other>("INSERT INTO other (name) VALUES ($1) RETURNING *", [name]);
        const other = result.rows[0];
        return res.status(201).json(other);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not create other entity: " + err.message,
        });
    }
});

/* ---------- /api/others/:id ----------*/

// GET /api/others/:id - Retrieve a specific entity
router.get("/:id", async (req: Request, res: Response) => {
    const {id} = req.params;
    try
    {
        const {rows} = await pool.query<Other>("SELECT * FROM other WHERE id = $1", [id]);
        const other = rows[0];
        if (!other)
        {
            return res.status(404).json({error: "Entity not found"});
        }

        const {rows: contactRows} = await pool.query<Contact>("SELECT * FROM contact WHERE entity_id = $1", [other.id]);
        other.contacts = contactRows;

        res.json(other);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({error: "Could not fetch entity"});
    }
});

//! DELETE /api/others/:id - Delete a specific entity
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
    const {id} = req.params;
    try
    {
        const {rowCount} = await pool.query("DELETE FROM other WHERE id = $1", [id]);
        if (rowCount === 0)
        {
            return res.status(404).json({error: "Entity not found"});
        }
        res.status(204).send();
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not delete entity: " + err.message,
        });
    }
});

//! PUT /api/others/:id - Update name
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
    const {id} = req.params;
    const {name} = req.body;

    if (!name)
    {
        return res.status(400).json({error: "Name is required"});
    }
    try
    {
        const {rows} = await pool.query<Other>("UPDATE other SET name = $1 WHERE id = $2 RETURNING *", [name, id]);
        if (rows.length === 0)
        {
            return res.status(404).json({error: "Entity not found"});
        }
        res.json(rows[0]);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not update entity: " + err.message,
        });
    }
});

/* ---------- /api/others/:id/contacts ----------*/

//! POST /api/others/:id/contacts - Add a contact
router.post("/:id/contacts", requireAdmin, async (req: Request, res: Response) => {
    const {id} = req.params;
    const {name, family_name, role, telephone, email} = req.body;

    if (!name || !family_name)
    {
        return res.status(400).json({error: "Name and Family name are required"});
    }
    if (!(telephone || email))
    {
        return res.status(400).json({error: "Phone or email is required"});
    }

    try
    {
        const {rows} = await pool.query<Contact>(
            "INSERT INTO contact (entity_id, name, family_name, role, telephone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [id, name, family_name, role, telephone, email]);
        res.status(201).json(rows[0]);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not create contact: " + err.message,
        });
    }
});

//! DELETE /api/others/:id/contacts/:contactId - Delete a contact
router.delete("/:id/contacts/:contactId", requireAdmin, async (req: Request, res: Response) => {
    const {contactId} = req.params;
    try
    {
        const {rowCount} = await pool.query("DELETE FROM contact WHERE id = $1", [contactId]);
        if (rowCount === 0)
        {
            return res.status(404).json({error: "Contact not found"});
        }
        res.status(204).send();
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not delete contact: " + err.message,
        });
    }
});

//! PUT /api/others/:id/contacts/:contactId - Update a contact
router.put("/:id/contacts/:contactId", requireAdmin, async (req: Request, res: Response) => {
    const {contactId} = req.params;
    const {name, family_name, role, telephone, email} = req.body;

    try
    {
        const {rows} = await pool.query<Contact>(
            "UPDATE contact SET name = $1, family_name = $2, role = $3, telephone = $4, email = $5 WHERE id = $6 RETURNING *",
            [name, family_name, role, telephone, email, contactId]);
        if (rows.length === 0)
        {
            return res.status(404).json({error: "Contact not found"});
        }
        res.json(rows[0]);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not update contact: " + err.message,
        });
    }
});

export default router;
