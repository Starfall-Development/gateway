import "dotenv/config";
import './modules/index.js'
import GlobalLogger from "./utils/logger.js";

GlobalLogger.init()

const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    const [key, value] = arg.split("=");

    process.env[key] = value;

    GlobalLogger.log("Startup", `Setting environment variable ${key} to ${value}`);
}

import Core from "./server/core.js";

Core.start();

process.on("SIGINT", () => {
    Core.stop();
    process.exit();
})

process.on("SIGTERM", () => {
    Core.stop();
    process.exit();
})

export default Core
