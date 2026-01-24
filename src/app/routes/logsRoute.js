import { Router } from 'express'
import { authenticate } from './../middlewares/authenticate.js'
import { GetByQuery } from '../services/logsService.js'

const logRoute = Router()

logRoute.get('/search', authenticate, GetByQuery)

export default logRoute
