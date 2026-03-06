import axios, { isAxiosError } from "axios";
import { Request, Response, NextFunction } from "express";
import net from "net";
import localAxios from "../utils/localAxios";

export const isIpOnTailscale = async (ip: string): Promise<boolean> => {
  if (!net.isIP(ip)) return false;
  const [first, second] = ip.split(".").map(Number);
  if (first !== 100 || second < 64 || second > 127) return false;
  try {
    const { data } = await localAxios.get("/localapi/v0/whois", {
      params: { addr: ip },
    });
    return !!data?.Node;
  } catch (error: any) {
    if (isAxiosError(error) && error.response?.status === 404) return false; 
    throw error;
  }
};

function getClientIp(req: Request) {
    let ip = req.ip || req.connection.remoteAddress || "";
    if (ip.startsWith("::ffff:")) ip = ip.substring(7);
    return ip;
}

export const requireApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const ip = getClientIp(req);
    const apiKey = req.header("api-key");

    const isOnTailscale = isIpOnTailscale(ip);
    const hasValidKey = apiKey && apiKey === process.env.API_KEY;

    if (!hasValidKey && !isOnTailscale) {
        console.warn(`Unauthorized access attempt from IP: ${ip}`);
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (await isOnTailscale) 
        console.log(`Access allowed via Tailscale IP: ${ip}`);
     else if (hasValidKey) 
        console.log(`Access allowed via API key from IP: ${ip}`);
    

    next();
};