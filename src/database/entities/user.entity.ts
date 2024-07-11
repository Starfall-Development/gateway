import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { pbkdf2, randomBytes } from "node:crypto"

@Entity()
export default class User {

    @PrimaryKey()
    username: string

    @Property()
    displayName: string

    /**
     * For OAuth2, this is the access token
     * 
     * For password-based authentication, this is the hashed password
     */
    @Property()
    token: string

    /**
     * For OAuth2, this is for the refresh token
     * 
     * For password-based authentication, this is the salt 
     */
    @Property({
        nullable: true
    })
    token2?: string

    @Property()
    createdAt: Date = new Date()

    @Property({
        nullable: true
    })
    expiresAt?: Date

    @Property()
    scopes: string[] = []

    constructor(username: string, displayName: string, token: string, token2?: string, scopes: string[] = [], expiresAt?: Date) {
        this.username = username
        this.displayName = displayName
        this.token = token
        this.token2 = token2
        this.scopes = scopes
        this.expiresAt = expiresAt

        if (this.scopes.length === 0) {
            this.scopes = ["identify"]
        }
    }

    public static fromPassword(username: string, password: string) {
        return new Promise<User>((resolve, reject) => {

            const salt = randomBytes(128).toString("base64")
            const iterations = 10000

            pbkdf2(password, salt, iterations, 128, "sha256", (err, hash) => {
                if (err) {
                    reject(err)
                }

                const user = new User(username, username, hash.toString("base64"), salt)
                resolve(user)
            })

        })
    }

    public static fromDiscord(userId: string, username: string, token: string, refreshToken?: string, scopes: string[] = [], expiresAt?: Date) {
        const user = new User(`discord:${userId}`, username, token, refreshToken, scopes, expiresAt)
        return user
    }

    public static fromGithub(id: number, login: string, token: string, scopes: string[] = [], expiresAt?: Date) {
        const user = new User(`github:${id}`, login, token, undefined, scopes, expiresAt)
        return user
    }

    public static verifyPassword(user: User, password: string) {
        return new Promise<boolean>((resolve, reject) => {

            pbkdf2(password, user.token2!, 10000, 64, "sha256", (err, hash) => {
                if (err) {
                    reject(err)
                }

                resolve(hash.toString("base64") === user.token)
            })

        })
    }
}