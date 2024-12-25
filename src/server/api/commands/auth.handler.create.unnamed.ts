import ApiCommand from "../base/ApiCommand.js";
import OAuthManager from "../manager/oAuthManager.js";

export default class Command_CreateAuthHandler implements ApiCommand<{
    url: string;
    skipTokenCreation?: boolean;
}, {
    identifier?: string;
}> {
    public async handle(options: { url: string; skipTokenCreation?: boolean }): Promise<{
        identifier: string;
    }> {
        const res = OAuthManager.addRedirectHandler(options.url, options.skipTokenCreation)
        return {
            identifier: res
        }
    }
}
