import { Router } from 'express';
import { RecordSubmit, RecordUpdateStatus, RecordDelete, RecordList } from '../controllers/record.js'
import { authenticate } from '../middlewares/authenticate.js'

const recordRouter = Router();

recordRouter.post('/', authenticate, RecordSubmit)
recordRouter.patch('/', authenticate, RecordUpdateStatus)
recordRouter.delete('/', authenticate, RecordDelete)
recordRouter.get('/', authenticate, RecordList)

export default recordRouter