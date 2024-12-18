import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import User from "./user.entity.js";

@Entity()
export default class UserAccessToken {
    @PrimaryKey()
    id = Id.get();

    @ManyToOne({
        entity: () => User
    })
    user!: Rel<User>;

    @Property({
        nullable: true
    })
    key?: string; // if key is null, then this is a one-time token, delete after use

    @Property()
    token: string;

    @Property()
    refreshToken: string;

    @Property()
    expiresAt: Date;

    @Property()
    createdAt: Date = new Date();

    constructor(user: Rel<User>, expiresAt: Date, key?: string,) {
        this.user = user;
        this.key = key;
        this.expiresAt = expiresAt;
        this.token = Id.get();
        this.refreshToken = Id.get();
    }
}