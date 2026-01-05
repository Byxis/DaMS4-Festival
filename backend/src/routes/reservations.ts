import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db/database.js";
import { requireAdmin } from "../middleware/auth-admin.js";
import type {
    Reservation,
    ReservationInteraction,
    ReservationGame,
} from "../types/reservation.js";

/**
 * Routes for managing reservations.
 * All routes that modify data require admin privileges (and are marked with !).
 *
 * Endpoints:
 * - GET /api/festivals/:id/reservations - Get all reservations for a festival
 * ! - POST /api/festivals/:id/reservations - Create a new reservation

 * - GET /api/festivals/:id/reservations/:reservationId - Get a specific reservation with interactions and games
 * ! - PUT /api/festivals/:id/reservations/:reservationId - Update a reservation
 * ! - DELETE /api/festivals/:id/reservations/:reservationId - Delete a reservation
 */

const router = Router();

/* ---------- /api/festivals/:id/reservations ----------*/

// GET /api/festivals/:id/reservations - Get all reservations for a festival
router.get("/:id/reservations", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query<Reservation>(
            `SELECT 
                r.id,
                r.festival_id,
                r.entity_id,
                r.table_count,
                r.big_table_count,
                r.town_table_count,
                r.note,
                r.status,
                COALESCE(json_agg(DISTINCT jsonb_build_object('id', ri.id, 'reservation_id', ri.reservation_id, 'description', ri.description, 'interaction_date', ri.interaction_date)) FILTER (WHERE ri.id IS NOT NULL), '[]'::json) as interactions,
                COALESCE(json_agg(DISTINCT jsonb_build_object('id', rg.id, 'reservation_id', rg.reservation_id, 'game_id', rg.game_id, 'amount', rg.amount, 'table_count', rg.table_count, 'big_table_count', rg.big_table_count, 'town_table_count', rg.town_table_count, 'status', rg.status)) FILTER (WHERE rg.id IS NOT NULL), '[]'::json) as games
            FROM reservations r
            LEFT JOIN reservation_interactions ri ON r.id = ri.reservation_id
            LEFT JOIN reservation_games rg ON r.id = rg.reservation_id
            WHERE r.festival_id = $1
            GROUP BY r.id
            ORDER BY r.id DESC`,
            [id]
        );

        res.json(rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: "Could not fetch reservations: " + err.message,
        });
    }
});

// ! POST /api/festivals/:id/reservations - Create a new reservation
router.post(
    "/:id/reservations",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            entity_id,
            table_count = 0,
            big_table_count = 0,
            town_table_count = 0,
            note,
            status = "TO_BE_CONTACTED",
        } = req.body;

        if (!entity_id) {
            return res.status(400).json({ error: "entity_id is required" });
        }

        try {
            const { rows } = await pool.query<Reservation>(
                `INSERT INTO reservations (festival_id, entity_id, table_count, big_table_count, town_table_count, note, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
                [
                    id,
                    entity_id,
                    table_count,
                    big_table_count,
                    town_table_count,
                    note,
                    status,
                ]
            );

            res.status(201).json(rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not create reservation: " + err.message,
            });
        }
    }
);

/* ---------- /api/festivals/:id/reservations/:reservationId ----------*/

// GET /api/festivals/:id/reservations/:reservationId - Get a specific reservation with interactions and games
router.get(
    "/:id/reservations/:reservationId",
    async (req: Request, res: Response) => {
        try {
            const { id, reservationId } = req.params;

            const { rows: reservationRows } = await pool.query<Reservation>(
                `SELECT 
                r.id,
                r.festival_id,
                r.entity_id,
                r.table_count,
                r.big_table_count,
                r.town_table_count,
                r.note,
                r.status,
                COALESCE(json_agg(DISTINCT jsonb_build_object('id', ri.id, 'reservation_id', ri.reservation_id, 'description', ri.description, 'interaction_date', ri.interaction_date)) FILTER (WHERE ri.id IS NOT NULL), '[]'::json) as interactions,
                COALESCE(json_agg(DISTINCT jsonb_build_object('id', rg.id, 'reservation_id', rg.reservation_id, 'game_id', rg.game_id, 'amount', rg.amount, 'table_count', rg.table_count, 'big_table_count', rg.big_table_count, 'town_table_count', rg.town_table_count, 'status', rg.status)) FILTER (WHERE rg.id IS NOT NULL), '[]'::json) as games
            FROM reservations r
            LEFT JOIN reservation_interactions ri ON r.id = ri.reservation_id
            LEFT JOIN reservation_games rg ON r.id = rg.reservation_id
            WHERE r.festival_id = $1 AND r.id = $2
            GROUP BY r.id`,
                [id, reservationId]
            );

            if (reservationRows.length === 0) {
                return res.status(404).json({ error: "Reservation not found" });
            }

            res.json(reservationRows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not fetch reservation: " + err.message,
            });
        }
    }
);

// ! PUT /api/festivals/:id/reservations/:reservationId - Update a reservation
router.put(
    "/:id/reservations/:reservationId",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { id, reservationId } = req.params;
        const { table_count, big_table_count, town_table_count, note, status } =
            req.body;

        if (id === undefined || reservationId === undefined) {
            return res
                .status(400)
                .json({ error: "Missing reservation identifiers" });
        }

        const updates: { [key: string]: string | number | null | Date } = {};

        if (table_count !== undefined) updates.table_count = table_count;
        if (big_table_count !== undefined)
            updates.big_table_count = big_table_count;
        if (town_table_count !== undefined)
            updates.town_table_count = town_table_count;
        if (note !== undefined) updates.note = note;
        if (status !== undefined) updates.status = status;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");

        values.push(id, reservationId);

        try {
            const { rows } = await pool.query<Reservation>(
                `UPDATE reservations
                SET ${setClause}
                WHERE festival_id = $${values.length - 1} AND id = $${
                    values.length
                }
                RETURNING *`,
                values
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: "Reservation not found" });
            }

            res.json(rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not update reservation: " + err.message,
            });
        }
    }
);

// ! DELETE /api/festivals/:id/reservations/:reservationId - Delete a reservation
router.delete(
    "/:id/reservations/:reservationId",
    requireAdmin,
    async (req: Request, res: Response) => {
        const { id, reservationId } = req.params;

        try {
            const { rowCount } = await pool.query(
                `DELETE FROM reservations
            WHERE festival_id = $1 AND id = $2`,
                [id, reservationId]
            );

            if (rowCount === 0) {
                return res.status(404).json({ error: "Reservation not found" });
            }

            res.status(204).send();
        } catch (err: any) {
            console.error(err);
            res.status(500).json({
                error: "Could not delete reservation: " + err.message,
            });
        }
    }
);

export default router;
