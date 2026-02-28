import { Request, Response } from "express";
import { registeredClients } from "../states/clients";

export const onPowerOn = (req: Request, res: Response) => {
    const clientsSent = Array.from(registeredClients).filter(
        (c) => c.readyState === c.OPEN
    ).length;

    console.log(`Sending power on to ${clientsSent} registered client(s)`);

    registeredClients.forEach((c) => {
        if (c.readyState === c.OPEN) {
            c.send(JSON.stringify({ op: "powerStateChange", state: true }));
        }
    });

    res.json({ ok: true, clientsSent });
};

export const onPowerOff = (req: Request, res: Response) => {
    const clientsSent = Array.from(registeredClients).filter(
        (c) => c.readyState === c.OPEN
    ).length;

    console.log(`Sending power off to ${clientsSent} registered client(s)`);

    registeredClients.forEach((c) => {
        if (c.readyState === c.OPEN) {
            c.send(JSON.stringify({ op: "powerStateChange", state: false }));
        }
    });

    res.json({ ok: true, clientsSent });
};

export const getRegisteredClients = (req: Request, res: Response) => {
    const count = registeredClients.size;
    console.log(`Registered clients count: ${count}`);
    res.json({ ok: true, registeredClientsCount: count });
};
