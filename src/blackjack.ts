// Simple Blackjack API
import express from 'express';
import * as crypto from 'node:crypto';
import {ErrorMsg, Game, GameState, ResponseMsg, StatsMsg} from "./models";
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
    const statService = new ServiceStat();
    const device = Utils.deviceHash(req);
    const retGame = await Utils.checkToken(req, res);
    if(!retGame) {
        return;
    }
    Gamelogic.hit(retGame);
    console.log(`HIT: ${retGame.token}`);
    if(Gamelogic.value(retGame.playerCards) > 21) {
        retGame.status = "Bust";
        console.log("BUST");
    }

    const gameService = new ServiceGame();
    const resp = new ResponseMsg(retGame.token, retGame.playerCards, [],
        Gamelogic.value(retGame.playerCards), 0, retGame.status);
    if(retGame.status === "Bust") {
        await gameService.deleteGame(retGame)
        await statService.updateStats(device, GameState.Loss);
    } else {
        await gameService.saveGame(retGame);
    }
    res.send(JSON.stringify(resp));
});

blackjackAPI.get('/stay', async (req, res): Promise<void> => {
    const statService = new ServiceStat();
    const device = Utils.deviceHash(req);
    const retGame = await Utils.checkToken(req, res);
    if(!retGame) {
        return;
    }
    Gamelogic.stay(retGame);
    console.log(`STAY: ${retGame.token}`);
    const playerVal = Gamelogic.value(retGame.playerCards);
    const dealerVal = Gamelogic.value(retGame.dealerCards);
    if(dealerVal > 21) {
        retGame.status = "Dealer Bust";
        console.log("DEALER BUST");
        await statService.updateStats(device, GameState.Win);
    }
    else if(playerVal > dealerVal) {
        retGame.status = "Player Wins";
        console.log("PLAYER WIN");
        await statService.updateStats(device, GameState.Win);
    }
    else if(dealerVal > playerVal) {
        retGame.status = "Dealer Wins";
        console.log("DEALER WIN");
        await statService.updateStats(device, GameState.Loss);
    }
    else {
        retGame.status = "Draw";
        console.log("DRAW");
        await statService.updateStats(device, GameState.Draw);
    }

    const resp = new ResponseMsg(retGame.token, retGame.playerCards, retGame.dealerCards,
        playerVal, dealerVal, retGame.status);

    const gameService = new ServiceGame();
    await gameService.deleteGame(retGame);

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
