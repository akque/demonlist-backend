import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export function authenticate(req, res, next) {
	try {
		const { authorization } = req.headers
		const token = authorization.replace('Bearer ', '')
		const payload = jwt.verify(token, process.env.PRIVATE_KEY)
		if (!payload) throw new Error('Invalid or expired token')

		req.user = payload.id
		next()
	} catch (error) {
		return res.status(403).json({ error: 'Invalid or expired token' })
	}
}
