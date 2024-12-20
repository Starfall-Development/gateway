import Channel from "../channel.js";

/**
 * Channel for handling authentication over pubsub.
 */
export const AuthChannel = new Channel<{
    "auth:init": { clientId: string, token: string },
    "auth:success": { clientId: string },
    "auth:fail": { clientId: string, error: string }
}>("auth", {
    destroyOnEmpty: false,
    isPublic: false,
    recieveOnly: [
        "gateway.ClientManager"
    ]
})
