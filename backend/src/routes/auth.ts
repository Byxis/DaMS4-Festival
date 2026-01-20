import bcrypt from "bcryptjs";
import {Router} from "express";
import rateLimit from 'express-rate-limit';
import jwt from "jsonwebtoken";

import {JWT_SECRET} from "../config/env.js";
import pool from "../db/database.js";
import {createAccessToken, createRefreshToken, verifyToken,} from "../middleware/token-management.js";
import type {TokenPayload} from "../types/token-payload.js";

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    limit: 5,                  // Limit each IP to 5 requests
    message: {error: 'Too many login attempts, please try again later.'},
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    limit: 2,                  // Limit each IP to 2 requests
    message: {error: 'Too many register attempts, please try again later.'},
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req, res) => {
    // --- LOGIN ---
    const {email, password} = req.body;
    if (!email || !password)
        // si pas de login ou password dans la requête => ERREUR : fin du login
        return res.status(400).json({error: "Identifiants manquants"});

    const {rows} = await pool.query("SELECT * FROM users WHERE email=$1", [
        email,
    ]);  // on récupère le user dans la BD
    const user = rows[0];
    if (!user)
        return res.status(401).json({error: "Utilisateur inconnu"});  // pas dans la base => ERREUR : fin du login

    if (!user.password_hash)
    {
        return res.status(401).json({error: "Compte non activé"});
    }  // user exists but no password set (invited by admin but not registered) => ERREUR : fin du login

    const match = await bcrypt.compare(password, user.password_hash);  // on vérifie le password
    if (!match)
        return res.status(401).json({error: "Mot de passe incorrect"});  // si pas de match => ERREUR : fin du login

    const accessToken = createAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });  // création du token d'accès
    const refreshToken = createRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });  // création du refresh token

    res.cookie("access_token", accessToken, {
        // --------------------------------- Cookies sécurisés pour le token d'accès
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
        // --------------------------------- Cookies sécurisés pour le refresh token
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
        message: "Authentification réussie",
        user: {email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role},
    });  // connexion successful
});

router.post("/logout", (_req, res) => {
    // --- LOGOUT ---
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.json({message: "Déconnexion réussie"});
});

router.post("/register", async (req, res) => {
    const {email, password, firstName, lastName} = req.body;

    if (!email || !password || !firstName || !lastName)
    {
        return res.status(400).json({error: "Champs manquants"});
    }

    const hashed = await bcrypt.hash(password, 10);

    try
    {
        // Check if user already exists
        const {rows} = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        const existingUser = rows[0];

        // User exists and already registered
        if (existingUser && existingUser.password_hash)
        {
            return res.status(409).json({error: "Compte déjà existant"});
        }

        // User exists but invited by admin –> complete account
        if (existingUser && !existingUser.password_hash)
        {
            const {rows: updatedRows} = await pool.query(
                `UPDATE users
                 SET password_hash = $1,
                     first_name = $2,
                     last_name = $3
                 WHERE email = $4
                 RETURNING id, email, first_name, last_name, role`,
                [hashed, firstName, lastName, email]);

            const user = updatedRows[0];

            return res.status(200).json({
                message: "Compte complété",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,  // role set by admin preserved
                },
            });
        }

        // New user –> create guest
        const {rows: newRows} = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role)
             VALUES ($1, $2, $3, $4, 'guest')
             RETURNING id, email, first_name, last_name, role`,
            [email, hashed, firstName, lastName]);

        const user = newRows[0];

        res.status(201).json({
            message: "Utilisateur créé",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
            },
        });
    }
    catch (err)
    {
        console.error(err);
        res.status(500).json({error: "Erreur serveur"});
    }
});
router.get("/whoami", verifyToken, (req, res) => {
    res.json({user: req.user});
});

router.post("/refresh", (req, res) => {
    const refresh = req.cookies?.refresh_token;
    if (!refresh) return res.status(401).json({error: "Refresh token manquant"});
    try
    {
        const decoded = jwt.verify(refresh, JWT_SECRET) as TokenPayload;
        const newAccess = createAccessToken({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        });
        res.cookie("access_token", newAccess, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });
        res.json({message: "Token renouvelé"});
    }
    catch
    {
        res.status(403).json({error: "Refresh token invalide ou expiré"});
    }
});

// ------ Exemple de route accessible uniquement avec un JWT valide ------
router.get("/me", verifyToken, (req: Express.Request, res) => {
    res.json(
        {message: "Utilisateur authentifié", user: req.user});  // req typée automatiquement => pas d'erreur dans VSCode
});

export default router;
