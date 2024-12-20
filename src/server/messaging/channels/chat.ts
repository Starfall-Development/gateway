import Channel from "../channel.js";

/**
 * Channel for chat messages.
 */
export const ChatChannel = new Channel<{
    'chat:message': { playerId: number, message: string, channel: string, x: number, y: number, z: number },
    'chat:directMessage': { playerId: number, recipientId: number, message: string, x: number, y: number, z: number },
    'chat:systemMessage': { message: string },
}>("chat")