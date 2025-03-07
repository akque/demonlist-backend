import { Router } from 'express';
import { NationalityCreate, NationalityGetAll, NationalitySet } from '../controllers/nationality';

const nationalitiesRouter = Router();

nationalitiesRouter.post('/create', NationalityCreate)
nationalitiesRouter.post('/set', NationalitySet)
nationalitiesRouter.get('/listed', NationalityGetAll)

export default nationalitiesRouter