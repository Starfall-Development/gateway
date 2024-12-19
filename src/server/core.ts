import TCP from "./api/impl/tcp/index.js";
import HTTP from "./api/impl/http/index.js";
import Socket from "./api/impl/socket/index.js";
import { Logger } from "../utils/logger.js";
import ClientManager from "./api/manager/clientManager.js";
import CommandManager from "./api/index.js";
import Database from "../database/index.js";
import Polling from "./api/impl/polling/index.js";

export default class Core {
    public static readonly clientId = "gateway.core";
    private static logger = Logger.create("Core");

    public static tcp = new TCP(parseInt(process.env.TCP_PORT || "1337"));
    public static http = new HTTP(parseInt(process.env.HTTP_PORT || "3000"), process.env.HTTP_HOST);
    public static socket = new Socket(this.http);
    public static polling = new Polling(this.http.app);
    public static database = new Database();

    public static readonly BASE_URL = process.env.BASE_URL || `http://${process.env.HTTP_HOST || "localhost"}:${process.env.HTTP_PORT || "3000"}`;
    public static readonly SOCKET_URL = process.env.SOCKET_URL || `ws://${process.env.HTTP_HOST || "localhost"}:${process.env.HTTP_PORT || "3000"}`;

    public static readonly VERSION = process.env.npm_package_version || "0.0.0";

    public static start() {

        Core.logger.info("Starting servers...");

        this.tcp.start();
        this.http.start();
        this.socket.start();
        this.polling.start();

        ClientManager.init()
        CommandManager.init();
        this.database.init();

        Core.logger.info("Servers started.");
    }

    public static stop() {

        Core.logger.info("Stopping servers...");

        this.tcp.stop();
        this.http.stop();
        this.socket.stop();
        this.polling.stop();

        Core.logger.info("Servers stopped.");
    }

    public static restart() {
        this.stop();
        this.start();
    }

    public static get status() {
        return {
            tcp: this.tcp.status(),
            http: this.http.status(),
            socket: this.socket.status(),
            polling: this.polling.status(),
        }
    }
}
