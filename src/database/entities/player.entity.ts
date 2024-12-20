import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity()
export default class Player {

    @PrimaryKey({
        type: "integer"
    })
    id: number

    constructor(id: number) {
        this.id = id
    }

}