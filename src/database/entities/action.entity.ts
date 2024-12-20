import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import User from "./user.entity.js";
import Player from "./player.entity.js";

@Entity()
export default class Action {

    @PrimaryKey()
    id: string = Id.get()

    @Enum(() => ActionType)
    type: ActionType

    @Property({
        type: "datetime"
    })
    date: Date = new Date()

    @ManyToOne(() => User)
    user: User

    @ManyToOne(() => Player)
    target: Player

    @Property({
        type: "text"
    })
    reason: string

    constructor(type: ActionType, user: User, target: Player, reason: string) {
        this.type = type
        this.user = user
        this.target = target
        this.reason = reason
    }

}

export enum ActionType {
    Warn,
    Mute,
    Kick,
    Ban,
    Unban,
    Unmute
}
