import User from '../models/userModel.js'
import Log from '../models/logModel.js'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import dayjs from 'dayjs'
import { hash, verify } from 'argon2'
import { updatePlayerPlaces } from './statsService.js'

console.log('Users service loaded')

export const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: {
		message: 'Too many login attempts. Please try again later.',
		success: false
	}
})

export const Register = async (req, res) => {
	try {
		const { username, password } = req.body

		const usernameRegex = /^[a-zA-Z0-9_]{1,40}$/
		if (!usernameRegex.test(username))
			return res
				.status(400)
				.send({
					message:
						'Username must be 1-40 characters long and contain only letters, numbers, and underscores',
					success: false
				})

		if (password.length < 8)
			return res
				.status(400)
				.send({
					message: 'Password must be at least 8 characters long',
					success: false
				})

		const existingUser = await User.findOne({ username })
		if (existingUser)
			return res
				.status(400)
				.send({ message: 'Username is already in use', success: false })

		const user = await User.create({ username, password: await hash(password) })

		await Log.create({
			action: 'user.register',
			description: 'Registered new account',
			userId: user._id,
			username: user.username
		})

		return res
			.status(201)
			.send({ message: 'Account registered successfully', success: true })
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const Login = [
	loginLimiter,
	async (req, res) => {
		try {
			const { username, password } = req.body
			const user = await User.findOne({ username })
			if (!user) {
				return res
					.status(404)
					.send({ message: 'User not found', success: false })
			}

			if (user.banned) {
				if (user.ban_expire === null) {
					return res
						.status(400)
						.send({
							message: 'Your account is permanently banned',
							success: false
						})
				} else {
					return res
						.status(400)
						.send({
							message: 'Your account is temporarily banned',
							success: false
						})
				}
			}

			const isMatch = verify(user.password, password)
			if (!isMatch) {
				return res
					.status(403)
					.send({ message: 'Incorrect password', success: false })
			}

			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
				expiresIn: '30d'
			})

			res.cookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'Lax',
				maxAge: 30 * 24 * 60 * 60 * 1000
			})

			return res
				.status(200)
				.send({ message: 'Login successful', success: true })
		} catch (error) {
			return res.status(500).send({ message: error.message, success: false })
		}
	}
]

export const Authenticate = async (req, res) => {
	try {
		const user = await User.findById(req.user).select('-password')
		if (!user)
			return res.status(404).send({ message: 'User not found', success: false })

		return res.status(200).send({ data: user, success: true })
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const GetByID = async (req, res) => {
	try {
		const adminUser = await User.findById(req.user)
		if (!adminUser || adminUser.role < 1)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const { id } = req.params

		const user = await User.findById(id).select('-password')
		if (!user)
			return res.status(404).send({ message: 'User not found', success: false })

		return res
			.status(200)
			.send({
				message: 'User retrieved successfully',
				data: user,
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const GetByQuery = async (req, res) => {
	try {
		const adminUser = await User.findById(req.user)
		if (!adminUser || adminUser.role < 1)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const { query } = req.query
		let users

		if (query) {
			users = await User.find({
				username: { $regex: query, $options: 'i' }
			}).select('-password')
		} else {
			users = await User.find({}).select('-password')
		}

		return res
			.status(200)
			.send({
				message: 'Users retrieved successfully',
				data: users,
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const Update = async (req, res) => {
	const results = []
	const { id, months, permanent, reason, role, youtube, display_name, reject } =
		req.body

	try {
		const reqUser = await User.findById(req.user)
		const targetUser = await User.findById(id)
		if (!targetUser) {
			return res.status(404).send({ message: 'User not found', success: false })
		}

		// Ban logic
		if (months !== undefined || permanent !== undefined) {
			try {
				if (reqUser.role < 1) throw new Error('Insufficient permissions to ban')
				if (targetUser.role >= reqUser.role)
					throw new Error('You cannot ban this user')

				targetUser.banned = permanent || (months && months > 0) || false
				targetUser.ban_expire = permanent
					? null
					: months > 0
						? dayjs().add(months, 'month').toDate()
						: null
				targetUser.ban_reason = reason || ''

				if (targetUser.banned) {
					if (reject) {
						const records = await Record.find({ user_id: targetUser._id })
						for (const record of records) {
							record.status = 2
							await record.save()
						}
						targetUser.score = 0
					}
				}

				await updatePlayerPlaces()

				await Log.create({
					action: targetUser.banned ? 'user.ban' : 'user.unban',
					description: targetUser.banned
						? `Banned user ${targetUser.username} ${permanent ? 'permanently' : `for ${months} month(s)`} for ${reason || 'no reason'}`
						: `Unbanned user ${targetUser.username}`,
					userId: reqUser._id,
					username: reqUser.username
				})

				results.push({ action: 'ban', success: true })
			} catch (error) {
				results.push({ action: 'ban', success: false, error: error.message })
			}
		}

		// Role logic
		if (role !== undefined) {
			try {
				if (reqUser.role < 3)
					throw new Error('Insufficient permissions to update role')
				targetUser.role = role

				await Log.create({
					action: 'user.update',
					description: `Updated user ${targetUser.username}`,
					userId: reqUser._id,
					username: reqUser.username
				})

				results.push({ action: 'role', success: true })
			} catch (error) {
				results.push({ action: 'role', success: false, error: error.message })
			}
		}

		// YouTube logic
		if (youtube !== undefined) {
			try {
				if (reqUser._id !== targetUser._id) {
					throw new Error('Insufficient permissions to update YouTube link')
				}

				if (youtube === '') {
					targetUser.youtube = ''
				} else {
					const youtubeRegex =
						/^(https:\/\/(www\.)?(youtu\.be\/[a-zA-Z0-9_-]+|youtube\.com\/(channel|c|@)[\/a-zA-Z0-9_-]+))(\?.*)?$/
					if (!youtubeRegex.test(youtube)) {
						throw new Error('Invalid YouTube channel link format')
					}
					targetUser.youtube = youtube
				}

				await Log.create({
					action: 'user.update',
					description: `Updated YouTube for user ${targetUser.username}`,
					userId: reqUser._id,
					username: reqUser.username
				})

				results.push({ action: 'youtube', success: true })
			} catch (error) {
				results.push({
					action: 'youtube',
					success: false,
					error: error.message
				})
			}
		}

		// Display name logic
		if (display_name !== undefined) {
			try {
				if (reqUser._id !== targetUser._id) {
					throw new Error('Insufficient permissions to update display name')
				}

				targetUser.display_name =
					display_name === reqUser.username ? '' : display_name

				await Log.create({
					action: 'user.update',
					description: `Updated display name for user ${targetUser.username}`,
					userId: reqUser._id,
					username: reqUser.username
				})

				results.push({ action: 'display_name', success: true })
			} catch (error) {
				results.push({
					action: 'display_name',
					success: false,
					error: error.message
				})
			}
		}

		// Save user if any changes
		try {
			await targetUser.save()
		} catch (error) {
			results.push({ action: 'save', success: false, error: error.message })
		}

		const updatedUser = await User.findById(id).select('-password')
		return res.status(200).send({
			message: 'Profile updated successfully',
			data: updatedUser,
			success: results.every(r => r.success)
		})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const Logout = async (req, res) => {
	try {
		res.clearCookie('token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Lax'
		})

		return res.status(200).send({ message: 'Logout successful', success: true })
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}
