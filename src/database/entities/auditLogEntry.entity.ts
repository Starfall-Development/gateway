import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import User from "./user.entity.js";
import Player from "./player.entity.js";

@Entity()
export default class AuditLogEntry {

    @PrimaryKey()
    id: string = Id.get()

    @Property({ type: "datetime" })
    date: Date = new Date()

    @ManyToOne(() => User)
    user: User

    @Enum(() => AuditLogAction)
    action: AuditLogAction

    @ManyToOne(() => Player, { nullable: true })
    target?: Player

    constructor(user: User, action: AuditLogAction, target?: Player) {
        this.user = user
        this.action = action
        this.target = target
    }
}

export enum AuditLogAction {
    Login,

    Warn,
    Mute,
    Kick,
    Ban,
    Unban,
    Unmute,

}