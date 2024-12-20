import Channel from "../channel.js";

/**
 * Channel for handling database initialization and errors.
 */
export const DatabaseChannel = new Channel<{
    "database:initialized": {},
    "database:error": { error: string }
}>("database", {
    destroyOnEmpty: false
})