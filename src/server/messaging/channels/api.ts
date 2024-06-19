import Channel from "../channel";

export const ApiChannel = new Channel<{
    [key: string]: any
}>("api", {
    destroyOnEmpty: false,
    recieveOnly: [
        "gateway.CommandManager"
    ]
})
