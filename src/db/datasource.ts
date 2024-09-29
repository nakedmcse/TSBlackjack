// Datasource
import {DataSource} from "typeorm";
import {Game, Stat} from "../models";

export const dataSource = new DataSource({
    type: "better-sqlite3",
    synchronize: true,
    database: "main.sqlite",
    entities: [Game, Stat]
});