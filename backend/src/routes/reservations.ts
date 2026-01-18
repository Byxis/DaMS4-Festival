import {Router} from "express";
import type {Request, Response} from "express";

import pool from "../db/database.js";
import {requireAdmin} from "../middleware/auth-admin.js";
import type {Reservation, ReservationGame, ReservationInteraction,} from "../types/reservation.js";

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
 * ! - POST /api/festivals/:id/reservations/:reservationId/interactions - Add an interaction to a reservation
 */

const router = Router();

/* ---------- /api/festivals/:id/reservations ----------*/

// GET /api/festivals/:id/reservations - Get all reservations for a festival
router.get("/:id/reservations", async (req: Request, res: Response) => {
    try
    {
        const {id} = req.params;

        const {rows} = await pool.query<Reservation>(
            `SELECT 
                r.id,
                r.festival_id,
                r.entity_id,
                r.table_count,
                r.big_table_count,
                r.town_table_count,
                r.electrical_outlets,
                r.note,
                r.status,
                COALESCE(json_agg(DISTINCT jsonb_build_object('id', ri.id, 'reservation_id', ri.reservation_id, 'description', ri.description, 'interaction_date', ri.interaction_date)) FILTER (WHERE ri.id IS NOT NULL), '[]'::json) as interactions,
                COALESCE(json_agg(DISTINCT jsonb_build_object('id', rg.id, 'reservation_id', rg.reservation_id, 'game_id', rg.game_id, 'amount', rg.amount, 'table_count', rg.table_count, 'big_table_count', rg.big_table_count, 'town_table_count', rg.town_table_count, 'electrical_outlets', rg.electrical_outlets, 'status', rg.status, 'zone_id', rg.zone_id, 'floor_space', rg.floor_space)) FILTER (WHERE rg.id IS NOT NULL), '[]'::json) as games
            FROM reservations r
            LEFT JOIN reservation_interactions ri ON r.id = ri.reservation_id
            LEFT JOIN reservation_games rg ON r.id = rg.reservation_id
            WHERE r.festival_id = $1
            GROUP BY r.id
            ORDER BY r.id DESC`,
            [id]);

        res.json(rows);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not fetch reservations: " + err.message,
        });
    }
});

// ! POST /api/festivals/:id/reservations - Create a new reservation
router.post("/:id/reservations", requireAdmin, async (req: Request, res: Response) => {
    const {id} = req.params;
    const {
        entity_id,
        table_count = 0,
        big_table_count = 0,
        town_table_count = 0,
        note,
        status = "TO_BE_CONTACTED",
    } = req.body;

    if (!entity_id)
    {
        return res.status(400).json({error: "entity_id is required"});
    }

    try
    {
        const {rows} = await pool.query<Reservation>(
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
            ]);

        res.status(201).json(rows[0]);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not create reservation: " + err.message,
        });
    }
});

/* ---------- /api/festivals/:id/reservations/:reservationId ----------*/

// GET /api/festivals/:id/reservations/:reservationId - Get a specific reservation with interactions and games
router.get("/:id/reservations/:reservationId", async (req: Request, res: Response) => {
    try
    {
        const {id, reservationId} = req.params;

        const {rows: reservationRows} = await pool.query<Reservation>(
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
                COALESCE(json_agg(DISTINCT jsonb_build_object('id', rg.id, 'reservation_id', rg.reservation_id, 'game_id', rg.game_id, 'amount', rg.amount, 'table_count', rg.table_count, 'big_table_count', rg.big_table_count, 'town_table_count', rg.town_table_count, 'electrical_outlets', rg.electrical_outlets, 'status', rg.status, 'zone_id', rg.zone_id, 'floor_space', rg.floor_space)) FILTER (WHERE rg.id IS NOT NULL), '[]'::json) as games
            FROM reservations r
            LEFT JOIN reservation_interactions ri ON r.id = ri.reservation_id
            LEFT JOIN reservation_games rg ON r.id = rg.reservation_id
            WHERE r.festival_id = $1 AND r.id = $2
            GROUP BY r.id`,
            [id, reservationId]);

        if (reservationRows.length === 0)
        {
            return res.status(404).json({error: "Reservation not found"});
        }

        res.json(reservationRows[0]);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not fetch reservation: " + err.message,
        });
    }
});

// ! PUT /api/festivals/:id/reservations/:reservationId - Update a reservation
router.put("/:id/reservations/:reservationId", requireAdmin, async (req: Request, res: Response) => {
    const {id, reservationId} = req.params;
    const {
        table_count,
        big_table_count,
        town_table_count,
        electrical_outlets,
        note,
        status,
    } = req.body;

    console.log("Update request body:", req.body);

    if (id === undefined || reservationId === undefined)
    {
        return res.status(400).json({error: "Missing reservation identifiers"});
    }

    const updates: {[key: string]: string|number|null|Date} = {};

    if (table_count !== undefined) updates.table_count = table_count;
    if (big_table_count !== undefined) updates.big_table_count = big_table_count;
    if (town_table_count !== undefined) updates.town_table_count = town_table_count;
    if (note !== undefined) updates.note = note;
    if (status !== undefined) updates.status = status;
    if (electrical_outlets !== undefined) updates.electrical_outlets = electrical_outlets;

    if (Object.keys(updates).length === 0)
    {
        return res.status(400).json({error: "No fields to update"});
    }

    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");

    values.push(id, reservationId);

    try
    {
        const {rows} = await pool.query<Reservation>(
            `UPDATE reservations
                SET ${setClause}
                WHERE festival_id = $${values.length - 1} AND id = $${values.length}
                RETURNING *`,
            values);

        if (rows.length === 0)
        {
            return res.status(404).json({error: "Reservation not found"});
        }

        res.json(rows[0]);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not update reservation: " + err.message,
        });
    }
});

// ! DELETE /api/festivals/:id/reservations/:reservationId - Delete a reservation
router.delete("/:id/reservations/:reservationId", requireAdmin, async (req: Request, res: Response) => {
    const {id, reservationId} = req.params;

    try
    {
        const {rowCount} = await pool.query(
            `DELETE FROM reservations
            WHERE festival_id = $1 AND id = $2`,
            [id, reservationId]);

        if (rowCount === 0)
        {
            return res.status(404).json({error: "Reservation not found"});
        }

        res.status(204).send();
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not delete reservation: " + err.message,
        });
    }
});

/* ---------- /api/festivals/:id/reservations/:reservationId/interactions ----------*/

// ! POST /api/festivals/:id/reservations/:reservationId/interactions - Add an interaction to a reservation
router.post("/:id/reservations/:reservationId/interactions", requireAdmin, async (req: Request, res: Response) => {
    const {id, reservationId} = req.params;
    const {description} = req.body;

    if (!description)
    {
        return res.status(400).json({error: "description is required"});
    }

    try
    {
        const {rows: reservationRows} =
            await pool.query(`SELECT id FROM reservations WHERE festival_id = $1 AND id = $2`, [id, reservationId]);

        if (reservationRows.length === 0)
        {
            return res.status(404).json({error: "Reservation not found"});
        }

        const {rows} = await pool.query<ReservationInteraction>(
            `INSERT INTO reservation_interactions (reservation_id, description, interaction_date)
                VALUES ($1, $2, NOW())
                RETURNING *`,
            [reservationId, description]);

        res.status(201).json(rows[0]);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not add interaction: " + err.message,
        });
    }
});

/* ---------- /api/festivals/:id/reservations/:reservationId/games ----------*/

// ! POST /api/festivals/:id/reservations/:reservationId/games - Upsert a game in a reservation
router.post("/:id/reservations/:reservationId/games", requireAdmin, async (req: Request, res: Response) => {
    const {id, reservationId} = req.params;
    const {
        game_id,
        amount,
        table_count,
        big_table_count,
        town_table_count,
        electrical_outlets,
        status,
        zone_id,
        floor_space,
    } = req.body;

    if (!game_id)
    {
        return res.status(400).json({error: "game_id is required"});
    }

    try
    {
        const existingInfo = await pool.query(
            `SELECT g.name, rg.status, rg.id as reservation_game_id 
             FROM games_publisher g 
             LEFT JOIN reservation_games rg ON rg.game_id = g.id AND rg.reservation_id = $1 
             WHERE g.id = $2`,
            [reservationId, game_id]);

        const gameName = existingInfo.rows[0]?.name || 'Jeu inconnu';
        const oldStatus = existingInfo.rows[0]?.status;
        const exists = !!existingInfo.rows[0]?.reservation_game_id;
        const actualNewStatus = status !== undefined ? status : (exists ? oldStatus : "ASKED");
        const statusChanged = actualNewStatus !== oldStatus;

        let result;
        if (exists)
        {
            result = await pool.query(
                `UPDATE reservation_games 
                     SET amount = $1, table_count = $2, big_table_count = $3, town_table_count = $4, electrical_outlets = $5, status = $6, zone_id = $7, floor_space = $8
                     WHERE reservation_id = $9 AND game_id = $10
                     RETURNING *`,
                [
                    amount ?? 0,
                    table_count ?? 0,
                    big_table_count ?? 0,
                    town_table_count ?? 0,
                    electrical_outlets ?? 0,
                    actualNewStatus,
                    zone_id ?? null,
                    floor_space ?? 0,
                    reservationId,
                    game_id,
                ]);
        }
        else
        {
            result = await pool.query(
                `INSERT INTO reservation_games 
                     (reservation_id, game_id, amount, table_count, big_table_count, town_table_count, electrical_outlets, status, zone_id, floor_space)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     RETURNING *`,
                [
                    reservationId,
                    game_id,
                    amount ?? 0,
                    table_count ?? 0,
                    big_table_count ?? 0,
                    town_table_count ?? 0,
                    electrical_outlets ?? 0,
                    actualNewStatus,
                    zone_id ?? null,
                    floor_space ?? 0,
                ]);
        }

        if (statusChanged)
        {
            const description = exists ? `Statut du jeu "${gameName}" modifié : ${oldStatus} -> ${actualNewStatus}` :
                                         `Jeu "${gameName}" ajouté avec le statut : ${actualNewStatus}`;

            await pool.query(
                `INSERT INTO reservation_interactions (reservation_id, description, interaction_date)
                 VALUES ($1, $2, NOW())`,
                [reservationId, description]);
        }

        res.status(200).json(result.rows[0]);
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not upsert reservation game: " + err.message,
        });
    }
});

// ! DELETE /api/festivals/:id/reservations/:reservationId/games/:gameId - Delete a game from a reservation
router.delete("/:id/reservations/:reservationId/games/:gameId", requireAdmin, async (req: Request, res: Response) => {
    const {id, reservationId, gameId} = req.params;

    try
    {
        const {rowCount} = await pool.query(
            `DELETE FROM reservation_games WHERE reservation_id = $1 AND game_id = $2`, [reservationId, gameId]);

        if (rowCount === 0)
        {
            return res.status(404).json({error: "Reservation game not found"});
        }

        res.status(204).send();
    }
    catch (err: any)
    {
        console.error(err);
        res.status(500).json({
            error: "Could not delete reservation game: " + err.message,
        });
    }
});

export default router;
