import { Router } from 'express';
import CommandManager from '../../server/api/index.js';
const authRouter = Router();

authRouter.get('/login/:provider', async (req, res) => {

    const result = await CommandManager.execute("auth.handler.create.unnamed", {
        url: "/panel/auth/callback",
    })

    res.redirect(`/auth/${req.params.provider}?i=${result.identifier}`);
})

authRouter.get('/callback', async (req, res) => {
    const result = await CommandManager.execute("auth.token.get", {
        token: req.query.token as string
    })

    res.json(result);
})

export default authRouter;