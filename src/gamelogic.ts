// Game logic functions
import {Game} from "./models";

export class Gamelogic {
    public static suits = ['\u2660','\u2663','\u2665','\u2666'];
    public static faces = ['2','3','4','5','6','7','8','9','10','A','J','Q','K'];

    public static createDeck(game: Game): void {
        for(const suit of this.suits) {
            for(const face of this.faces) {
                game.deck.push(face + suit);
            }
        }
        for(let i = 0; i < game.deck.length; i++) {
            const j = Math.floor(Math.random() * game.deck.length);
            const origCard = game.deck[i];
            game.deck[i] = game.deck[j];
            game.deck[j] = origCard;
        }
    }

    public static deal(game: Game): void {
        game.playerCards.push(game.deck.pop() ?? "");
        game.dealerCards.push(game.deck.pop() ?? "");
        game.playerCards.push(game.deck.pop() ?? "");
        game.dealerCards.push(game.deck.pop() ?? "");
    }

    public static hit(game: Game): void {
        game.playerCards.push(game.deck.pop() ?? "");
    }

    public static stay(game: Game): void {
        while(this.value(game.dealerCards) < 17) {
            game.dealerCards.push(game.deck.pop() ?? "")
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