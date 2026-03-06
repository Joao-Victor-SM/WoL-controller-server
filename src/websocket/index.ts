import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { registeredClients } from "../states/clients";
import isJSONValid from "../utils/isJSONValid";

const PING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function initWebSocket(server: Server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws: WebSocket) => {
        let pingTimeoutId: NodeJS.Timeout;

        const resetPingTimer = () => {
            if (pingTimeoutId) clearTimeout(pingTimeoutId);
            pingTimeoutId = setTimeout(() => {
                console.log(`Client did not send ping within ${PING_TIMEOUT_MS / 1000} minutes - disconnecting`);
                ws.terminate();
                registeredClients.delete(ws);
            }, PING_TIMEOUT_MS);
        };

        resetPingTimer();

        const formatTimestamp = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} - ${hours}:${minutes}`;
        };

        ws.on("message", (data) => {
            const dataString = data.toString();

            if (!isJSONValid(dataString)) {
                ws.send("Invalid JSON");
                return;
            }

            const msg = JSON.parse(dataString);

            resetPingTimer();

            if (msg.op === "register") {
                registeredClients.add(ws);
                console.log("Added Client");
                ws.send(JSON.stringify({ message: "Registered" }));
            } else if (msg.op === "ping") 
                ws.send(JSON.stringify({ op: "pong" }))
            
        });

        ws.on("close", () => {
            if (pingTimeoutId) clearTimeout(pingTimeoutId);
            registeredClients.delete(ws);
            console.log(`Client timed out at ${formatTimestamp(new Date())}`);
        });

        ws.on("error", (error) => {
            console.error(`WebSocket error: ${error.message}`);
            if (pingTimeoutId) clearTimeout(pingTimeoutId);
            registeredClients.delete(ws);
        });
    });

    return wss;
}
