import { Router } from 'express';
import AuthManager from '../../../manager/authManager.js';
import SessionManager from '../../../auth/manager/sessionManager.js';
import { AuthTypeNames } from '../../../../../database/entities/userAuth.entity.js';
const authRouter = Router();

authRouter.get('/status', async (req, res) => {

    const session = await SessionManager.checkSession(req.cookies?.session, req.headers["user-agent"] as string)

    if (!session) {
        res.status(401).send("Unauthorized")
        return;
    }

    const providers = session.user.auth.getItems()

    const sessions = session.user.sessions

    if (!sessions.isInitialized()) {
        await sessions.init()
    }

    res.json({
        user: {
            id: session.user.id,
            username: session.user.displayName,
            avatar: session.user.avatarUrl
        },
        providers: providers.map(provider => ({
            type: AuthTypeNames[provider.type],
            id: provider.authId,
        })),
        currentSession: session.id,
        sessions: sessions.getItems().map(s => ({
            userAgent: s.userAgent,
            lastUsed: s.lastUsed,
            current: s.id === session.id
        }))

    })

})

authRouter.get('/logout', async (req, res) => {
    await SessionManager.deleteSession(req.cookies?.session)

    res.clearCookie("session")
    res.redirect("back")
})

authRouter.get('/:provider/me', async (req, res) => {
    const provider = AuthManager.getProvider(req.params.provider as keyof typeof AuthManager["authProviders"])

    if (!provider) {
        res.status(404).send("Provider not found")
        return;
    }

    const session = await SessionManager.checkSession(req.cookies?.session, req.headers["user-agent"] as string)

    if (!session) {
        res.status(401).send("Unauthorized")
        return;
    }

    res.json(await provider.getUserData(session.user.id))
})

authRouter.get('/:provider/login', async (req, res) => {
    const provider = AuthManager.getProvider(req.params.provider as keyof typeof AuthManager["authProviders"])

    if (!provider) {
        res.status(404).send("Provider not found")
        return;
    }

    res.redirect(await provider.generateOauthUrl(req.query?.i as string));
})

authRouter.get('/:provider/callback', (req, res) => {
    const provider = AuthManager.getProvider(req.params.provider as keyof typeof AuthManager["authProviders"])

    if (!provider) {
        res.status(404).send("Provider not found")
        return;
    }

    provider.handleCallback(req, res);
})

export default authRouter;
