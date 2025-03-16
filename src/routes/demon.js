import { Router } from 'express';
import { DemonCreate, DemonListUpdate, GetDemonById, GetDemonsList } from '../controllers/demon.js';
import { authenticate } from '../middlewares/authenticate.js'

const demonsRouter = Router();

demonsRouter.post('/', authenticate, DemonCreate)
demonsRouter.patch('/', authenticate, DemonListUpdate)
demonsRouter.get('/listed', GetDemonsList)
demonsRouter.get('/:id', GetDemonById)

export default demonsRouter