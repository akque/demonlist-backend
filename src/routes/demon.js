import { Router } from 'express';
import { DemonCreate, DemonListUpdate, GetDemonById, GetDemonsByQuery, GetDemonsList } from '../controllers/demon.js';
import { authenticate } from '../middlewares/authenticate.js'

const demonsRouter = Router();

demonsRouter.post('/', authenticate, DemonCreate)
demonsRouter.patch('/', authenticate, DemonListUpdate)
demonsRouter.get('/listed', GetDemonsList)
demonsRouter.get('/search/:id', GetDemonById)
demonsRouter.get('/search', GetDemonsByQuery)

export default demonsRouter