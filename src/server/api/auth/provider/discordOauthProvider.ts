import { Request, Response } from "express";
import UserAuth, { AuthType } from "../../../../database/entities/userAuth.entity.js";
import SessionManager from "../manager/sessionManager.js";
import oAuthProvider, { UserData } from "./oAuthProvider.js";
import Core from "../../../core.js";
import UserAccessToken from "../../../../database/entities/userAccessToken.entity.js";
import AuthManager from "../../manager/authManager.js";
import User from "../../../../database/entities/user.entity.js";
import { ms, time } from "../../../../utils/time.js";

export default class DiscordOAuthProvider extends oAuthProvider {

    constructor() {
        super()
    }

    public generateOauthUrl(identifier?: string) {
        const url = new URL("https://discord.com/oauth2/authorize")
        url.searchParams.append("client_id", process.env.DISCORD_CLIENT_ID!)
        url.searchParams.append("redirect_uri", process.env.DISCORD_REDIRECT_URI!)
        url.searchParams.append("state", this.generateState(identifier))
        url.searchParams.append("response_type", "code")
        url.searchParams.append("scope", "identify")
        return url.toString()
    }

    public async handleCallback(req: Request, res: Response) {
        const code = req.query.code as string
        const state = req.query.state as string
        const userAgent = req.headers["user-agent"] as string

        if (!code || !state) {
            res.status(400).send("Missing code or state")
            return
        }

        const identifier = this.isValidState(state)

        if (!identifier) {
            res.status(400).send("Invalid state")
            return
        }

        const token = await this.exchangeCode(code)


        if (!token.access_token) {
            res.status(400).send("Invalid code")
            return
        }

        const user = await this.getUser(token.access_token)

        if (!user.id) {
            res.status(400).send("Invalid token")
            return
        }

        const currentSession = await SessionManager.checkSession(req.cookies.session, userAgent)

        let userEntity: User | undefined
        let userAuth: UserAuth | undefined

        if (currentSession) {
            // user is already logged in, merge this new account with the existing one

            userEntity = currentSession.user
            const existingAuth = await userEntity.getAuth(AuthType.Discord)

            if (existingAuth) {
                // overwrite the existing auth with the new one
                existingAuth.token = token.access_token
                existingAuth.token2 = token.refresh_token
                existingAuth.scopes = [token.scope]
                await Core.database.em.persistAndFlush(existingAuth)
            } else {
                userAuth = UserAuth.fromDiscord(userEntity, user.id, user.username, token.access_token, token.refresh_token, [token.scope], time(`${token.expires_in} seconds`).fromNow().toDate())
                await Core.database.em.persistAndFlush(userAuth)
            }

            // force expire the current session (new session will be generated below)
            await SessionManager.deleteSession(req.cookies.session)

        } else {

            userEntity = await Core.database.services.user.findByAuthId(`discord:${user.id}`) || undefined

            if (!userEntity) {
                userEntity = await Core.database.services.user.createUser(user.username, `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`)
            }

            userAuth = await userEntity!.getAuth(AuthType.Discord)

            if (!userAuth) {
                userAuth = UserAuth.fromDiscord(userEntity, user.id, user.username, token.access_token, token.refresh_token, [token.scope], time(`${token.expires_in} seconds`).fromNow().toDate())
                await Core.database.em.persistAndFlush(userEntity)
            }

        }

        const session = await SessionManager.genSession(userEntity, userAgent)
        res.cookie("session", session.id, { maxAge: ms("7 days"), httpOnly: true })

        if (identifier && typeof identifier === "string") {

            const handler = AuthManager.getHandler(identifier)
            if (!handler) {
                res.status(400).send("Invalid handler: The website redirecting you here didn't correctly establish a connection with the gateway. Please try again. (Error: No handler found)")
                return
            }

            let accessToken: UserAccessToken | undefined

            if (handler.createAccessToken != false) {
                // create a user access token for the service to access the user's account data
                const accessToken = new UserAccessToken(userEntity, time("15 minutes").fromNow().toDate(), handler.key)
                await Core.database.em.persistAndFlush(accessToken)
            }

            const redirectUrl = new URL(handler.url.startsWith("/") ? `${Core.BASE_URL}${handler.url}` : handler.url)
            if (accessToken) redirectUrl.searchParams.append("token", accessToken.token)

            res.redirect(
                redirectUrl.toString()
            )
            return
        }

        res.redirect("/")
    }

    public async exchangeCode(code: string) {
        const response = await fetch("https://discord.com/api/v10/oauth2/token", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI!,
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!
            }).toString()
        })

        return response.json() as Promise<{ access_token: string, refresh_token: string, token_type: string, scope: string, expires_in: number }>
    }

    public async getUser(token: string) {
        const response = await fetch("https://discord.com/api/v10/users/@me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return await response.json() as Promise<{
            id: string,
            username: string,
            global_name: string,
            avatar: string,
        }>
    }

    public async refreshAccessToken(userId: string) {

        const user = await Core.database.services.user.findById(userId)

        if (!user) {
            throw new Error("Invalid user")
        }

        const auth = await user.getAuth(AuthType.Discord)

        if (!auth) {
            throw new Error("Invalid auth")
        }

        const response = await fetch("https://discord.com/api/v10/oauth2/token", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: auth.token2!,
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!
            }).toString()
        })

        const token = await response.json() as { access_token: string, refresh_token: string, token_type: string, scope: string, expires_in: number }

        auth.token = token.access_token
        auth.token2 = token.refresh_token
        auth.expiresAt = time(`${token.expires_in} seconds`).fromNow().toDate()
        await Core.database.em.persistAndFlush(auth)
    }

    public async getUserData(userId: string): Promise<UserData> {
        const user = await Core.database.services.user.findById(userId)

        if (!user) {
            throw new Error("Invalid user")
        }

        const auth = await user.getAuth(AuthType.Discord)

        if (!auth) {
            throw new Error("Invalid auth")
        }

        if (!auth.expiresAt || auth.expiresAt < new Date()) {
            await this.refreshAccessToken(userId)
        }

        const userResponse = await this.getUser(auth.token)

        return {
            id: userResponse.id,
            displayName: userResponse.username,
            avatarUrl: `https://cdn.discordapp.com/avatars/${userResponse.id}/${userResponse.avatar}.png`,
        }
    }


}