import { RedirectAuthHandler } from "../../types/auth";
import GitHubOAuthProvider from "../auth/provider/githubOAuthProvider";

export default class AuthManager {
    private static _authHandlers: Map<string, RedirectAuthHandler> = new Map();
    public static authProviders = {
        github: new GitHubOAuthProvider()
    }

    public static addRedirectHandler(url: string) {
        const identifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this._authHandlers.set(identifier, { type: "redirect", oneTimeUse: true, url });
        return identifier;
    }

    public static addNamedRedirectHandler(identifier: string, key: string, url: string) {
        if (this._authHandlers.has(identifier)) {
            const handler = this._authHandlers.get(identifier);
            if (handler?.key && handler.key === key) {
                this._authHandlers.set(identifier, { type: "redirect", url });
            } else {
                return {
                    success: false,
                    message: "Incorrect key"
                }
            }

            return {
                success: true,
                message: "Handler updated"
            }
        } else {
            this._authHandlers.set(identifier, { type: "redirect", url, key });

            return {
                success: true,
                message: "Handler added"
            }
        }
    }
    public static getHandler(identifier: string) {
        return this._authHandlers.get(identifier);
    }
}
