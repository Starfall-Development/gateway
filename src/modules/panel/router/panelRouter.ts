import { Router, static as static_ } from 'express';
import authRouter from './authRouter.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import TemplateManager from '../templating/templateManager.js';
import SessionTemplateSet from '../templating/sets/sessionTemplateSet.js';
import SessionManager from '../../../server/api/auth/manager/sessionManager.js';
import { InternalChannel } from '../../../server/messaging/channels/internal.js';
import Core from '../../../server/core.js';
const panelRouter = Router();

InternalChannel.subscribeToEvent('router.panel', 'server:started', (_, data) => {
    if (data.type == 'http') Core.http.registerRootRouter('/panel', panelRouter)
});

panelRouter.use("/_", static_(resolve("../admin-panel/dist/_/")))
panelRouter.use("/auth", authRouter)

panelRouter.get('/', async (req, res) => {
    const index = readFileSync(resolve("../admin-panel/dist/pages/index.html"), "utf-8");

    const session = await SessionManager.checkSession(req.cookies.session, req.headers["user-agent"] as string);

    if (!session) {
        res.redirect("/panel/auth/login");
        return;
    }

    res.send(
        TemplateManager.apply(index, [
            await TemplateManager.getOrCreateSet(`session${session?.id}`, async () => new SessionTemplateSet(session))
        ])
    );
})

panelRouter.get('/components/:component', async (req, res) => {
    const component = readFileSync(resolve(`../admin-panel/dist/components/${req.params.component}.html`), "utf-8");

    const session = await SessionManager.checkSession(req.cookies.session, req.headers["user-agent"] as string);

    res.send(
        TemplateManager.apply(component, [
            await TemplateManager.getOrCreateSet(`session${session?.id}`, () => new SessionTemplateSet(session))
        ])
    );
})


export default panelRouter;