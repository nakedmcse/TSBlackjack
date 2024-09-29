// DAO for objects
import {dataSource} from "./datasource";
import {game, stat} from "../models";
import {ObjectLiteral, Repository} from "typeorm";

export class abstractDao {
    public getRepo<T extends ObjectLiteral>(target: string): Repository<T> {
        return dataSource.getRepository<T>(target);
    }
}

export class daoGame extends abstractDao{
    public async saveEntry(entry: game): Promise<void> {
        await this.getRepo<game>("game").save(entry);
    }

    public async deleteEntry(entry: game): Promise<void> {
        await this.getRepo<game>("game").remove(entry);
    }

    public async getEntryByToken(token: string):Promise<game|null> {
        return await this.getRepo<game>("game").findOneBy({ token: token });
    }

    public async getEntryByDevice(device: string):Promise<game|null> {
        return await this.getRepo<game>("game").findOneBy({ device: device });
    }
}

export class daoStat extends abstractDao{
    public async saveEntry(entry: stat):Promise<void> {
        await this.getRepo<stat>("stat").save(entry);
    }

    public async getEntry(device: string):Promise<stat|null> {
        return await this.getRepo<stat>("stat").findOneBy({device: device});
    }
}