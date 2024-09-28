// Game logic functions
import {game} from "./models";

export class gamelogic {
    public static suits = ['\u2660','\u2663','\u2665','\u2666'];
    public static faces = ['2','3','4','5','6','7','8','9','10','A','J','Q','K'];

    public static createDeck(Game: game): void {
        for(const suit of this.suits) {
            for(const face of this.faces) {
                Game.deck.push(face + suit);
            }
        }
        for(let i = 0; i < Game.deck.length; i++) {
            const j = Math.floor(Math.random() * Game.deck.length);
            const origCard = Game.deck[i];
            Game.deck[i] = Game.deck[j];
            Game.deck[j] = origCard;
        }
    }

    public static deal(Game: game): void {
        Game.playerCards.push(Game.deck.pop() ?? "");
        Game.dealerCards.push(Game.deck.pop() ?? "");
        Game.playerCards.push(Game.deck.pop() ?? "");
        Game.dealerCards.push(Game.deck.pop() ?? "");
    }

    public static hit(Game: game): void {
        Game.playerCards.push(Game.deck.pop() ?? "");
    }

    public static stay(Game: game): void {
        while(this.value(Game.dealerCards) < 17) {
            Game.dealerCards.push(Game.deck.pop() ?? "")
        }
    }

    public static value(cards: string[]): number {
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