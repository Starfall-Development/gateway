import ApiCommand from "../base/ApiCommand.js";
import AuthManager from "../manager/authManager.js";

export default class Command_CreateAuthHandler implements ApiCommand<{
    id: string;
    url: string;
    key: string;
}, {
    success: boolean;
    identifier?: string;
    message?: string;
}> {
    public async handle(options: { id: string; url: string; key: string; }): Promise<{
        success: boolean;
        identifier: string;
        message: string;
    }> {
        const res = AuthManager.addNamedRedirectHandler(options.id, options.key, options.url)
        return {
            success: res.success,
            identifier: options.id,
            message: res.message
        }
    }
}
