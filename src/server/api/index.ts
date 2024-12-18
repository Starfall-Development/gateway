import { readdirSync } from "fs";
import { resolve } from "path";
import ApiCommand from "./base/ApiCommand.js";
import { Logger } from "../../utils/logger.js";
import { ApiChannel } from "../messaging/channels/api.js";

export default class CommandManager {

    public static readonly commandFolder = "dist/server/api/commands/"
    public static readonly clientId = "gateway.CommandManager";
    public static readonly logger = Logger.create("CommandManager");

    public static commands: Record<string, ApiCommand> = {};
    public static async init() {
        const commandFiles = readdirSync(resolve(this.commandFolder)).filter(file => file.endsWith(".js"));

        await Promise.all(commandFiles.map(async file => {
            const command = (await import(resolve(this.commandFolder, file))).default
            const commandName = file.split(".").slice(0, -1).join(".");
            this.commands[commandName] = new command() as ApiCommand;
            this.logger.info(`Registered command ${commandName}`);
        }));

        this.logger.info(`Loaded ${commandFiles.length} commands.`);

        ApiChannel.subscribe(this.clientId, async (channel, event, data) => {
            return await this.execute(event.toString(), data);
        })
    }

    public static async execute(commandName: string, options: { [key: string]: any }) {
        const command = this.commands[commandName];
        const now = Date.now();

        if (command) {
            const result = await command.handle(options);
            const took = Date.now() - now;
            return {
                success: true,
                took,
                ...result,
            }
        } else {
            return {
                success: false,
                message: "Command not found",
                command: commandName,
                options
            }
        }
    }
}
