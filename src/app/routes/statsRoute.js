import { Router } from 'express'
import { GetByID, GetPlayers } from '../services/statsService.js'

const statsRoute = Router()

statsRoute.get('/list', GetPlayers)
statsRoute.get('/player/:id', GetByID)

export default statsRoute
