import CallbackChannel from "../callbackChannel.js";

/**
 * Channel for calculating server latency and connection status.
 */
export const PingChannel = new CallbackChannel<{
    'ping': {
        request: {
            message: string
        },
        response: {
            message: string
        }
    }
}>("ping", {
    destroyOnEmpty: false,
    isPublic: true,
    recieveOnly: [
        "gateway.ClientManager"
    ]
})