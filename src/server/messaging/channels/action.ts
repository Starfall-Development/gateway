import Channel from "../channel.js";

/**
 * Channel for actions that can be taken by moderators.
 */
export const ActionChannel = new Channel<{
    "action:mute": { playerId: number, moderatorId: number, timeSeconds: number, reason: string },
    "action:unmute": { playerId: number, moderatorId: number },
    "action:kick": { playerId: number, moderatorId: number, reason: string },
    "action:ban": { playerId: number, moderatorId: number, reason: string },
    "action:unban": { playerId: number, moderatorId: number },
    "action:warn": { playerId: number, moderatorId: number, reason: string },
    "action:teleport": { playerId: number, moderatorId: number, x: number, y: number, z: number },
    "action:spectate": { playerId: number, moderatorId: number },

    // potentially more actions

}>('action')
