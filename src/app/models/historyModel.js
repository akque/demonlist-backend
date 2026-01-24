import mongoose from 'mongoose'
import { connection, AutoIncrement } from '../../utils/database.js'

const historySchema = new mongoose.Schema(
	{
		_id: { type: Number },
		demon_id: { type: Number },
		change: { type: String },
		new_place: { type: Number },
		reason: { type: String },
		created_at: { type: Date, default: Date.now }
	},
	{ versionKey: false, _id: false }
)

historySchema.plugin(AutoIncrement, { id: 'history', inc_field: '_id' })

export default connection.model('History', historySchema)

// CHANGE
// up
// down
