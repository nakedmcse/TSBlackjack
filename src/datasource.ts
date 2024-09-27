// Datasource
import {DataSource} from "typeorm";
import {game, stat} from "./models";

export const dataSource = new DataSource({
    type: "better-sqlite3",
    synchronize: true,
    database: "main.sqlite",
    entities: [game, stat]
});