import { Router, static as static_ } from 'express';
import { resolve } from 'path';
import CommandManager from '../..';

import shortlinkRouter from './routes/shortlinkRouter';
import authRouter from './routes/authRouter';
const router = Router();


router.use("/assets", static_(resolve("../index/dist/assets/")))
router.use("/auth", authRouter)
router.use("/l", shortlinkRouter)

router.get('/', (req, res) => {
    res.sendFile(resolve("../index/dist/index.html"));
})

router.get('/me', (req, res) => {
    res.redirect("/#run_about")
})

router.get('/api/:command', async (req, res) => {
    const command = req.params.command;
    const options = req.query;

    const result = await CommandManager.execute(command, options);
    res.status(result.success ? 200 : 404).json(result);
})

export default router;
