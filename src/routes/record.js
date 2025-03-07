import { Router } from 'express';
import { Auth } from '../middlewares/auth.js';
import { RecordSubmit, RecordUpdateStatus, RecordDelete } from '../controllers/record.js'

const recordRouter = Router();

recordRouter.post('/submit', RecordSubmit)
recordRouter.patch('/update', RecordUpdateStatus)
recordRouter.delete('/delete', RecordDelete)

export default recordRouter