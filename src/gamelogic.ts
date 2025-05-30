// Game logic functions
import {Game, GameState, ResponseMsg} from "./models";
import {ServiceGame, ServiceStat} from "./services";

export class Gamelogic {
    public static suits = ['\u2660','\u2663','\u2665','\u2666'];
    public static faces = ['2','3','4','5','6','7','8','9','10','A','J','Q','K'];

    private static gameService = new ServiceGame();
    private static statService = new ServiceStat();

    public static createDeck(game: Game): void {
        for(const suit of this.suits) {
            for(const face of this.faces) {
                game.deck.push(face + suit);
            }
        }
        for(let i = 0; i < game.deck.length; i++) {
            const j = Math.floor(Math.random() * game.deck.length);
            [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
        }
    }

    public static deal(game: Game): void {
        game.playerCards.push(game.deck.pop() ?? "");
        game.dealerCards.push(game.deck.pop() ?? "");
        game.playerCards.push(game.deck.pop() ?? "");
        game.dealerCards.push(game.deck.pop() ?? "");
    }

    public static async hit(game: Game, device: string): Promise<ResponseMsg> {
        game.playerCards.push(game.deck.pop() ?? "");

        console.log(`HIT: ${game.token}`);
        if(Gamelogic.value(game.playerCards) > 21) {
            game.status = "Bust";
            console.log("BUST");
        }

        const resp = new ResponseMsg(game.token, game.device, game.playerCards, [],
            this.value(game.playerCards), 0, game.status);
        if(game.status === "Bust") {
            await this.statService.updateStats(device, GameState.Loss);
        }
        await this.gameService.saveGame(game);
        return resp;
    }

    public static async stay(game: Game, device: string): Promise<ResponseMsg> {
        while(this.value(game.dealerCards) < 17) {
            game.dealerCards.push(game.deck.pop() ?? "")
        }

        console.log(`STAY: ${game.token}`);
        const playerVal = this.value(game.playerCards);
        const dealerVal = this.value(game.dealerCards);
        if(dealerVal > 21) {
            game.status = "Dealer Bust";
            console.log("DEALER BUST");
            await this.statService.updateStats(device, GameState.Win);
        }
        else {
            const totalScore = playerVal - dealerVal;
            const gameState = totalScore === 0 ? GameState.Draw : totalScore > 0 ? GameState.Win : GameState.Loss;
            game.status = totalScore === 0 ? "Draw" : totalScore > 0 ? "Player Wins" : "Dealer Wins";
            console.log(game.status.toUpperCase());
            await this.statService.updateStats(device, gameState);
        }

        const resp = new ResponseMsg(game.token, game.device, game.playerCards, game.dealerCards,
            playerVal, dealerVal, game.status);
        await this.gameService.saveGame(game);
        return resp;
    }

    public static value(cards: string[]): number {
        let retval: number = 0;
        let aces: number = 0;
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
                retval += 11;
                aces++;
            }
        }
        while(retval > 21 && aces-- > 0) {
            retval -= 10;
        }
        return retval;
    }
}