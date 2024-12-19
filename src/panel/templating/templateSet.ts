import TemplateManager from "./templateManager.js"

export default abstract class TemplateSet {
    /**
     * priority of the template set, higher priority will be applied first
     */
    public readonly priority: number = 0
    public variables: Map<string, string> = new Map()
    public defaults: Map<string, string> = new Map()

    constructor(name: string, priority: number) {
        TemplateManager.sets.set(name, this)
        this.priority = priority
    }

    public set(key: string, value?: string): void {
        if (!value) value = this.defaults.get(key) || ''
        this.variables.set(key, value)
    }

    public apply(input: string): string {
        let output = input
        this.variables.forEach((value, key) => {
            // TemplateManager.logger.debug(`Applying ${key} -> ${value}`)
            output = output.replace(new RegExp(`{{${key}}}`, 'g'), value)
        })
        return output
    }
}