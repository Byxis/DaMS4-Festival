import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import https from "https";
import morgan from "morgan";
import multer from "multer";

import {ensureAdmin} from "./db/initAdmin.js";
import {requireAdmin} from "./middleware/auth-admin.js";
import {verifyToken} from "./middleware/token-management.js";
import authRouter from "./routes/auth.js";
import festivalsRouter from "./routes/festivals.js";
import game from "./routes/game.js";
import publicRouter from "./routes/public.js";
import publisherRouter from "./routes/publisher.js";
import reservationsRouter from "./routes/reservations.js";
import usersRouter from "./routes/users.js";

// Création de l’application Express
const app = express();
const upload = multer({dest: "./uploads/logos"});
await ensureAdmin();

// Ajout manuel des principaux en-têtes HTTP de sécurité
app.use((req, res, next) => {
    // Empêche le navigateur d’interpréter un fichier d’un autre type MIME -> attaque : XSS via upload malveillant
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Interdit l'intégration du site dans des iframes externes -> attaque : Clickjacking
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    // Évite que les URL avec paramètres sensibles apparaissent dans les en-têtes "Referer" -> attaque : Token ou
    // paramètres dans l’URL
    res.setHeader("Referrer-Policy", "no-referrer");

    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

    next();
});



app.use(morgan("dev"));  // Log des requêtes : Visualiser le flux de requêtes entre Angular et Express

app.use(express.json());

app.use(cookieParser());



// Configuration CORS : autoriser le front Angular en HTTPS local
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "https://localhost:8080",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);
app.use(express.static("./uploads"));

// Routes publiques
app.use("/api/public", publicRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", verifyToken, usersRouter);

app.use("/api/festivals", verifyToken, festivalsRouter);
app.use("/api/festivals", verifyToken, reservationsRouter);

app.use("/api/admin", verifyToken, requireAdmin, (req, res) => {
    res.json({message: "Bienvenue admin"});
});
app.use("/api/publishers", verifyToken, publisherRouter);

app.post("/api/games/:id/logo", verifyToken, upload.single("logo"), game);
app.use('/api/games', game);

// Chargement du certificat et clé générés par mkcert (étape 0)
const key = fs.readFileSync("./certs/localhost-key.pem");
const cert = fs.readFileSync("./certs/localhost.pem");

// Lancement du serveur HTTPS
https.createServer({key, cert}, app).listen(4000, () => {
    console.log("👍 Serveur API démarré sur https://localhost:4000");
});