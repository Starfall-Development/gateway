import Client from "../impl/base/baseClient";
import { InternalChannel } from "../../messaging/channels/internal";
import { SubscriberChannel } from "../../messaging/channels/subscriber";
import { AuthChannel } from "../../messaging/channels/auth";
import { PingChannel } from "../../messaging/channels/ping";
import Id from "../../../utils/id";

export default class ClientManager {
    public static readonly clientId = "gateway.ClientManager";
    public static clients = new Map<string, Client>();

    public static init() {

        InternalChannel.subscribeToEvent(this.clientId, "client:disconnect", (channel, client) => {
            this.clients.delete(client.id);
        })

        SubscriberChannel.registerCallback(this.clientId, "channel:subscribe", (data) => {
            let client = this.clients.get(data.sender);

            if (client) {
                if (client.subscribe(data.channel, { key: data.key })) {
                    return {
                        success: true,
                        channel: data.channel,
                    }
                } else return {
                    success: false,
                    channel: data.channel,
                    message: "Incorrect key"
                }
            } else return {
                success: false,
                channel: data.channel,
                message: "Client not found"
            }
        })

        SubscriberChannel.registerCallback(this.clientId, "channel:unsubscribe", (data) => {
            let client = this.clients.get(data.sender);

            if (client) {
                client.unsubscribe(data.channel);
            } else return {
                success: false,
                channel: data.channel,
                message: "Client not found"
            }

            return {
                success: true,
                channel: data.channel,
            }
        })

        PingChannel.registerCallback(this.clientId, "ping", (data) => {
            return {
                message: data.message
            }
        })

    }

    public static register(client: Client) {
        this.clients.set(client.id, client);
        InternalChannel.publish(this.clientId, "client:connect", {
            id: client.id,
            type: client.type
        });

        client.subscribe("subscriber")
        client.subscribe("auth")
        client.subscribe("ping")

        AuthChannel.publishToClient(this.clientId, client.id, "auth:init", {
            clientId: client.id,
            token: "test"
        })
    }

    public static unregister(client: Client) {
        InternalChannel.publish(this.clientId, "client:disconnect", {
            id: client.id,
            type: client.type
        });
    }

    public static newClientId() {
        return `${Id.get()}-${this.clients.size}`;
    }

}