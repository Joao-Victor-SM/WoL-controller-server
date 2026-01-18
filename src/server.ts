import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

import isJSONValid from "./utils/isJSONValid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
    const app = express();
    app.use(cors());
    app.use(express.static(path.join(__dirname, "dist")));

    const port = Number(process.env.APP_PORT);
    if (!port) throw new Error("APP_PORT missing");

    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
    });

    const server = app.listen(port, () => {
        console.log(`Started on port: ${port}`);
    });

    const wss = new WebSocketServer({ server });

    const registeredClients = new Set<any>();

    wss.on("connection", (ws) => {
        ws.on("message", (data) => {
            if (!isJSONValid(data.toString())) {
                ws.send("Invalid JSON");
                return;
            }

            const msg = JSON.parse(data.toString());

            if (msg.op === "register") {
                registeredClients.add(ws);
                ws.send(JSON.stringify({ message: "Registered" }));
            }
        });

        ws.on("close", () => registeredClients.delete(ws));
    });

    app.get("/power/on", (req, res) => {
        registeredClients.forEach((c) => {
            if (c.readyState === c.OPEN) {
                c.send(JSON.stringify({ op: "powerStateChange", state: true }));
            }
        });
        res.json({ ok: true });
    });

    app.get("/power/off", (req, res) => {
        registeredClients.forEach((c) => {
            if (c.readyState === c.OPEN) {
                c.send(JSON.stringify({ op: "powerStateChange", state: false }));
            }
        });
        res.json({ ok: true });
    });
}
