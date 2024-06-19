import { Entity, EntityRepositoryType, PrimaryKey, Property } from "@mikro-orm/core";
import { ShortlinkRepository } from "../repositories/shortlink.repo";
import Id from "../../utils/id";

@Entity({ repository: () => ShortlinkRepository })
export class Shortlink {

    [EntityRepositoryType]?: ShortlinkRepository;

    @PrimaryKey()
    id: string;

    /**
     * The amount of times this shortlink can be used before it is disabled.
     * 0 means unlimited uses.
     */
    @Property()
    uses: number

    /**
     * The amount of times this shortlink has been visited.
     */
    @Property()
    visits: number = 0;

    /**
     * The URL that this shortlink redirects to.
     */
    @Property()
    url: string;

    /**
     * The date this shortlink was created.
     */
    @Property()
    createdAt: Date;

    /**
     * The date this shortlink was last used.
     */
    @Property({
        nullable: true
    })
    lastUsed: Date | null;

    /**
     * The date this shortlink will expire.
     */
    @Property({
        nullable: true
    })
    expiresAt: Date | null;

    constructor(options: ShortlinkConstructorOptions) {
        this.id = options.id || Id.get();
        this.uses = options.uses || 0;
        this.url = options.url;
        this.createdAt = new Date();
        this.lastUsed = null;
        this.expiresAt = options.expiresAt || null;
    }
}

export interface ShortlinkConstructorOptions {
    id?: string;
    uses?: number;
    url: string;
    expiresAt?: Date;
}