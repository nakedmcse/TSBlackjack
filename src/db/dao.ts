// DAO for objects
import {dataSource} from "./datasource";
import {Game, Stat} from "../models";
import {ObjectLiteral, Repository} from "typeorm";

export class AbstractDao {
    public getRepo<T extends ObjectLiteral>(target: string): Repository<T> {
        return dataSource.getRepository<T>(target);
    }
}

export class DaoGame extends AbstractDao{
    public async saveEntry(entry: Game): Promise<void> {
        await this.getRepo<Game>("game").save(entry);
    }

    public async deleteEntry(entry: Game): Promise<void> {
        await this.getRepo<Game>("game").remove(entry);
    }

    public async getEntryByToken(token: string):Promise<Game|null> {
        return await this.getRepo<Game>("game").findOneBy({ token: token, status: "playing" });
    }

    public async getEntryByDevice(device: string):Promise<Game|null> {
        return await this.getRepo<Game>("game").findOneBy({ device: device, status: "playing" });
    }
}

export class DaoStat extends AbstractDao{
    public async saveEntry(entry: Stat):Promise<void> {
        await this.getRepo<Stat>("stat").save(entry);
    }

    public async getEntry(device: string):Promise<Stat|null> {
        return await this.getRepo<Stat>("stat").findOneBy({device: device});
    }
}