import { Entity, PrimaryKey } from "@mikro-orm/core";
import Id from "../../utils/id.js";

@Entity()
export default class Evidence {

    @PrimaryKey()
    id: string = Id.get()

}
