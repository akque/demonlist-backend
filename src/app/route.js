import { Router } from "express";
import userRoute from "./routes/userRoute.js";
import demonRoute from "./routes/demonRoute.js";
import recordRoute from './routes/recordRoute.js';
import statsRoute from './routes/statsRoute.js';
import logRoute from './routes/logsRoute.js';

const route = Router();

route.use('/users', userRoute)
route.use('/demons', demonRoute)
route.use('/records', recordRoute)
route.use('/stats', statsRoute)
route.use('/logs', logRoute)

export default route;