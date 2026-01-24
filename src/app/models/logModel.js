import mongoose from 'mongoose'
import { connection, AutoIncrement } from '../../utils/database.js'

const logSchema = new mongoose.Schema(
	{
		_id: { type: Number },
		action: { type: String },
		description: { type: String },
		userId: { type: Number },
		username: { type: String },
		created_at: { type: Date, default: Date.now }
	},
	{ versionKey: false, _id: false }
)

logSchema.plugin(AutoIncrement, { id: 'log', inc_field: '_id' })

export default connection.model('Log', logSchema)
