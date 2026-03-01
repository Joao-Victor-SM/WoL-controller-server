import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { registeredClients } from "../states/clients";
import isJSONValid from "../utils/isJSONValid";

export function initWebSocket(server: Server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws: WebSocket) => {
        ws.on("message", (data) => {
            const dataString = data.toString();

            if (!isJSONValid(dataString)) {
                ws.send("Invalid JSON");
                return;
            }

            const msg = JSON.parse(dataString);

            if (msg.op === "register") {
                registeredClients.add(ws);
                console.log("Added Client");
                ws.send(JSON.stringify({ message: "Registered" }));
            } else if (msg.op === "ping") {
                const date = new Date()
                console.log(`${date.toString()} - Ping received`);
                ws.send(JSON.stringify({ op: "pong" }));
            }
        });

        ws.on("close", () => registeredClients.delete(ws));
    });

    return wss;
}
