import { Router } from 'express';
import CommandManager from '../..';

import shortlinkRouter from './routes/shortlinkRouter';
const router = Router();

router.use("/l", shortlinkRouter)

router.get('/api/:command', async (req, res) => {
    const command = req.params.command;
    const options = req.query;

    const result = await CommandManager.execute(command, options);
    res.status(result.success ? 200 : 404).json(result);
})

export default router;
