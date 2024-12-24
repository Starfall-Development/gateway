import { Router } from 'express';
import { InternalChannel } from '../../../server/messaging/channels/internal.js';
import Core from '../../../server/core.js';
import CommandManager from '../../../server/api/index.js';
import SessionManager from '../../../server/api/auth/manager/sessionManager.js';
import { AuthType } from '../../../database/entities/userAuth.entity.js';
import { LinkingChannel } from '../../../server/messaging/channels/linking.js';
import { ToastChannel, ToastType } from '../../../server/messaging/channels/toast.js';
const linkingRouter = Router();

const clientId = 'gateway.router.linking'

InternalChannel.subscribeToEvent(clientId, 'server:started', (_, data) => {
    if (data.type == 'http') Core.http.registerRootRouter('/link', linkingRouter)
});

// initial request, send to discord oauth
linkingRouter.get('/', async (req, res) => {
    const result = await CommandManager.execute("auth.handler.create.unnamed", {
        url: "/link/next",
        skipTokenCreation: true // going to get the data needed from the session
    })

    // @REFACTOR do NOT do this, this doesn't allow for the user to change which account they are linked to
    // if we have a session and they are already linked, redirect to the completion page
    // const session = await SessionManager.checkSession(req.cookies.session, req.headers["user-agent"] as string);

    // if (session) {
    //     const [discordAuth, robloxAuth] = await Promise.all([
    //         session.user.getAuth(AuthType.Discord),
    //         session.user.getAuth(AuthType.Roblox)
    //     ])

    //     if (discordAuth && robloxAuth) {
    //         res.redirect("/link/complete");
    //         return;
    //     }


    //     // if they are already linked to discord, send them to roblox
    //     if (discordAuth) {
    //         res.redirect("/link/next");
    //         return;
    //     }
    // }

    res.redirect(`/auth/discord/login?i=${result.identifier}`);
})

// callback from discord oauth
linkingRouter.get('/next', async (req, res) => {
    const result = await CommandManager.execute("auth.handler.create.unnamed", {
        url: "/link/complete",
        skipTokenCreation: true // going to get the data needed from the session
    })

    // @REFACTOR do NOT do this, this doesn't allow for the user to change which account they are linked to
    // check if the user is already linked
    // const session = await SessionManager.checkSession(req.cookies.session, req.headers["user-agent"] as string);

    // if (!session) {
    //     res.send("We had an issue logging you in. Please try again.");
    //     return;
    // }

    // const robloxAuth = await session.user.getAuth(AuthType.Roblox);

    // // if they are already linked to roblox, send them to the completion page

    // if (robloxAuth) {
    //     res.redirect("/link/complete");
    //     return;
    // }

    res.redirect(`/auth/roblox/login?i=${result.identifier}`);
})

// callback from roblox oauth
linkingRouter.get('/complete', async (req, res) => {

    const session = await SessionManager.checkSession(req.cookies.session, req.headers["user-agent"] as string);

    if (!session) {
        res.send("We had an issue logging you in. Please try again.");
        return;
    }

    const [discordAuth, robloxAuth] = await Promise.all([
        session.user.getAuth(AuthType.Discord),
        session.user.getAuth(AuthType.Roblox)
    ])

    if (!discordAuth || !robloxAuth) {
        res.send("We had an issue logging you in. Please try again.");
        return;
    }

    LinkingChannel.publish(clientId, 'user:linked', {
        discord: {
            id: discordAuth.platformId,
            username: discordAuth.username
        },
        roblox: {
            id: robloxAuth.platformId,
            username: robloxAuth.username
        }
    })

    ToastChannel.publish(clientId, 'toast:send', {
        type: ToastType.Success,
        title: "Accounts Linked",
        description: `Your account has been linked to @${discordAuth.username}`,
        playerId: parseInt(robloxAuth.platformId)
    })

    res.redirect("/link/success");
})

linkingRouter.get('/success', async (req, res) => {

    const session = await SessionManager.checkSession(req.cookies.session, req.headers["user-agent"] as string);

    if (!session) {
        res.send("We had an issue logging you in. Please try again.");
        return;
    }

    const [discordAuth, robloxAuth] = await Promise.all([
        session.user.getAuth(AuthType.Discord),
        session.user.getAuth(AuthType.Roblox)
    ])

    if (!discordAuth || !robloxAuth) {
        res.send("We had an issue logging you in. Please try again.");
        return;
    }

    // @TODO use a template

    res.send(`Your account has been linked to @${discordAuth.username} (discord) and ${robloxAuth.username} (roblox)`);
})

export default linkingRouter;
