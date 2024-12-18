import { Router } from 'express';
import authRouter from './authRouter.js';
const panelRouter = Router();

panelRouter.use("/auth", authRouter)

export default panelRouter;