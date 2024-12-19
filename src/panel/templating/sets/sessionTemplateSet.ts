import Session from "../../../database/entities/session.entity.js";
import TemplateSet from "../templateSet.js";

export default class SessionTemplateSet extends TemplateSet {
    public defaults: Map<string, string> = new Map([
        ["session.user.avatarUrl", "/assets/default-avatar.png"],
    ]);
    constructor(input?: Session) {
        super(`session${input?.id || 'invalid'}`, 0);

        if (!input) return;

        this.set("session.id", input.id);
        this.set("session.userAgent", input.userAgent);
        this.set("session.lastUsed", input.lastUsed.toISOString());

        this.set("session.user.id", input.user.id);
        this.set("session.user.displayName", input.user.displayName);
        this.set("session.user.avatarUrl", input.user.avatarUrl);
    }
}
