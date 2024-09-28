// Utils functions
import {Request, Response} from 'express';
import * as crypto from 'node:crypto';
import {errorMsg, game, stat} from "./models";
import {dataSource} from "./datasource";

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
        const gameRepo = dataSource.getRepository<game>("game");
        const retGame = await gameRepo.findOneBy({ token: req.query.token as string });
        if(!retGame) {
            res.status(400);
            res.send(JSON.stringify(new errorMsg(400, "Missing Game")));
            return null;
        }

        return Object.setPrototypeOf(retGame, game.prototype);
    }

    public static async updateStats(req: Request, action: string): Promise<void> {
        const deviceId = this.deviceHash(req);
        const statRepo = dataSource.getRepository<stat>("stat");
        let userStats = await statRepo.findOneBy({device: deviceId});
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
        await statRepo.save(userStats);
    }
}