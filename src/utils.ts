// Utils functions
import {Request, Response} from 'express';
import * as crypto from 'node:crypto';
import {errorMsg, game, stat} from "./models";
import {serviceGame, serviceStat} from "./services";

export class utils {
    public static deviceHash(req: Request): string {
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
        const ua = req.headers['user-agent'] as string;
        return crypto.createHash('sha256').update(ip+ua).digest('hex');
    }

    public static async checkToken(req: Request, res: Response): Promise<game|null> {
        if(!req.query.token) {
            res.status(400);
            res.send(JSON.stringify(new errorMsg(400, "Missing Token")));
            return null;
        }
        const gameService = new serviceGame();
        const retGame = await gameService.getToken(req.query.token as string);
        if(!retGame) {
            res.status(400);
            res.send(JSON.stringify(new errorMsg(400, "Missing Game")));
            return null;
        }

        return retGame;
    }

    public static async updateStats(req: Request, action: string): Promise<void> {
        const deviceId = this.deviceHash(req);
        const statService = new serviceStat();
        let userStats = await statService.getStat(deviceId);
        if (!userStats) {
            userStats = new stat(deviceId,0,0,0);
        }
        switch(action) {
            case "win":
                userStats.wins++;
                break;
            case "loss":
                userStats.loses++;
                break;
            case "draw":
                userStats.draws++;
                break;
        }
        await statService.saveStat(userStats);
    }
}