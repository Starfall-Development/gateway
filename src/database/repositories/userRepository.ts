import { EntityRepository } from "@mikro-orm/core";
import User from "../entities/user.entity.js";
import Core from "../../server/core.js";

export default class UserRepository extends EntityRepository<User> {
    public async findByAuthId(authId: string): Promise<User | null> {
        return this.findOne({
            auth: {
                authId
            }
        })
    }

    public async findById(id: string): Promise<User | null> {
        return this.findOne({
            id
        })
    }

    public async createUser(displayName?: string, avatarUrl?: string): Promise<User> {
        const user = new User(displayName, avatarUrl)
        await Core.database.em.persistAndFlush(user)
        return user
    }
}