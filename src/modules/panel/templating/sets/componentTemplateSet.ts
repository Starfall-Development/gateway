import TemplateSet from "../templateSet.js";
import fs from 'fs'
import { resolve } from 'path'

export default class ComponentTemplateSet extends TemplateSet {
    public static readonly COMPONENTS_PATH = resolve('../admin-panel/dist/components/')

    constructor() {
        super('component', 1000); // NEEDS to be applied first
        this.loadRecursive(ComponentTemplateSet.COMPONENTS_PATH)
    }

    private loadRecursive(path: string): void {
        const files = fs.readdirSync(path)
        files.forEach(file => {
            const filePath = resolve(path, file)
            if (fs.statSync(filePath).isDirectory()) {
                this.loadRecursive(filePath)
            }
            else {
                const content = fs.readFileSync(filePath, 'utf-8')
                const path = filePath.replace(ComponentTemplateSet.COMPONENTS_PATH, '').replace('.html', '')
                const slug = path.split('/').join('.')
                this.set(`component${slug}`, content)
            }
        })
    }
}
