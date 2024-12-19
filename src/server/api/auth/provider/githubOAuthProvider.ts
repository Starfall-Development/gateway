import { Request, Response } from "express";
import UserAuth, { AuthType } from "../../../../database/entities/userAuth.entity.js";
import SessionManager from "../manager/sessionManager.js";
import oAuthProvider, { UserData } from "./oAuthProvider.js";
import Core from "../../../core.js";
import UserAccessToken from "../../../../database/entities/userAccessToken.entity.js";
import AuthManager from "../../manager/authManager.js";
import User from "../../../../database/entities/user.entity.js";
import { ms, time } from "../../../../utils/time.js";

export default class GitHubOAuthProvider extends oAuthProvider {

    constructor() {
        super()
    }

    public generateOauthUrl(identifier?: string) {
        const url = new URL("https://github.com/login/oauth/authorize")
        url.searchParams.append("client_id", process.env.GITHUB_CLIENT_ID!)
        url.searchParams.append("redirect_uri", process.env.GITHUB_REDIRECT_URI!)
        url.searchParams.append("state", this.generateState(identifier))
        url.searchParams.append("scope", "read:user")
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
            const existingAuth = await userEntity.getAuth(AuthType.GitHub)

            if (existingAuth) {
                // overwrite the existing auth with the new one
                existingAuth.token = token.access_token
                existingAuth.scopes = [token.scope]
                await Core.database.em.persistAndFlush(existingAuth)
            } else {
                userAuth = UserAuth.fromGithub(userEntity, user.id, token.access_token, [token.scope])
                await Core.database.em.persistAndFlush(userAuth)
            }

            // force expire the current session (new session will be generated below)
            await SessionManager.deleteSession(req.cookies.session)

        } else {

            userEntity = await Core.database.services.user.findByAuthId(`github:${user.id}`) || undefined

            if (!userEntity) {
                userEntity = await Core.database.services.user.createUser(user.login, user.avatar_url)
            }

            userAuth = await userEntity!.getAuth(AuthType.Discord)

            if (!userAuth) {
                userAuth = UserAuth.fromGithub(userEntity, user.id, token.access_token, [token.scope])
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

            // create a user access token for the service to access the user's account data
            const accessToken = new UserAccessToken(userEntity, time("15 minutes").fromNow().toDate(), handler.key)
            await Core.database.em.persistAndFlush(accessToken)

            const redirectUrl = new URL(handler.url.startsWith("/") ? `${Core.BASE_URL}${handler.url}` : handler.url)
            redirectUrl.searchParams.append("token", accessToken.token)

            res.redirect(
                redirectUrl.toString()
            )
            return
        }

        res.redirect("/")
    }

    public async exchangeCode(code: string) {
        const url = new URL("https://github.com/login/oauth/access_token")
        url.searchParams.append("client_id", process.env.GITHUB_CLIENT_ID!)
        url.searchParams.append("client_secret", process.env.GITHUB_CLIENT_SECRET!)
        url.searchParams.append("code", code)
        url.searchParams.append("redirect_uri", process.env.GITHUB_REDIRECT_URI!)
        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Accept": "application/json"
            }
        })

        return response.json() as Promise<{ access_token: string, token_type: string, scope: string }>
    }

    public async getUser(token: string) {
        const response = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `token ${token}`
            }
        })

        return response.json() as Promise<{ id: number, login: string, avatar_url: string }>
    }

    public refreshAccessToken(userId: string): void {
        // GitHub does not provide a refresh token
    }

    public async getUserData(userId: string): Promise<UserData> {
        const user = await Core.database.services.user.findById(userId)

        if (!user) {
            throw new Error("Invalid user")
        }

        const auth = await user.getAuth(AuthType.GitHub)

        if (!auth) {
            throw new Error("Invalid auth")
        }

        const data = await this.getUser(auth.token)

        return {
            id: data.id.toString(),
            displayName: data.login,
            avatarUrl: data.avatar_url
        }
    }

}