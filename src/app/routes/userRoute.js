import { Router } from 'express'
import {
	Authenticate,
	GetByID,
	GetByQuery,
	Login,
	Logout,
	Register,
	Update
} from '../services/usersService.js'
import { authenticate } from './../middlewares/authenticate.js'

const userRoute = Router()

userRoute.post('/register', Register)
userRoute.post('/login', Login)
userRoute.post('/auth', authenticate, Authenticate)
userRoute.get('/search/:id', authenticate, GetByID)
userRoute.get('/search', authenticate, GetByQuery)
userRoute.patch('/update', authenticate, Update)
userRoute.post('/logout', authenticate, Logout)

export default userRoute
