import Core from "../../core";
import ApiCommand from "../base/ApiCommand";

export default class Command_GetServerStatus implements ApiCommand<{
    servers?: string[]
}, {
    [key: string]: "listening" | "closed"
}> {
    async handle(options: { [key: string]: any }) {
        const serverStatus = Core.status;
        const filteredStatus = options.servers ? Object.keys(serverStatus).filter(server => options.servers.includes(server)) : Object.keys(serverStatus);
        return filteredStatus.reduce((acc, server) => {
            acc[server] = (serverStatus as { [key: string]: "listening" | "closed" })[server];
            return acc;
        }, {} as { [key: string]: "listening" | "closed" });
    }
}
