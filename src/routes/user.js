import { Router } from 'express';
import { UserAuthMe, UserGetById, UserLogin, UserRegister } from '../controllers/user.js';
import { authenticate } from '../middlewares/authenticate.js'

const userRouter = Router();

userRouter.post('/register', UserRegister)
userRouter.post('/login', UserLogin)
userRouter.get('/auth/me', authenticate, UserAuthMe)
userRouter.get('/:id', UserGetById)

export default userRouter