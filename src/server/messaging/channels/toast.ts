import Channel from "../channel.js";

export const ToastChannel = new Channel<{
    "toast:broadcast": { title: string, description: string, type: ToastType },
    "toast:send": { playerId: number, title: string, description: string, type: ToastType },
    "toast:showModerators": { title: string, description: string, type: ToastType },
    "toast:showAdmins": { title: string, description: string, type: ToastType },
}>("toast")

export enum ToastType {
    Success = "success",
    Info = "info",
    Warning = "warning",
    Error = "error"
}