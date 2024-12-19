import { Request, Response } from "express";
import oAuthProvider, { UserData } from "./oAuthProvider.js";
import * as client from "openid-client";
import fetch from "node-fetch";
import Core from "../../../core.js";
import UserAuth, { AuthType } from "../../../../database/entities/userAuth.entity.js";
import SessionManager from "../manager/sessionManager.js";
import AuthManager from "../../manager/authManager.js";
import UserAccessToken from "../../../../database/entities/userAccessToken.entity.js";
import User from "../../../../database/entities/user.entity.js";
import { ms, time } from "../../../../utils/time.js";

export default class RobloxOAuthProvider extends oAuthProvider {

    private _config: client.Configuration | undefined
    private _codeVerifier: string | undefined

    constructor() {
        super()

        this.init()
    }

    public async init() {
        this._config = await client.discovery(
            new URL("https://apis.roblox.com/oauth/.well-known/openid-configuration"),
            process.env.ROBLOX_CLIENT_ID!,
            process.env.ROBLOX_CLIENT_SECRET!
        )

        this._codeVerifier = client.randomPKCECodeVerifier()

    }

    public async generateOauthUrl(identifier?: string): Promise<string> {

        if (!this._config) {
            await this.init()
        }

        const codeChallenge = await client.calculatePKCECodeChallenge(this._codeVerifier!)

        const params: Record<string, string> = {
            redirect_uri: process.env.ROBLOX_REDIRECT_URI!,
            scope: "openid profile",
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        }

        if (!this._config!.serverMetadata().supportsPKCE()) {
            params.state = this.generateState(identifier, client.randomState())
        }

        return client.buildAuthorizationUrl(this._config!, params).toString()
    }

    public async handleCallback(req: Request, res: Response): Promise<void> {
        const code = req.query.code as string
        const state = req.query.state as string
        const userAgent = req.headers["user-agent"] as string

        const identifier = this.isValidState(state)

        if (!identifier) {
            res.status(400).send("Invalid state")
            return
        }

        const token = await this.exchangeCode(code)

        const user = await this.getUser(token.access_token)

        if (!user.sub) {
            res.status(400).send("Invalid token")
            return
        }

        const currentSession = await SessionManager.checkSession(req.cookies.session, userAgent)


        let userEntity: User | undefined
        let userAuth: UserAuth | undefined

        if (currentSession) {
            // user is already logged in, merge this new account with the existing one

            userEntity = currentSession.user
            const existingAuth = await userEntity.getAuth(AuthType.Roblox)

            if (existingAuth) {
                // overwrite the existing auth with the new one
                existingAuth.token = token.access_token
                existingAuth.token2 = token.refresh_token
                existingAuth.scopes = token.scope.split(" ")
                await Core.database.em.persistAndFlush(existingAuth)
            } else {
                userAuth = UserAuth.fromRoblox(userEntity, user.sub, user.name, token.access_token, token.refresh_token, token.scope.split(" "), time(`${token.expires_in} seconds`).fromNow().toDate())
                await Core.database.em.persistAndFlush(userAuth)
            }

            // force expire the current session (new session will be generated below)
            await SessionManager.deleteSession(req.cookies.session)

        } else {

            userEntity = await Core.database.services.user.findByAuthId(`roblox:${user.sub}`) || undefined

            if (!userEntity) {
                userEntity = await Core.database.services.user.createUser(user.name, user.picture)
            }

            userAuth = await userEntity!.getAuth(AuthType.Roblox)

            if (!userAuth) {
                userAuth = UserAuth.fromRoblox(userEntity, user.sub, user.name, token.access_token, token.refresh_token, token.scope.split(" "), time(`${token.expires_in} seconds`).fromNow().toDate())
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
                accessToken = new UserAccessToken(userEntity, time("15 minutes").fromNow().toDate(), handler.key)
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
        const res = await fetch("https://apis.roblox.com/oauth/v1/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.ROBLOX_CLIENT_ID!,
                client_secret: process.env.ROBLOX_CLIENT_SECRET!,
                grant_type: "authorization_code",
                code_verifier: this._codeVerifier!,
            })
        })

        return await res.json() as { access_token: string, token_type: string, expires_in: number, refresh_token: string, scope: string }
    }

    public async getUser(accessToken: string) {
        const response = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        return await response.json() as {
            sub: string,
            name: string,
            nickname: string,
            preferred_username: string,
            created_at: string,
            profile: string,
            picture: string,
        }
    }

    public async refreshAccessToken(userId: string) {

        const user = await Core.database.services.user.findById(userId)

        if (!user) {
            throw new Error("Invalid user")
        }

        const auth = await user.getAuth(AuthType.Roblox)

        if (!auth) {
            throw new Error("Invalid auth")
        }

        const res = await fetch("https://apis.roblox.com/oauth/v1/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                refresh_token: auth.token2!,
                client_id: process.env.ROBLOX_CLIENT_ID!,
                client_secret: process.env.ROBLOX_CLIENT_SECRET!,
                grant_type: "refresh_token",
            })
        })

        const token = await res.json() as { access_token: string, token_type: string, expires_in: number, refresh_token: string, scope: string }

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

        const auth = await user.getAuth(AuthType.Roblox)

        if (!auth) {
            throw new Error("Invalid auth")
        }

        if (!auth.expiresAt || auth.expiresAt < new Date()) {
            await this.refreshAccessToken(userId)
        }

        const data = await this.getUser(auth.token)

        return {
            id: data.sub,
            displayName: data.nickname,
            avatarUrl: data.picture,
        }
    }





}