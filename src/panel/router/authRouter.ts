import { Router } from 'express';
import CommandManager from '../../server/api/index.js';
import { resolve } from 'path';
const authRouter = Router();

authRouter.get('/login', (req, res) => {
    res.sendFile(resolve("../admin-panel/dist/pages/login.html"));
})

authRouter.get('/logout', (req, res) => {
    res.redirect('/auth/logout');
})

authRouter.get('/login/:provider', async (req, res) => {

    const result = await CommandManager.execute("auth.handler.create.unnamed", {
        url: "/panel",
        skipTokenCreation: true
    })

    // start auth
    res.redirect(`/auth/${req.params.provider}/login?i=${result.identifier}`);
})

export default authRouter;
