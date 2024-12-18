import { Router } from 'express';
import CommandManager from '../../server/api/index.js';
import Id from '../../utils/id.js';
const authRouter = Router();

authRouter.get('/login/:provider', async (req, res) => {

    // create unique login identifier
    const result = await CommandManager.execute("auth.handler.create.unnamed", {
        url: "/panel/auth/callback",
    })

    // start auth
    res.redirect(`/auth/${req.params.provider}/login?i=${result.identifier}`);
})

authRouter.get('/callback', async (req, res) => {
    // token is unneeded, as we can get the session from the cookie
    res.redirect("/panel");

})

export default authRouter;
