import { Router } from "express";
import { ThumbnailUpload, ThumbnailGet } from '../controllers/thumbnails.js'
import { upload } from '../middlewares/upload.js'
import { PermissionsCheck } from "../middlewares/permissions.js";
 
const thumbnailsRouter = Router();

thumbnailsRouter.post('/upload', PermissionsCheck, upload.single('avatar'), ThumbnailUpload)
thumbnailsRouter.get('/:id', ThumbnailGet);

export default thumbnailsRouter