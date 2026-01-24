import multer from 'multer'

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './src/images/thumbnails')
	},
	filename: function (req, file, cb) {
		const { id } = req.params
		cb(null, file.originalname)
	}
})

export const upload = multer({ storage: storage })
