// Utils functions
import {Request, Response} from 'express';
import * as crypto from 'node:crypto';
import {ErrorMsg, Game, Stat} from "./models";
import {ServiceGame, ServiceStat} from "./services";

export class Utils {
    public static deviceHash(req: Request): string {
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
        const ua = req.headers['user-agent'] as string;
        return crypto.createHash('sha256').update(ip+ua).digest('hex');
    }

    public static async checkToken(req: Request, res: Response): Promise<Game|null> {
        if(!req.query.token) {
            res.status(400);
            res.send(JSON.stringify(new ErrorMsg(400, "Missing Token")));
            return null;
        }
        const gameService = new ServiceGame();
        const retGame = await gameService.getToken(req.query.token as string);
        if(!retGame) {
            res.status(400);
            res.send(JSON.stringify(new ErrorMsg(400, "Missing Game")));
            return null;
        }

        return retGame;
    }

    public static async updateStats(req: Request, action: string): Promise<void> {
        const deviceId = this.deviceHash(req);
        const statService = new ServiceStat();
        let userStats = await statService.getStat(deviceId);
        if (!userStats) {
            userStats = new Stat(deviceId,0,0,0);
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