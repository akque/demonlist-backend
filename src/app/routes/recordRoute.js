import { Router } from 'express'
import { authenticate } from './../middlewares/authenticate.js'
import {
	CreateApproved,
	Delete,
	GetAll,
	Submit,
	Update
} from '../services/recordsService.js'

const recordRoute = Router()

recordRoute.post('/submit', authenticate, Submit)
recordRoute.patch('/update', authenticate, Update)
recordRoute.delete('/delete', authenticate, Delete)
recordRoute.get('/search', authenticate, GetAll)
recordRoute.post('/create', authenticate, CreateApproved)

export default recordRoute
