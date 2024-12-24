import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { pbkdf2, randomBytes } from "node:crypto"
import User from "./user.entity.js";

@Entity()
export default class UserAuth {

    @PrimaryKey()
    authId: string

    @Property()
    username: string

    @Property()
    @Enum(() => AuthType)
    type: AuthType

    /**
     * For OAuth2, this is the access token
     * 
     * For password-based authentication, this is the hashed password
     */
    @Property({
        type: "text"
    })
    token: string

    /**
     * For OAuth2, this is for the refresh token
     * 
     * For password-based authentication, this is the salt 
     */
    @Property({
        nullable: true,
        type: "text"
    })
    token2?: string

    @ManyToOne({
        entity: () => User,
        inversedBy: "auth"
    })
    user: Rel<User>

    @Property()
    createdAt: Date = new Date()

    @Property({
        nullable: true
    })
    expiresAt?: Date

    @Property()
    scopes: string[] = []

    constructor(userId: string, username: string, type: AuthType, user: Rel<User>, token: string, token2?: string, scopes: string[] = [], expiresAt?: Date) {
        this.authId = userId
        this.username = username
        this.type = type
        this.token = token
        this.token2 = token2
        this.user = user
        this.scopes = scopes
        this.expiresAt = expiresAt

        if (this.scopes.length === 0) {
            this.scopes = ["identify"]
        }

        this.user.addAuth(this)
    }

    public get isExpired() {
        return this.expiresAt ? this.expiresAt < new Date() : false
    }

    public get platformId() {
        return this.authId.split(":")[1]
    }

    public static fromPassword(user: User, username: string, password: string) {
        return new Promise<UserAuth>((resolve, reject) => {

            const salt = randomBytes(128).toString("base64")
            const iterations = 10000

            pbkdf2(password, salt, iterations, 128, "sha256", (err, hash) => {
                if (err) {
                    reject(err)
                }

                const auth = new UserAuth(username, username, AuthType.Password, user, hash.toString("base64"), salt)
                resolve(auth)
            })

        })
    }

    public static fromDiscord(user: User, userId: string, username: string, token: string, refreshToken: string, scopes: string[], expiresAt: Date) {
        const auth = new UserAuth(`discord:${userId}`, username, AuthType.Discord, user, token, refreshToken, scopes, expiresAt)
        return auth
    }

    public static fromGithub(user: User, id: number, username: string, token: string, scopes: string[]) {
        const auth = new UserAuth(`github:${id}`, username, AuthType.GitHub, user, token, undefined, scopes)
        return auth
    }

    public static fromRoblox(user: User, sub: string, username: string, token: string, refreshToken: string, scopes: string[], expiresAt: Date) {
        const auth = new UserAuth(`roblox:${sub}`, username, AuthType.Roblox, user, token, refreshToken, scopes, expiresAt)
        return auth
    }

    public static verifyPassword(auth: UserAuth, password: string) {
        return new Promise<boolean>((resolve, reject) => {

            pbkdf2(password, auth.token2!, 10000, 128, "sha256", (err, hash) => {
                if (err) {
                    reject(err)
                }

                resolve(hash.toString("base64") === auth.token)
            })

        })
    }
}

export enum AuthType {
    Password,
    Discord,
    GitHub,
    Roblox
}

export const AuthTypeNames = {
    [AuthType.Password]: "Password",
    [AuthType.Discord]: "Discord",
    [AuthType.GitHub]: "GitHub",
    [AuthType.Roblox]: "Roblox",
}
