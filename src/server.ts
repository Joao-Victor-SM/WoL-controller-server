import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import logger from "./middleware/logger";
import { onPowerOff, onPowerOn } from "./controllers/powerController";
import { initWebSocket } from "./websocket";
import { requireApiKey } from "./middleware/auth";

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

    const server = app.listen(port, () => console.log(`Started on port: ${port}`));

    initWebSocket(server)

    app.get("/power/on", requireApiKey, onPowerOn)
    app.get("/power/off", requireApiKey, onPowerOff)
}
