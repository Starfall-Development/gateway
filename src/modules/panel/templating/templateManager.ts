import { Logger } from "../../../utils/logger.js";
import ComponentTemplateSet from "./sets/componentTemplateSet.js";
import TemplateSet from "./templateSet.js";

export default class TemplateManager {
    public static globalTemplateSets: TemplateSet[] = []
    public static sets: Map<string, TemplateSet> = new Map()
    public static logger = new Logger("TemplateManager")

    public static apply(input: string, sets: TemplateSet[]): string {
        sets.concat(TemplateManager.globalTemplateSets).sort((a, b) => b.priority - a.priority).forEach((set) => input = TemplateSet.prototype.apply.call(set, input))
        return input
    }

    public static addGlobalSet(set: TemplateSet): void {
        TemplateManager.globalTemplateSets.push(set)
    }

    public static getSet<T extends TemplateSet>(name: string): T | undefined {
        return TemplateManager.sets.get(name) as T
    }

    public static async getOrCreateSet<T extends TemplateSet>(name: string, setProvider: () => T | Promise<T>): Promise<T> {
        if (!TemplateManager.sets.has(name)) {
            const set = setProvider()
            TemplateManager.sets.set(name, await set)

            return set
        }

        return TemplateManager.sets.get(name) as T
    }

}

TemplateManager.addGlobalSet(new ComponentTemplateSet())