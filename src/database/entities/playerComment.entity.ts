import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import Player from "./player.entity.js";
import User from "./user.entity.js";

@Entity()
export default class PlayerComment {
    @PrimaryKey()
    id: string = Id.get()

    @Property({
        type: "datetime"
    })
    date: Date = new Date()

    @ManyToOne(() => User)
    user: User

    @ManyToOne(() => Player)
    player: Player

    @Property({
        type: "text"
    })
    content: string

    constructor(user: User, player: Player, content: string) {
        this.user = user
        this.player = player
        this.content = content
    }
}
