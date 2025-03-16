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
    const id = req.params.id
    return res.sendFile(path.join(__dirname, `../images/thumbnails/${id}`));
  } catch (e) {
    next(e)
  }
}