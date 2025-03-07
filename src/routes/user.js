import { Router } from 'express';
import { UserGet, UserLogin, UserRegister } from '../controllers/user.js';

const userRouter = Router();

userRouter.post('/register', UserRegister)
userRouter.get('/login', UserLogin)
userRouter.get('/auth/me', UserGet)

export default userRouter