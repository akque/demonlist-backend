import { Router } from 'express';
import userRouter from './user.js';
import recordRouter from './record.js';
import demonsRouter from './demon.js';
import thumbnailsRouter from './thumbnails.js'

const route = Router();

route.use('/users', userRouter)
route.use('/record', recordRouter)
route.use('/demons', demonsRouter)
route.use('/thumbnails', thumbnailsRouter)

export default route