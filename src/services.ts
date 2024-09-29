// Services for Game and Stat
import {RepoGame, RepoStat} from "./db/repo";
import {Game, Stat} from "./models";

export class ServiceGame {
    private repo: RepoGame;

    public constructor() {
        this.repo = new RepoGame();
    }

    public async saveGame(game: Game): Promise<void> {
        await this.repo.saveEntry(game);
    }

    public async deleteGame(game: Game): Promise<void> {
        await this.repo.deleteEntry(game);
    }

    public async getToken(token: string): Promise<Game|null> {
        return await this.repo.getEntryByToken(token);
    }

    public async getDevice(device: string): Promise<Game|null> {
        return await this.repo.getEntryByDevice(device);
    }
}

export class ServiceStat {
    private repo: RepoStat;

    public constructor() {
        this.repo = new RepoStat();
    }

    public async saveStat(stat: Stat): Promise<void> {
        await this.repo.saveEntry(stat);
    }

    public async getStat(device: string): Promise<Stat|null> {
        return await this.repo.getEntry(device);
    }
}