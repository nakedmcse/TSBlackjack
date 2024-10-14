// Simple Blackjack API
import express from 'express';
import * as crypto from 'node:crypto';
import * as path from "node:path";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {swaggerOpts} from "./swagger";
import {ErrorMsg, Game, ResponseMsg, StatsMsg} from "./models";
import {Utils} from "./utils";
import {dataSource} from "./db/datasource";
import {Gamelogic} from "./gamelogic";
import {ServiceGame, ServiceStat} from "./services";
import dotenv from "dotenv";

// Environment
dotenv.config({
    path: path.resolve(__dirname, "../", ".env")
})

// Express
const blackjackAPI = express();
blackjackAPI.set('etag', false);
blackjackAPI.use(express.json());
const swaggerSpecs = swaggerJsdoc(swaggerOpts);
blackjackAPI.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Services
const gameService = new ServiceGame();
const statService = new ServiceStat();

// Bootstrap
blackjackAPI.listen(process.env.PORT, () => {
    dataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized");
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err);
        });
    console.log(`BlackJack listening on port ${process.env.PORT}`);
});

// Endpoints
/**
 * @swagger
 * tags:
 *   name: Blackjack
 *   description: Blackjack API
 * /deal:
 *   post:
 *     summary: Create a new game, or retrieve existing in progress game
 *     tags: [Blackjack]
 *     responses:
 *       200:
 *         description: Newly created game with first two cards
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMsg'
 */
blackjackAPI.post('/deal', async (req, res): Promise<void> => {
    const deviceId = Utils.deviceHash(req);
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
    const resp = new ResponseMsg(retGame.token, retGame.device, retGame.playerCards, [],
        Gamelogic.value(retGame.playerCards), 0, retGame.status);
    Utils.setNoCache(res);
    res.send(JSON.stringify(resp));
});

/**
 * @swagger
 * /hit:
 *   post:
 *     summary: Draw a card from the dealer
 *     tags: [Blackjack]
 *     parameters:
 *       - in: query
 *         name: token
 *         description: Optional game token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game with a new card added to the players hand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMsg'
 *       400:
 *         description: Unable to find active game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMsg'
 */
blackjackAPI.post('/hit', async (req, res): Promise<void> => {
    const device = Utils.deviceHash(req);
    const token = req.query.token as string;
    const retGame = await gameService.getActiveGame(device, token);
    if(!retGame) {
        Utils.setNoCache(res);
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Game")));
        return;
    }

    const resp = await Gamelogic.hit(retGame, device);

    Utils.setNoCache(res);
    res.send(JSON.stringify(resp));
});

/**
 * @swagger
 * /stay:
 *   post:
 *     summary: Stop drawing cards and allow dealer to draw cards
 *     tags: [Blackjack]
 *     parameters:
 *       - in: query
 *         name: token
 *         description: Optional game token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game with both player and dealer hands, values and outcome status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMsg'
 *       400:
 *         description: Unable to find active game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMsg'
 */
blackjackAPI.post('/stay', async (req, res): Promise<void> => {
    const device = Utils.deviceHash(req);
    const token = req.query.token as string;
    const retGame = await gameService.getActiveGame(device, token);
    if(!retGame) {
        Utils.setNoCache(res);
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Game")));
        return;
    }

    const resp = await Gamelogic.stay(retGame, device);

    Utils.setNoCache(res);
    res.send(JSON.stringify(resp));
});

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get player stats of wins, loses and draws
 *     tags: [Blackjack]
 *     responses:
 *       200:
 *         description: Aggregate win, loss, draw stats for device
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsMsg'
 *       400:
 *         description: Unable to find player by device id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMsg'
 */
blackjackAPI.get('/stats', async (req, res): Promise<void> => {
    const deviceId = Utils.deviceHash(req);
    let userStats = await statService.getStat(deviceId);
    console.log('STATS');
    if (!userStats) {
        Utils.setNoCache(res);
        console.log('MISSING DEVICE');
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Device")));
        return;
    }
    const retStats = new StatsMsg(userStats.wins, userStats.loses, userStats.draws);
    Utils.setNoCache(res);
    res.send(JSON.stringify(retStats));
});

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get player history of games
 *     tags: [Blackjack]
 *     parameters:
 *       - in: query
 *         name: start
 *         description: Optional start date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of all games from players device
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResponseMsg'
 *       400:
 *         description: Unable to find player by device id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMsg'
 */
blackjackAPI.get('/history', async (req, res): Promise<void> => {
    const deviceId = Utils.deviceHash(req);
    const start = req.query.start ? req.query.start as string : null;
    const games = await gameService.getHistory(deviceId, start);
    console.log(`HISTORY ${deviceId} ${start}`);
    const historyResp = games.map(x =>
        new ResponseMsg(x.token, x.device, x.playerCards, x.dealerCards, Gamelogic.value(x.playerCards), Gamelogic.value(x.dealerCards), x.status));
    Utils.setNoCache(res);
    res.send(JSON.stringify(historyResp));
})

/**
 * @swagger
 * /delete:
 *   delete:
 *     summary: Delete player history of games
 *     tags: [Blackjack]
 *     parameters:
 *       - in: query
 *         name: sure
 *         description: Must be set to true to delete
 *         schema:
 *           type: boolean
 *       - in: path
 *         name: token
 *         description: Token for a single game to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: true when deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *       400:
 *         description: Unable to find player by device id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMsg'
 */
blackjackAPI.delete('/delete/:token?', async (req, res): Promise<void> => {
    const deviceId = Utils.deviceHash(req);
    const sure = req.query.sure ? req.query.sure as string : null;
    const token = req.params.token ? req.params.token as string : null;
    if (!sure) {
        console.log('DELETE HISTORY MISSING SURE');
        Utils.setNoCache(res);
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Delete did not have sure set")));
        return;
    }
    const retval = await gameService.deleteHistory(deviceId, token);
    console.log(`DELETE HISTORY ${deviceId}`);
    Utils.setNoCache(res);
    res.send(JSON.stringify(retval))
})
