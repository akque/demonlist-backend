import mongoose from 'mongoose'
import { connection, AutoIncrement } from '../db.js'

const userSchema = new mongoose.Schema(
	{
		_id: { type: Number, require: true },
		username: { type: String, require: true, unique: true },
		password: { type: String, require: true },
		role: { type: Number, default: 0 }, // 0 = user, 1 = exposer, 2 = moderator, 3 = elder moderator,
		place: { type: Number, default: null },
		score: { type: Number, default: 0 },
		ban_expire: { type: Date, default: null },
		banned: { type: Boolean, default: false },
		records: { type: Array, default: [] },
		createdAt: { type: Date, default: Date.now }
	},
	{ versionKey: false, _id: false }
)

userSchema.plugin(AutoIncrement, { id: 'user', inc_field: '_id' })

export default connection.model('User', userSchema)
