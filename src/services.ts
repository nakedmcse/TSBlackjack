// Services for Game and Stat
import {repoGame, repoStat} from "./db/repo";
import {game, stat} from "./models";

export class serviceGame {
    private repo: repoGame;

    public constructor() {
        this.repo = new repoGame();
    }

    public async saveGame(Game: game): Promise<void> {
        await this.repo.saveEntry(Game);
    }

    public async deleteGame(Game: game): Promise<void> {
        await this.repo.deleteEntry(Game);
    }

    public async getToken(token: string): Promise<game|null> {
        return await this.repo.getEntryByToken(token);
    }

    public async getDevice(device: string): Promise<game|null> {
        return await this.repo.getEntryByDevice(device);
    }
}

export class serviceStat {
    private repo: repoStat;

    public constructor() {
        this.repo = new repoStat();
    }

    public async saveStat(Stat: stat): Promise<void> {
        await this.repo.saveEntry(Stat);
    }

    public async getStat(device: string): Promise<stat|null> {
        return await this.repo.getEntry(device);
    }
}