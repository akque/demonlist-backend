import { Router } from 'express';
import { DemonCreate, DemonListUpdate, GetDemonById, GetDemonsList } from '../controllers/demon.js';

const demonsRouter = Router();

demonsRouter.post('/create', DemonCreate)
demonsRouter.patch('/update', DemonListUpdate)
demonsRouter.get('/listed', GetDemonsList)
demonsRouter.get('/:id', GetDemonById)

export default demonsRouter