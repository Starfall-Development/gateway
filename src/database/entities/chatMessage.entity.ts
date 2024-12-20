import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import Id from "../../utils/id.js";
import Player from "./player.entity.js";

@Entity()
export default class ChatMessage {

    @PrimaryKey()
    id: string = Id.get();

    @ManyToOne(() => Player)
    player: Player

    @Property({
        type: "varchar 255"
    })
    message: string

    @Property({
        type: "datetime"
    })
    date: Date = new Date()

    @Property({
        type: "integer"
    })
    x: number

    @Property({
        type: "integer"
    })
    y: number

    @Property({
        type: "integer"
    })
    z: number

    @Enum(() => ChatChannel)
    channel: ChatChannel

    @Property({
        type: "integer",
        nullable: true
    })
    recipient?: number

    constructor(player: Player, message: string, x: number, y: number, z: number, channel: ChatChannel, recipient?: number) {
        this.player = player
        this.message = message
        this.x = x
        this.y = y
        this.z = z
        this.channel = channel
        this.recipient = recipient
    }

}

export enum ChatChannel {

}