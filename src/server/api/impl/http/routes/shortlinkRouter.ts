import { Router } from 'express';
import Core from '../../../../core';
import { Shortlink } from '../../../../../database/entities/shortlink.entity';
const shortlinkRouter = Router();

shortlinkRouter.get('/:id', async (req, res) => {
    const id = req.params.id;

    const link = await Promise.race([
        Core.database.services.shortlink.findOne({ id }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
    ]).catch(() => null) as Shortlink;

    if (!link) {
        res.status(404).json({ error: "Not found" });
        return;
    }

    res.redirect(link.url)
    link.visits++;

    if (link.uses > 0) {
        link.uses--;
    }

    link.lastUsed = new Date();
})

export default shortlinkRouter;
