import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { registeredClients } from "./states/clients";
import isJSONValid from "./utils/isJSONValid";

export function initWebSocket(server: Server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws: WebSocket) => {
        ws.on("message", (data) => {
            const raw = data.toString();

            if (!isJSONValid(raw)) {
                ws.send("Invalid JSON");
                return;
            }

            const msg = JSON.parse(raw);

            if (msg.op === "register") {
                registeredClients.add(ws);
                ws.send(JSON.stringify({ message: "Registered" }));
            }
        });

        ws.on("close", () => {
            registeredClients.delete(ws);
        });
    });

    return wss;
}
