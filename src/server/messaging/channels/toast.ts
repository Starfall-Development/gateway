import Channel from "../channel.js";

export const ToastChannel = new Channel<{
    "toast:broadcast": { message: string, type: string },
    "toast:send": { playerId: number, message: string, type: string },
    "toast:showModerators": { message: string, type: string },
    "toast:showAdmins": { message: string, type: string },
}>("toast")
