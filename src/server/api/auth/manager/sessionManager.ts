import Session from "../../../../database/entities/session.entity.js";
import User from "../../../../database/entities/user.entity.js";
import Core from "../../../core.js";

const sessionExpire = 604800000;

export default class SessionManager {
    public static async genSession(user: User, userAgent: string): Promise<Session> {
        const session = new Session();
        session.user = user;
        session.userAgent = userAgent;

        await Core.database.em.persistAndFlush(session);

        return session;
    }

    public static async checkSession(session: string, userAgent?: string): Promise<Session | undefined> {
        this.checkSessionExpire();

        // check if session exists
        const validSession = await Core.database.em.findOne(Session, {
            id: session,
        }, {
            populate: ["user", "user.auth"],
        });

        if (validSession) {

            if (userAgent && validSession.userAgent !== userAgent) {
                return undefined;
            }

            // Update the session
            validSession.lastUsed = new Date();
            await Core.database.em.persistAndFlush(validSession);
            return validSession;
        }



        return undefined;
    }

    public static async deleteSession(session: string): Promise<void> {
        await Core.database.em.nativeDelete(Session, {
            id: session,
        });
    }

    public static async touchSession(session: Session): Promise<void> {
        session.lastUsed = new Date();
        await Core.database.em.persistAndFlush(session);
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