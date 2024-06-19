import { EntityRepository } from "@mikro-orm/core";
import { Shortlink, ShortlinkConstructorOptions } from "../entities/shortlink.entity";

export class ShortlinkRepository extends EntityRepository<Shortlink> {
    createShortlink(options: ShortlinkConstructorOptions): Shortlink {
        const shortlink = new Shortlink(options);
        return this.create(shortlink);
    }
}