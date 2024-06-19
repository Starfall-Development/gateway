import { ShortlinkConstructorOptions } from "../../../database/entities/shortlink.entity";
import Core from "../../core";
import ApiCommand from "../base/ApiCommand";

export default class Command_CreateShortlink implements ApiCommand<ShortlinkConstructorOptions, {
    success: boolean;
    id: string;
} | {
    success: boolean;
    error: string;
}> {
    async handle(options: ShortlinkConstructorOptions) {
        const shortlink = Core.database.services.shortlink.createShortlink(options);
        await Core.database.em.persistAndFlush(shortlink);
        return { success: true, id: shortlink.id };

    }
}
