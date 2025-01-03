import http from "http";
import express, { Router } from "express";
import { Logger } from "../../../../utils/logger.js";
import BaseServerImpl from "../base/baseServerImpl.js";
import { InternalChannel } from "../../../messaging/channels/internal.js";
import router from "./router.js";
import cookieParser from "cookie-parser";

export default class HTTP implements BaseServerImpl {
    public readonly type = "http";
    public readonly clientId = `gateway.server.${this.type}`;

    public app = express();
    public server = http.createServer(this.app);
    private port: number = 3000;
    private host: string = "localhost";
    private logger = Logger.create("HTTP");

    constructor(port: number = 3000, host: string = "localhost") {
        this.port = port;
        this.host = host;
    }

    public start() {
        this.server.listen(this.port, this.host, () => {
            this.logger.log(`HTTP server listening on port ${this.port}.`);
            InternalChannel.publish(this.clientId, "server:started", { type: this.type, port: this.port });
        });

        this.server.on("error", (error) => {
            this.logger.error(error);
            InternalChannel.publish(this.clientId, "server:error", { type: this.type, error });
        })

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(router)

        this.app.set("json spaces", 2);
        this.app.disable("x-powered-by");
    }

    public stop() {
        this.server.close();
        InternalChannel.publish(this.clientId, "server:stopped", { type: this.type });
    }

    public status(): "listening" | "closed" {
        return this.server.listening ? "listening" : "closed";
    }

    public registerRootRouter(path: string, newRouter: Router) {
        router.use(path, newRouter);
        this.logger.log(`Registered new router at ${path}`);
    }
}
