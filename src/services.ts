// Services for Game and Stat
import {RepoGame, RepoStat} from "./db/repo";
import {Game, GameState, Stat} from "./models";

export class ServiceGame {
    private repo: RepoGame = new RepoGame();

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

    public async getActiveGame(device: string, token: string): Promise<Game|null> {
        return token === "" ? await this.getDevice(device) : await this.getToken(token);
    }
}

export class ServiceStat {
    private repo: RepoStat = new RepoStat();

    public async saveStat(stat: Stat): Promise<void> {
        await this.repo.saveEntry(stat);
    }

    public async getStat(device: string): Promise<Stat|null> {
        return await this.repo.getEntry(device);
    }

    public async updateStats(device: string, action: GameState): Promise<void> {
        let userStats = await this.getStat(device);
        if (!userStats) {
            userStats = new Stat(device,0,0,0);
        }
        switch(action) {
            case GameState.Win:
                userStats.wins++;
                break;
            case GameState.Loss:
                userStats.loses++;
                break;
            case GameState.Draw:
                userStats.draws++;
                break;
        }
        await this.saveStat(userStats);
    }
}