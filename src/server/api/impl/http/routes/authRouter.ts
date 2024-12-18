import { Router } from 'express';
import AuthManager from '../../../manager/authManager.js';
import SessionManager from '../../../auth/manager/sessionManager.js';
import { AuthTypeNames } from '../../../../../database/entities/userAuth.entity.js';
const authRouter = Router();

authRouter.get('/status', async (req, res) => {

    const session = await SessionManager.checkSession(req.cookies?.session)

    if (!session) {
        res.status(401).send("Unauthorized")
        return;
    }

    const providers = session.user.auth.getItems()

    res.json(providers.map(provider => ({
        type: AuthTypeNames[provider.type],
        id: provider.authId,
    })))

})

authRouter.get('/:provider', async (req, res) => {
    const provider = await AuthManager.getProvider(req.params.provider as keyof typeof AuthManager["authProviders"])

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
