import AuthToken from "../../../database/entities/authToken.entity.js";
import Core from "../../core.js";
import { AuthChannel, AuthFailReason } from "../../messaging/channels/auth.js";
import ClientManager from "./clientManager.js";

export default class AuthManager {
    public static readonly clientId = "gateway.AuthManager";

    public static init() {
        AuthChannel.subscribeToEvent(this.clientId, "auth:login", async (_, data) => {

            // logins won't happen *that* often and are completely async anyway,
            // so we don't need to worry about this being slow
            const authToken = await Core.database.services.authToken.findOne({ token: data.token });

            if (!authToken) {
                AuthChannel.publishToClient(this.clientId, data.sender, "auth:fail", {
                    message: "Invalid token",
                    reason: AuthFailReason.InvalidToken
                })
                return;
            }

            ClientManager.setClientMeta(data.sender, {
                name: data.name,
                tokenType: authToken.name,
            })

            AuthChannel.publishToClient(this.clientId, data.sender, "auth:success", {
                mesasge: "Authenticated"
            })
        })

    }
}
