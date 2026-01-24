import { Router } from 'express'
import { authenticate } from './../middlewares/authenticate.js'
import {
	Create,
	Delete,
	GetByID,
	GetByQuery,
	Update
} from '../services/demonsService.js'

const demonRoute = Router()

demonRoute.post('/create', authenticate, Create)
demonRoute.patch('/update', authenticate, Update)
demonRoute.get('/search/:id', GetByID)
demonRoute.get('/search', GetByQuery)
demonRoute.delete('/delete', authenticate, Delete)

export default demonRoute
