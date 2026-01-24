import mongoose from 'mongoose'
import { connection, AutoIncrement } from '../../utils/database.js'

const userSchema = new mongoose.Schema(
	{
		_id: { type: Number, require: true },
		username: { type: String, require: true, unique: true },
		password: { type: String, require: true },
		role: { type: Number, default: 0 },
		place: { type: Number, default: null },
		score: { type: Number, default: 0 },
		ban_expire: { type: Date, default: null },
		banned: { type: Boolean, default: false },
		ban_reason: { type: String, default: '' },
		youtube: { type: String, default: '' },
		display_name: { type: String, default: '' },
		created_at: { type: Date, default: Date.now }
	},
	{ versionKey: false, _id: false }
)

userSchema.plugin(AutoIncrement, { id: 'user', inc_field: '_id' })

export default connection.model('User', userSchema)

// ROLES
// 0 = user
// 1 = helper
// 2 = editor
// 3 = administator
