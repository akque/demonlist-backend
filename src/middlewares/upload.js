import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/thumbnails')
  },
  filename: function (req, file, cb) {
    const { id } = req.body
    cb(null, id)
  }
})

export const upload = multer({ storage: storage })