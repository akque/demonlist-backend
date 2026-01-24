import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

export function authenticate(req, res, next) {
	try {
		const token = req.cookies?.token
		if (!token)
			return res
				.status(401)
				.send({ message: 'Log in to perform this action', success: false })

		const payload = jwt.verify(token, process.env.JWT_SECRET)
		if (!payload)
			return res
				.status(401)
				.send({ message: 'Log in to perform this action', success: false })

		req.user = payload.id
		next()
	} catch (error) {
		return res.status(401).send({ message: error, success: false })
	}
}
