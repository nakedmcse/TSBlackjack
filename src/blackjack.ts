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
 *   get:
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
blackjackAPI.get('/deal', async (req, res): Promise<void> => {
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
    const resp = new ResponseMsg(retGame.token, retGame.playerCards, [],
        Gamelogic.value(retGame.playerCards), 0, retGame.status);
    res.send(JSON.stringify(resp));
});

/**
 * @swagger
 * /hit:
 *   get:
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
blackjackAPI.get('/hit', async (req, res): Promise<void> => {
    const device = Utils.deviceHash(req);
    const token = req.query.token as string;
    const retGame = await gameService.getActiveGame(device, token);
    if(!retGame) {
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Game")));
        return;
    }

    const resp = await Gamelogic.hit(retGame, device);

    res.send(JSON.stringify(resp));
});

/**
 * @swagger
 * /stay:
 *   get:
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
blackjackAPI.get('/stay', async (req, res): Promise<void> => {
    const device = Utils.deviceHash(req);
    const token = req.query.token as string;
    const retGame = await gameService.getActiveGame(device, token);
    if(!retGame) {
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Game")));
        return;
    }

    const resp = await Gamelogic.stay(retGame, device);

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
 *         description: Game with a new card added to the players hand
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
        console.log('MISSING DEVICE');
        res.status(400);
        res.send(JSON.stringify(new ErrorMsg(400, "Missing Device")));
        return;
    }
    const retStats = new StatsMsg(userStats.wins, userStats.loses, userStats.draws);
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
        new ResponseMsg(x.token, x.playerCards, x.dealerCards, Gamelogic.value(x.playerCards), Gamelogic.value(x.dealerCards), x.status));
    res.send(JSON.stringify(historyResp));
})
