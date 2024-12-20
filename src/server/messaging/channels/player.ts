import Channel from "../channel.js";

/**
 * Channel to handle actions taken by players.
 */
export const PlayerChannel = new Channel<{
    'player:join': { id: number, username: string, displayName: string },
    'player:leave': { id: number },
    'player:acknowledgeWarning': { id: number, warningId: number },
}>('player')