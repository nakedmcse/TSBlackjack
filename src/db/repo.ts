// Repositories for game, stat
import {game, stat} from "../models";
import {daoGame, daoStat} from "./dao";

export class repoGame {
    private dao: daoGame;

    public constructor() {
        this.dao = new daoGame();
    }

    public async saveEntry(entry: game):Promise<void> {
        await this.dao.saveEntry(entry);
    }

    public async deleteEntry(entry: game):Promise<void> {
        await this.dao.deleteEntry(entry);
    }

    public async getEntryByToken(token: string):Promise<game|null> {
        return await this.dao.getEntryByToken(token);
    }

    public async getEntryByDevice(device: string):Promise<game|null> {
        return await this.dao.getEntryByDevice(device);
    }
}

export class repoStat {
    private dao: daoStat;

    public constructor() {
        this.dao = new daoStat();
    }

    public async saveEntry(entry: stat):Promise<void> {
        await this.dao.saveEntry(entry);
    }

    public async getEntry(device: string):Promise<stat|null> {
        return await this.dao.getEntry(device);
    }
}