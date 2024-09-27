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

    static suits = ['\u2660','\u2663','\u2665','\u2666'];
    static faces = ['2','3','4','5','6','7','8','9','10','A','J','Q','K'];

    public createDeck(): void {
        for(const suit of game.suits) {
            for(const face of game.faces) {
                this.deck.push(face + suit);
            }
        }
        for(let i = 0; i < this.deck.length; i++) {
            const j = Math.floor(Math.random() * this.deck.length);
            const origCard = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = origCard;
        }
    }

    public deal(): void {
        this.playerCards.push(this.deck.pop() ?? "");
        this.playerCards.push(this.deck.pop() ?? "");
        this.dealerCards.push(this.deck.pop() ?? "");
        this.dealerCards.push(this.deck.pop() ?? "");
    }

    public hit(): void {
        this.playerCards.push(this.deck.pop() ?? "");
    }

    public stay(): void {
        while(this.value(this.dealerCards) < 17) {
            this.dealerCards.push(this.deck.pop() ?? "")
        }
    }

    public value(cards: string[]): number {
        let retval: number = 0;
        let hasAce: boolean = false
        for(const card of cards) {
            const intVal = parseInt(card,10);
            if(!isNaN(intVal)) {
                retval += intVal
                continue;
            }
            if(card.includes("J") || card.includes("Q") || card.includes("K")) {
                retval += 10;
                continue;
            }
            if(card.includes("A")) {
                hasAce = true;
            }
        }
        if(hasAce) {
            for(const card of cards.filter(x => x.includes("A"))) {
                retval += (retval + 11 > 21) ? 1 : 11;
            }
        }
        return retval;
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