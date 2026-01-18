import { Request, Response } from "express";
import { registeredClients } from "../states/clients";

export const onPowerOn = (req: Request, res: Response) => {
    registeredClients.forEach((c) => {
        if (c.readyState === c.OPEN) {
            c.send(JSON.stringify({ op: "powerStateChange", state: true }));
        }
    });

    res.json({ ok: true });
};

export const onPowerOff = (req: Request, res: Response) => {
    registeredClients.forEach((c) => {
        if (c.readyState === c.OPEN) {
            c.send(JSON.stringify({ op: "powerStateChange", state: false }));
        }
    });

    res.json({ ok: true });
};
