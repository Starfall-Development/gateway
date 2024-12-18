import ApiCommand from "../base/ApiCommand.js";
import AuthManager from "../manager/authManager.js";

export default class Command_CreateAuthHandler implements ApiCommand<{
    url: string;
}, {
    identifier?: string;
}> {
    public async handle(options: { id: string; url: string; key: string; }): Promise<{
        identifier: string;
    }> {
        const res = AuthManager.addRedirectHandler(options.url)
        return {
            identifier: res
        }
    }
}
