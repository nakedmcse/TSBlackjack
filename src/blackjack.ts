// Simple Blackjack API
import express from 'express';
import * as crypto from 'node:crypto';
import {ErrorMsg, Game, ResponseMsg, StatsMsg} from "./models";
import {Utils} from "./utils";
import {dataSource} from "./db/datasource";
import {Gamelogic} from "./gamelogic";
import {ServiceGame, ServiceStat} from "./services";

const blackjackAPI = express();
blackjackAPI.use(express.json());

// Bootstrap
blackjackAPI.listen(3000, () => {
    dataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized");
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err);
        });
    console.log('BlackJack listening on port 3000');
});

// Endpoints
blackjackAPI.get('/deal', async (req, res): Promise<void> => {
    const deviceId = Utils.deviceHash(req);
    const gameService = new ServiceGame();
    let retGame = await gameService.getDevice(deviceId);

    if (!retGame) {
        const newGame = new Game(crypto.randomUUID(), deviceId, "playing", Date.now());
        Gamelogic.createDeck(newGame);
        Gamelogic.deal(newGame);
        await gameService.saveGame(newGame)
        console.log(`Created new game for ${deviceId}:${newGame.token}`);
        retGame = newGame;
    }
    console.log(`DEAL: ${retGame.token}`);
    const resp = new ResponseMsg(retGame.token, retGame.playerCards, [],
        Gamelogic.value(retGame.playerCards), 0, retGame.status);
    res.send(JSON.stringify(resp));
});

blackjackAPI.get('/hit', async (req, res): Promise<void> => {
    const device = Utils.deviceHash(req);
    const token = req.query.token as string;
    const gameService = new ServiceGame();
    const retGame = await gameService.getActiveGame(device, token);
    if(!retGame) {
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Game")));
        return;
    }

    const resp = await Gamelogic.hit(retGame, device);

    res.send(JSON.stringify(resp));
});

blackjackAPI.get('/stay', async (req, res): Promise<void> => {
    const device = Utils.deviceHash(req);
    const token = req.query.token as string;
    const gameService = new ServiceGame();
    const retGame = await gameService.getActiveGame(device, token);
    if(!retGame) {
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Game")));
        return;
    }

    const resp = await Gamelogic.stay(retGame, device);

    res.send(JSON.stringify(resp));
});

blackjackAPI.get('/stats', async (req, res): Promise<void> => {
    const deviceId = Utils.deviceHash(req);
    const statService = new ServiceStat();
    let userStats = await statService.getStat(deviceId);
    console.log('STATS');
    if (!userStats) {
        console.log('MISSING DEVICE');
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Device")));
        return;
    }
    const retStats = new StatsMsg(userStats.wins, userStats.loses, userStats.draws);
    res.send(JSON.stringify(retStats));
});
