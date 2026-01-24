import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../model/user.js'

dotenv.config()

export async function PermissionsCheck(req, res, next) {
	try {
		const { authorization } = req.headers
		const token = authorization.replace('Bearer ', '')
		const payload = jwt.verify(token, process.env.PRIVATE_KEY)
		if (!payload) throw new Error('Invalid token')
		const user = await User.findById(payload.id)
		if (user.permissions < 2) throw new Error('Unauthorized')
		next()
	} catch (error) {
		res
			.status(403)
			.send({ error: 'Insufficient permissions to perform this action' })
	}
}
