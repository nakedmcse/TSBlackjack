// Simple Blackjack API
import express from 'express';
import * as crypto from 'node:crypto';
import {errorMsg, game, responseMsg, statsMsg} from "./models";
import {utils} from "./utils";
import {dataSource} from "./db/datasource";
import {gamelogic} from "./gamelogic";
import {serviceGame, serviceStat} from "./services";

const blackjackAPI = express();
blackjackAPI.use(express.json());

// Endpoints
blackjackAPI.get('/deal', async (req, res): Promise<void> => {
    const deviceId = utils.deviceHash(req);
    const gameService = new serviceGame();
    let retGame = await gameService.getDevice(deviceId);

    if (!retGame) {
        const newGame = new game(crypto.randomUUID(), deviceId, "playing", Date.now());
        gamelogic.createDeck(newGame);
        gamelogic.deal(newGame);
        await gameService.saveGame(newGame)
        console.log(`Created new game for ${deviceId}:${newGame.token}`);
        retGame = newGame;
    }
    console.log(`DEAL: ${retGame.token}`);
    const resp = new responseMsg(retGame.token, retGame.playerCards, [],
        gamelogic.value(retGame.playerCards), 0, retGame.status);
    res.send(JSON.stringify(resp));
});

blackjackAPI.get('/hit', async (req, res): Promise<void> => {
    const retGame = await utils.checkToken(req, res);
    if(!retGame) {
        return;
    }
    gamelogic.hit(retGame);
    console.log(`HIT: ${retGame.token}`);
    if(gamelogic.value(retGame.playerCards) > 21) {
        retGame.status = "Bust";
        console.log("BUST");
    }

    const gameService = new serviceGame();
    const resp = new responseMsg(retGame.token, retGame.playerCards, [],
        gamelogic.value(retGame.playerCards), 0, retGame.status);
    if(retGame.status === "Bust") {
        await gameService.deleteGame(retGame)
        await utils.updateStats(req, "loss");
    } else {
        await gameService.saveGame(retGame);
    }
    res.send(JSON.stringify(resp));
});

blackjackAPI.get('/stay', async (req, res): Promise<void> => {
    const retGame = await utils.checkToken(req, res);
    if(!retGame) {
        return;
    }
    gamelogic.stay(retGame);
    console.log(`STAY: ${retGame.token}`);
    const playerVal = gamelogic.value(retGame.playerCards);
    const dealerVal = gamelogic.value(retGame.dealerCards);
    if(dealerVal > 21) {
        retGame.status = "Dealer Bust";
        console.log("DEALER BUST");
        await utils.updateStats(req, "win");
    }
    else if(playerVal > dealerVal) {
        retGame.status = "Player Wins";
        console.log("PLAYER WIN");
        await utils.updateStats(req, "win");
    }
    else if(dealerVal > playerVal) {
        retGame.status = "Dealer Wins";
        console.log("DEALER WIN");
        await utils.updateStats(req, "loss");
    }
    else {
        retGame.status = "Draw";
        console.log("DRAW");
        await utils.updateStats(req, "draw");
    }

    const resp = new responseMsg(retGame.token, retGame.playerCards, retGame.dealerCards,
        playerVal, dealerVal, retGame.status);

    const gameService = new serviceGame();
    await gameService.deleteGame(retGame);

    res.send(JSON.stringify(resp));
});

blackjackAPI.get('/stats', async (req, res): Promise<void> => {
    const deviceId = utils.deviceHash(req);
    const statService = new serviceStat();
    let userStats = await statService.getStat(deviceId);
    console.log('STATS');
    if (!userStats) {
        console.log('MISSING DEVICE');
        res.status(400);
        res.send(JSON.stringify(new errorMsg(400, "Missing Device")));
        return;
    }
    const retStats = new statsMsg(userStats.wins, userStats.loses, userStats.draws);
    res.send(JSON.stringify(retStats));
});

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