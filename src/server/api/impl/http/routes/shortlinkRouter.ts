import { Router } from 'express';
import Core from '../../../../core';
const shortlinkRouter = Router();

shortlinkRouter.get('/:id', async (req, res) => {
    const id = req.params.id;

    const link = await Core.database.services.shortlink.findOne({ id })

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
