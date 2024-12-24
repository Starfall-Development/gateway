import Channel from "../channel.js";

export const LinkingChannel = new Channel<{
    "user:linked": {
        discord: {
            id: string,
            username: string,
        },
        roblox: {
            id: string,
            username: string,
        }
    }
}>('linking');