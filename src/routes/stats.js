import { Router } from 'express'
import {
	getTopPlayers,
	getTopCountries,
	getPlayersInCountry
} from '../controllers/stats.js'

const statsRouter = Router()

statsRouter.get('/players', getTopPlayers)
statsRouter.get('/countries', getTopCountries)
statsRouter.get('/players/:country', getPlayersInCountry)

export default statsRouter
