import ApiCommand from "../base/ApiCommand";
import User from "../../../database/entities/user.entity";
import UserAccessToken from "../../../database/entities/userAccessToken.entity";
import Core from "../../core";

export default class Command_GetUserData implements ApiCommand<{
    token: string;
}, {
    success: boolean;
    data?: {
        username: string;
        dislayName: string;
        createdAt: string;
    },
    token?: {
        expiresAt: string;
        refreshToken: string;
    },
    error?: string;
}> {
    async handle(options: { token: string; }) {
        const accessTokenRepo = Core.database.em.getRepository(UserAccessToken);
        const userRepo = Core.database.em.getRepository(User);

        const token = await accessTokenRepo.findOne({
            token: options.token
        });

        if (!token || token.expiresAt < new Date()) {
            return { success: false, error: "Invalid token" };
        }

        const user = await userRepo.findOne({
            username: token.username
        });

        if (!user) {
            return { success: false, error: "Invalid user" };
        }
        return {
            success: true,
            data: {
                username: user.username,
                dislayName: user.displayName,
                createdAt: user.createdAt.toISOString()
            },
            token: {
                expiresAt: token.expiresAt.toISOString(),
                refreshToken: token.refreshToken
            }
        };
    }
}
