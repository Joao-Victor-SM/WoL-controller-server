import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

import isJSONValid from "./utils/isJSONValid";
import logger from "./middleware/logger";
import { registeredClients } from "./states/clients";
import { onPowerOff, onPowerOn } from "./controllers/powerController";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
    const app = express();
    app.use(logger)

    app.use(cors());
    app.use(express.static(path.join(__dirname, "dist")));

    const port = Number(process.env.APP_PORT);
    if (!port) throw new Error("APP_PORT missing");

    const server = app.listen(port, () => {
        console.log(`Started on port: ${port}`);
    });

    const wss = new WebSocketServer({ server });


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

    app.get("/power/on", onPowerOn)
    app.get("/power/off", onPowerOff)
}
