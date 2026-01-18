import { Request, Response, NextFunction } from "express";

const logger = (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
        console.log("Response:", body);
        return originalJson(body);
    };

    next();
};

export default logger;
