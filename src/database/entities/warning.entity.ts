import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import Player from "./player.entity.js";

@Entity()
export default class Warning {
    @PrimaryKey()
    id: string = Id.get()

    @Property({
        type: "datetime"
    })
    date: Date = new Date()

    @ManyToOne(() => Player)
    player: Player

    @Property({
        type: "text"
    })
    reason: string

    constructor(player: Player, reason: string) {
        this.player = player
        this.reason = reason
    }

}