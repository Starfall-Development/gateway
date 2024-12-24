import { Router, static as static_ } from 'express';
import { resolve } from 'path';
import CommandManager from '../../index.js';

import authRouter from './routes/authRouter.js';
import panelRouter from '../../../../modules/panel/router/panelRouter.js';
const router = Router();


router.use("/_", static_(resolve("../index/dist/_/")))
router.use("/auth", authRouter)

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
