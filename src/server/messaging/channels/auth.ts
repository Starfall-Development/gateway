import Channel from "../channel.js";

/**
 * Channel for handling authentication over pubsub.
 */
export const AuthChannel = new Channel<{
    "auth:init": { clientId: string },
    "auth:login": { name: string, token: string },
    "auth:success": { mesasge?: string },
    "auth:fail": { message: string, reason: AuthFailReason }
}>("auth", {
    destroyOnEmpty: false,
    isPublic: false,
    recieveOnly: [
        "gateway.ClientManager"
    ]
})

export enum AuthFailReason {
    InvalidToken
}