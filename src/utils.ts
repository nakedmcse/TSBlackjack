// Utils functions
import {Request, Response} from 'express';
import * as crypto from 'node:crypto';

export class Utils {
    public static deviceHash(req: Request): string {
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
        const ua = req.headers['user-agent'] as string;
        return crypto.createHash('sha256').update(ip+ua).digest('hex');
    }

    public static setNoCache(res: Response): void {
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
}