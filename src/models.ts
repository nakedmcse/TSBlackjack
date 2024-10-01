// Models for blackjack API
import {Column, Entity, Index} from "typeorm";

@Entity()
@Index(["token"], {
    unique: true,
})
export class Game {
    @Column({primary: true, type: "text", unique: true, nullable: false})
    public token: string;

    @Column({type: "text"})
    public device: string;

    @Column({type: "text"})
    public status: string;

    @Column({type: "integer"})
    public startedOn: number;

    @Column({type: "simple-array"})
    public deck: string[];

    @Column({type: "simple-array"})
    public dealerCards: string[];

    @Column({type: "simple-array"})
    public playerCards: string[];

    public constructor(token: string, device: string, status:string, startedOn: number, deck: string[] = [],
                       dealerCards: string[] = [], playerCards: string[] = []) {
        this.token = token;
        this.device = device;
        this.status = status;
        this.startedOn = startedOn;
        this.deck = deck;
        this.dealerCards = dealerCards;
        this.playerCards = playerCards;
    }
}

@Entity()
export class Stat {
    @Column({primary: true, type: "text", unique: true, nullable: false})
    public device: string;

    @Column({type: "integer"})
    public wins: number;

    @Column({type: "integer"})
    public loses: number;

    @Column({type: "integer"})
    public draws: number;

    public constructor(device:string, wins: number, loses: number, draws: number) {
        this.device = device;
        this.wins = wins;
        this.loses = loses;
        this.draws = draws;
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ResponseMsg:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: Game token UUID
 *         cards:
 *           type: array
 *           items:
 *             type: string
 *           description:  Players Cards
 *         dealerCards:
 *           type: array
 *           items:
 *             type: string
 *           description: Dealers Cards
 *         handValue:
 *           type: integer
 *           description: Players cards score
 *         dealerValue:
 *           type: integer
 *           description: Dealers cards value
 *         status:
 *           type: string
 *           enum: [playing, Dealer Bust, Player Wins, Dealer Wins, Draw]
 *           description: Game Status
 *
 */
export class ResponseMsg {
    public constructor(public token: string, public cards: string[], public dealerCards: string[],
                       public handValue: number, public dealerValue: number, public status: string) {}
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorMsg:
 *       type: object
 *       required:
 *         - status
 *         - message
 *       properties:
 *         status:
 *           type: integer
 *           description: HTTP Status Number
 *         message:
 *           type: string
 *           description: Descriptive Error Message
 */
export class ErrorMsg {
    public constructor(public status: number, public message: string) {}
}

/**
 * @swagger
 * components:
 *   schemas:
 *     StatsMsg:
 *       type: object
 *       required:
 *         - wins
 *         - loses
 *         - draws
 *       properties:
 *         wins:
 *           type: integer
 *           description: Number of player wins
 *         loses:
 *           type: integer
 *           description: Number of player loses
 *         draws:
 *           type: integer
 *           description: Number of player draws
 */
export class StatsMsg {
    public constructor(public wins:number, public loses:number, public draws:number) {}
}

export enum GameState {
    Win,
    Loss,
    Draw
}