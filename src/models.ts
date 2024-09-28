// Models for blackjack API
import {Column, Entity, Index} from "typeorm";

@Entity()
@Index(["token"], {
    unique: true,
})
export class game {
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
export class stat {
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

export class responseMsg {
    public constructor(public token: string, public cards: string[], public dealerCards: string[],
                       public handValue: number, public dealerValue: number, public status: string) {}
}

export class errorMsg {
    public constructor(public status: number, public message: string) {}
}