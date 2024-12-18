import ApiCommand from "../base/ApiCommand.js";
import User from "../../../database/entities/user.entity.js";
import UserAccessToken from "../../../database/entities/userAccessToken.entity.js";
import Core from "../../core.js";

export default class Command_GetUserData implements ApiCommand<{
    token: string;
    key?: string;
}, {
    success: boolean;
    data?: {
        id: string;
        dislayName: string;
        avatar?: string;
        createdAt: string;
    },
    token?: {
        expiresAt: string;
        refreshToken: string;
    },
    error?: string;
}> {
    async handle(options: { token: string; key?: string; }) {
        const accessTokenRepo = Core.database.em.getRepository(UserAccessToken);
        const userRepo = Core.database.em.getRepository(User);

        const token = await accessTokenRepo.findOne({
            token: options.token
        }, {
            populate: ["user"]
        });

        if (!token || token.expiresAt < new Date()) {
            return { success: false, error: "Invalid token" };
        }

        if (options.key && token.key !== options.key) {
            return { success: false, error: "Invalid key" };
        }

        const user = await userRepo.findOne({
            id: token.user.id
        });

        if (!token.key) {
            // Delete one-time token
            Core.database.em.removeAndFlush(token);
        }

        if (!user) {
            return { success: false, error: "Invalid user" };
        }

        return {
            success: true,
            data: {
                id: user.id,
                dislayName: user.displayName,
                avatar: user.avatarUrl,
                createdAt: user.createdAt.toISOString()
            },
            token: {
                expiresAt: token.expiresAt.toISOString(),
                refreshToken: token.refreshToken
            }
        };
    }
}
