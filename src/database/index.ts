import { MikroORM, PostgreSqlDriver, EntityManager } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import Logger from "../utils/logger";
import { DatabaseChannel } from "../server/messaging/channels/database";
import { ShortlinkRepository } from "./repositories/shortlink.repo";
import { Shortlink } from "./entities/shortlink.entity";

let instance: Database;

export default class Database {
  public readonly clientid = "core.database";

  private _orm!: MikroORM;
  private _em!: EntityManager<PostgreSqlDriver>;
  public services!: {
    shortlink: ShortlinkRepository;
  }

  constructor() {
    if (instance) {
      return instance;
    }
    instance = this;
  }

  public async init(): Promise<void> {
    const _orm = await MikroORM.init<PostgreSqlDriver>({
      entities: ["./dist/database/entities/*.js"],
      type: "postgresql",
      tsNode: true,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      dbName: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      metadataProvider: TsMorphMetadataProvider,
      debug: process.env.DEBUG === "true",
    }).catch((err) => {
      Logger.error("Database", "Failed to initialize database");
      Logger.error("Database", err);
      console.error(err);
      process.exit(1);
    });

    this._orm = _orm;
    this._em = _orm.em;

    this.services = {
      shortlink: this.em.getRepository(Shortlink),
    }

    Logger.info("Database", "Database initialized");
    DatabaseChannel.publish(this.clientid, "database:initialized", {
      message: "Database initialized",
    });

  }

  public async close(): Promise<void> {
    await this._orm.close(true);
  }

  public get em(): EntityManager<PostgreSqlDriver> {
    if (!this._em) {
      DatabaseChannel.publish(this.clientid, "database:error", { error: "Database not initialized" });
      throw new Error("Database not initialized");
    }
    return this._em.fork();
  }

  public get orm(): MikroORM {
    return this._orm;
  }
}