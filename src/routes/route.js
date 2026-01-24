import { Router } from 'express'
import userRouter from './user.js'
import recordRouter from './record.js'
import demonsRouter from './demon.js'
import thumbnailsRouter from './thumbnails.js'
import statsRouter from './stats.js'
import countryRouter from './country.js'

const route = Router()

route.use('/user', userRouter)
route.use('/record', recordRouter)
route.use('/demon', demonsRouter)
route.use('/thumbnail', thumbnailsRouter)
route.use('/stats', statsRouter)
route.use('/country', countryRouter)

export default route
