import mongoose from 'mongoose'
import { connection, AutoIncrement } from '../../utils/database.js'

const demonSchema = new mongoose.Schema(
	{
		_id: { type: Number, require: true },
		name: { type: String, require: true },
		place: { type: Number, require: true },
		holder: { type: String, require: true },
		verifier: { type: String, require: true },
		creator: { type: String, require: true },
		video: { type: String, require: true },
		score: { type: Number, default: 0 },
		thumbnail: { type: String },
		createdAt: { type: Date, default: Date.now }
	},
	{ versionKey: false, _id: false }
)

demonSchema.plugin(AutoIncrement, { id: 'demon', inc_field: '_id' })

demonSchema.methods.calculateScore = function () {
	let score = 0
	const place = this.place

	switch (true) {
		case place <= 1:
			score = 1000
			break
		case place <= 8:
			score = 1000 - (place - 1) * 40
			break
		case place <= 10:
			score = 1000 - (place - 1) * 60
			break
		case place <= 20:
			score = 600 - (place - 10) * 20
			break
		case place <= 50:
			score = 400 - (place - 20) * 4
			break
		case place <= 75:
			score = 280 - (place - 50) * 8
			break
		case place <= 150:
			score = 80 - (place - 75)
			break
		case place <= 250:
			score = 5 - Math.floor((place - 150) / 10) * 0.4
			break
		default:
			score = 0.01
	}

	return Math.max(score, 0.01)
}

export default connection.model('Demon', demonSchema)
