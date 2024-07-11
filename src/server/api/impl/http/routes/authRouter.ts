import { Router } from 'express';
import AuthManager from '../../../manager/authManager';
const authRouter = Router();


authRouter.get('/github', (req, res) => {
    res.redirect(AuthManager.authProviders.github.generateOauthUrl(req.query?.i as string));
})

authRouter.get('/github/callback', (req, res) => {
    AuthManager.authProviders.github.handleCallback(req, res);
})

export default authRouter;