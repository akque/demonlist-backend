import mongoose from 'mongoose'
import { connection, AutoIncrement } from '../../utils/database.js'

const recordSchema = new mongoose.Schema(
	{
		_id: { type: Number, require: true },
		percent: { type: Number, default: 100 },
		video: { type: String, require: true },
		status: { type: Number, require: true, default: 0 },
		demon_id: { type: Number, require: true },
		user_id: { type: Number, require: true },
		raw_footage: { type: String, require: false },
		note: { type: String, require: false },
		reason: { type: String, default: '' },
		createdAt: { type: Date, default: Date.now }
	},
	{ versionKey: false, _id: false }
)

recordSchema.plugin(AutoIncrement, { id: 'record', inc_field: '_id' })

export default connection.model('Record', recordSchema)

// STATUS
// 0 = submitted
// 1 = approved
// 2 = rejected
