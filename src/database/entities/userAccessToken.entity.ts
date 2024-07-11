import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id";

@Entity()
export default class UserAccessToken {
    @PrimaryKey()
    id = Id.get();

    @Property()
    username: string;

    @Property()
    token: string;

    @Property()
    refreshToken: string;

    @Property()
    expiresAt: Date;

    @Property()
    createdAt: Date = new Date();

    constructor(username: string, expiresAt: Date) {
        this.username = username;
        this.expiresAt = expiresAt;
        this.token = Id.get();
        this.refreshToken = Id.get();
    }
}