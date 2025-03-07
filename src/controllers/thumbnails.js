import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

export const ThumbnailUpload = (req, res, next) => {
  try {
    return res.send({ message: 'Thumbnail uploaded successfully' })
  } catch (e) {
    next(e)
  }
}

export const ThumbnailGet = (req, res, next) => {
  try {
    const id = req.params.filename
    return res.sendFile(path.join(__dirname, `../uploads/${id}`));
  } catch (e) {
    next(e)
  }
}