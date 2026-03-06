import { Request, Response, NextFunction } from "express";

function getIp(req: Request) {
    let ip = req.ip || req.connection.remoteAddress || "";
    if (ip.startsWith("::ffff:")) ip = ip.substring(7);
    return ip;
}
const isIpOnTailscaleNetwork = (ip:string)=>ip.startsWith("100.")
export const requireApiKey = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const ip = getIp(req) 
    const key = req.header("api-key");
    console.log(ip)
    const isOnNetwork = isIpOnTailscaleNetwork(ip)
    if ((!key || key !== process.env.API_KEY) && !isOnNetwork) 
        return res.status(401).json({ error: "Unauthorized" });
    next();
}
