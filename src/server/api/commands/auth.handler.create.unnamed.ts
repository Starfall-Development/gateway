import ApiCommand from "../base/ApiCommand.js";
import AuthManager from "../manager/authManager.js";

export default class Command_CreateAuthHandler implements ApiCommand<{
    url: string;
    skipTokenCreation?: boolean;
}, {
    identifier?: string;
}> {
    public async handle(options: { url: string; skipTokenCreation?: boolean }): Promise<{
        identifier: string;
    }> {
        const res = AuthManager.addRedirectHandler(options.url, options.skipTokenCreation)
        return {
            identifier: res
        }
    }
}
