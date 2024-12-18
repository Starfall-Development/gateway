import { Router } from 'express';
import CommandManager from '../../../index.js';
const testRouter = Router();

testRouter.get('/login/:provider', async (req, res) => {

    const result = await CommandManager.execute("auth.handler.create.unnamed", {
        url: "http://localhost:3000/test/callback",
    })

    res.redirect(`/auth/${req.params.provider}?i=${result.identifier}`);
})

testRouter.get('/callback', async (req, res) => {
    const result = await CommandManager.execute("auth.token.get", {
        token: req.query.token as string
    })

    res.json(result);
})

export default testRouter;
