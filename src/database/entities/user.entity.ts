import { Collection, Entity, EntityRepositoryType, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import UserAuth, { AuthType } from "./userAuth.entity.js";
import UserRepository from "../repositories/userRepository.js";
import Id from "../../utils/id.js";
import Session from "./session.entity.js";

@Entity({ repository: () => UserRepository })
export default class User {

    [EntityRepositoryType]?: UserRepository

    @PrimaryKey()
    id: string = Id.get()

    @Property()
    displayName: string

    @OneToMany({
        entity: () => UserAuth,
        mappedBy: "user",
    })
    auth = new Collection<UserAuth>(this)

    @OneToMany({
        entity: () => UserAuth,
        mappedBy: "user",
    })
    accessTokens = new Collection<UserAuth>(this)

    @OneToMany({
        entity: () => Session,
        mappedBy: "user",
    })
    sessions = new Collection<Session>(this)

    @Property()
    createdAt: Date = new Date()

    constructor(displayName?: string) {
        this.displayName = displayName || this.id
    }

    public addAuth(auth: UserAuth) {
        this.auth.add(auth)
    }

    public async getAuth(authType: AuthType) {
        if (!this.auth.isInitialized()) {
            await this.auth.init()
        }

        return this.auth.getItems().find(auth => auth.type === authType)
    }
}