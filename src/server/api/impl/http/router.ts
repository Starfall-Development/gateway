import { Router, static as static_ } from 'express';
import CommandManager from '../..';

import shortlinkRouter from './routes/shortlinkRouter';
import { resolve } from 'path';
const router = Router();


router.use("/assets", static_(resolve("../index/dist/assets/")))
router.use("/l", shortlinkRouter)

router.get('/', (req, res) => {
    res.sendFile(resolve("../index/dist/index.html"));
})

router.get('/api/:command', async (req, res) => {
    const command = req.params.command;
    const options = req.query;

    const result = await CommandManager.execute(command, options);
    res.status(result.success ? 200 : 404).json(result);
})

export default router;
