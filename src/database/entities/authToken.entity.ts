import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";

@Entity()
export default class AuthToken {
    @PrimaryKey()
    token: string = `gtwy_${Id.get()}`

    @Property()
    name: string

    @Property({
        nullable: true
    })
    expiresAt?: Date

    @Property()
    createdAt: Date = new Date()

    constructor(name: string, expiresAt?: Date) {
        this.name = name
        this.expiresAt = expiresAt
    }
}
