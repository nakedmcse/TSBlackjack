// Repositories for game, stat
import {Game, Stat} from "../models";
import {DaoGame, DaoStat} from "./dao";

export class RepoGame {
    private dao: DaoGame;

    public constructor() {
        this.dao = new DaoGame();
    }

    public async saveEntry(entry: Game):Promise<void> {
        await this.dao.saveEntry(entry);
    }

    public async deleteEntry(entry: Game):Promise<void> {
        await this.dao.deleteEntry(entry);
    }

    public async getEntryByToken(token: string):Promise<Game|null> {
        return await this.dao.getEntryByToken(token);
    }

    public async getEntryByDevice(device: string):Promise<Game|null> {
        return await this.dao.getEntryByDevice(device);
    }
}

export class RepoStat {
    private dao: DaoStat;

    public constructor() {
        this.dao = new DaoStat();
    }

    public async saveEntry(entry: Stat):Promise<void> {
        await this.dao.saveEntry(entry);
    }

    public async getEntry(device: string):Promise<Stat|null> {
        return await this.dao.getEntry(device);
    }
}