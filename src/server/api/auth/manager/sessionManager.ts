import Session from "../../../../database/entities/session.entity.js";
import User from "../../../../database/entities/user.entity.js";
import { ms } from "../../../../utils/time.js";
import Core from "../../../core.js";

const sessionExpire = ms("1 week")
const sessionTouch = ms("5 minutes")

export default class SessionManager {

    public static cache: Map<string, Session> = new Map();
    public static touchCache: Map<string, NodeJS.Timeout> = new Map();

    public static async genSession(user: User, userAgent: string): Promise<Session> {
        const session = new Session();
        session.user = user;
        session.userAgent = userAgent;

        await Core.database.em.persistAndFlush(session);
        this.cache.set(session.id, session);

        return session;
    }

    public static async checkSession(session: string, userAgent?: string): Promise<Session | undefined> {

        // check if session is in cache
        if (this.cache.has(session)) {
            const cachedSession = this.cache.get(session)!;

            if (userAgent && cachedSession.userAgent !== userAgent) {
                return undefined;
            }

            this.touchSession(cachedSession);
            return cachedSession;
        }

        // check if session exists
        const validSession = await Core.database.em.findOne(Session, {
            id: session,
        }, {
            populate: ["user", "user.auth"],
        });

        if (validSession) {

            // Add to cache
            this.cache.set(validSession.id, validSession);

            if (userAgent && validSession.userAgent !== userAgent) {
                return undefined;
            }

            // Update the session
            validSession.lastUsed = new Date();

            // no need to await
            Core.database.em.persistAndFlush(validSession);
            return validSession;
        }

        return undefined;
    }

    public static async deleteSession(session: string): Promise<void> {
        await Core.database.em.nativeDelete(Session, {
            id: session,
        });

        this.cache.delete(session);
    }

    public static async touchSession(session: Session): Promise<void> {
        session.lastUsed = new Date();
        this.cache.set(session.id, session);

        if (this.touchCache.has(session.id)) {
            clearTimeout(this.touchCache.get(session.id)!);
        }

        this.touchCache.set(session.id, setTimeout(async () => {
            this.touchCache.delete(session.id);
            await Core.database.em.persistAndFlush(session);
        }, sessionTouch));
    }

    public static async checkSessionExpire(): Promise<void> {
        if (!Core.database.em) return;
        const sessions = await Core.database.em.find(Session, {
            lastUsed: {
                $lt: new Date(Date.now() - sessionExpire),
            },
        })

        await Core.database.em.removeAndFlush(sessions);
    }
}
