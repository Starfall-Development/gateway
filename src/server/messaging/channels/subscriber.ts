import CallbackChannel from "../callbackChannel.js";

/**
 * Channel to handle client subscribing/unsubscribing to other channels. All clients are automatically subscribed to this channel.
 */
export const SubscriberChannel = new CallbackChannel<{
    "channel:subscribe": {
        request: {
            channel: string,
            key?: string
        },
        response: {
            success: boolean,
            channel: string,
            error?: string
        }
    },
    "channel:unsubscribe": {
        request: {
            channel: string,
        },
        response: {
            success: boolean,
            channel: string,
            error?: string
        }
    },
}>("subscriber", {
    destroyOnEmpty: false,
    isPublic: false,
    recieveOnly: [
        "gateway.ClientManager"
    ]
})
