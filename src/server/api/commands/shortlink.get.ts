import { Shortlink } from "../../../database/entities/shortlink.entity";
import Core from "../../core";
import ApiCommand from "../base/ApiCommand";

export default class Command_CreateShortlink implements ApiCommand<{
    id: string;
}, {
    success: boolean, link: Shortlink & {
        fullUrl: string;
    }
} | {
    success: boolean;
    error: string;
}> {
    async handle(options: { id: string }) {

        const shortlink = await Core.database.services.shortlink.findOne({ id: options.id });

        if (!shortlink) {
            return { success: false, error: "Shortlink not found" };
        }

        return {
            success: true, link: {
                ...(shortlink as any), // fixes typing error
                fullUrl: `${process.env.BASE_URL || `http://localhost:${process.env.HTTP_PORT}`}/l/${shortlink.id}`
            }
        }

    }
}
