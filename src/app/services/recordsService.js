import Demon from '../models/demonModel.js'
import User from '../models/userModel.js'
import Record from '../models/recordModel.js'
import Log from '../models/logModel.js'
import { updatePlayerPlaces } from './statsService.js'

console.log('Records service loaded')

export const Submit = async (req, res) => {
	try {
		const { raw_footage, demon_id, video, note } = req.body

		const user = await User.findById(req.user)
		if (!user)
			return res.status(404).send({ message: 'User not found', success: false })
		const demon = await Demon.findById(demon_id)
		if (!demon)
			return res
				.status(404)
				.send({ message: 'Demon not found', success: false })

		if (video.length > 500)
			return res
				.status(400)
				.send({
					message: 'Video maximum length is 500 symbols',
					success: false
				})
		if (note.length > 1000)
			return res
				.status(400)
				.send({
					message: 'Note maximum length is 1000 symbols',
					success: false
				})
		if (raw_footage.length > 500)
			return res
				.status(400)
				.send({
					message: 'Raw footage maximum length is 500 symbols',
					success: false
				})

		const youtubeRegex =
			/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}/
		const footageRegex =
			/^https:\/\/(drive\.google\.com\/file\/d\/|disk\.yandex\.(ru|com)\/.+)$/

		if (!youtubeRegex.test(video))
			return res
				.status(400)
				.send({ message: 'Video must be a valid YouTube link', success: false })
		if (raw_footage && !footageRegex.test(raw_footage))
			return res
				.status(400)
				.send({
					message:
						'Raw footage must be a valid Google Drive or Yandex Disk link',
					success: false
				})

		if (user.banned)
			return res.status(403).send({ message: 'You cannot submit a record' })

		const existingRecord = await Record.findOne({ user_id: user._id, demon_id })
		if (existingRecord)
			return res
				.status(400)
				.send({
					message: 'You have already submitted a record for this demon',
					success: false
				})

		await Record.create({
			user_id: user._id,
			demon_id,
			video,
			note,
			raw_footage
		})

		await Log.create({
			action: 'record.submit',
			description: `Submitted record on ${demon.name} (100%)`,
			userId: user._id,
			username: user.username
		})

		await updatePlayerPlaces()

		return res
			.status(200)
			.send({ message: 'Record submitted successfully', success: true })
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const Update = async (req, res) => {
	try {
		const { status, id, reason } = req.body

		if (status !== 1 && status !== 2)
			return res.status(400).send({ message: 'Invalid status', success: false })

		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 1)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const record = await Record.findById(id)
		if (!record)
			return res
				.status(404)
				.send({ message: 'Record not found', success: false })

		record.status = status
		if (reason) record.reason = reason
		await record.save()

		const demon = await Demon.findById(record.demon_id)

		if (record.status === 0) {
			if (status === 1) {
				userTarget.score += demon.score
				await userTarget.save()
			}
		} else {
			if (status === 1) {
				userTarget.score += demon.score
				await userTarget.save()
			} else {
				userTarget.score -= demon.score
				await userTarget.save()
			}
		}

		await updatePlayerPlaces()

		await Log.create({
			action: 'record.update',
			description: `${status === 1 ? 'Approved' : 'Rejected'} record of ${userTarget.username} on ${demon.name}`,
			userId: userAdmin._id,
			username: userAdmin.username
		})

		return res
			.status(200)
			.send({ message: `Record status set to ${status}`, success: true })
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const Delete = async (req, res) => {
	try {
		const { id } = req.body

		const userReq = await User.findById(req.user)
		if (!userReq)
			return res.status(404).send({ message: 'User not found', success: false })
		const record = await Record.findById(id)
		if (!record)
			return res
				.status(404)
				.send({ message: 'Record not found', success: false })
		const userTarget = await User.findById(record.user_id)
		if (!userTarget)
			return res.status(404).send({ message: 'User not found', success: false })
		const demon = await Demon.findById(record.demon_id)
		if (!demon)
			return res
				.status(404)
				.send({ message: 'Demon not found', success: false })

		if (userReq._id === record.user_id) {
			if (record.status !== 1) {
				if (userReq.role < 1)
					return res
						.status(403)
						.send({
							message: 'Insufficient permissions to perform this action',
							success: false
						})
			}
		} else {
			if (userReq.role < 1)
				return res
					.status(403)
					.send({
						message: 'Insufficient permissions to perform this action',
						success: false
					})
		}

		if (record.status == 1) {
			userTarget.score -= demon.score
			await userTarget.save()
		}

		await record.deleteOne()

		await updatePlayerPlaces()

		await Log.create({
			action: 'record.delete',
			description: `Deleted record of ${userTarget.username} on ${demon.name}`,
			userId: userReq._id,
			username: userReq.username
		})

		return res.status(200).send({ message: 'Record deleted successfully' })
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const GetAll = async (req, res) => {
	try {
		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 1)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const { status = 0, page = 1, limit = 25 } = req.query

		const allowedStatuses = ['0', '1', '2', '3']
		if (!allowedStatuses.includes(status))
			return res.status(400).send({ message: 'Invalid status', success: false })

		const query = {}
		if (status !== '3') {
			query.status = parseInt(status)
		}

		const skip = (parseInt(page) - 1) * parseInt(limit)

		const records = await Record.find(query)
			.sort({ createdAt: 1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate('demon_id', 'name holder')
			.populate('user_id', 'username')

		const formattedRecords = records.map(record => ({
			...record.toObject(),
			user_username: record.user_id.username,
			demon_name: record.demon_id.name,
			demon_holder: record.demon_id.holder
		}))

		const totalRecords = formattedRecords.length

		return res
			.status(200)
			.send({
				data: {
					records: formattedRecords,
					pages: Math.ceil(totalRecords / limit)
				},
				message: 'Records retrieved successfully',
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const CreateApproved = async (req, res) => {
	try {
		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 2)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const { user_id, demon_id, video } = req.body

		const youtubeRegex =
			/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}/

		if (!youtubeRegex.test(video))
			return res
				.status(400)
				.send({ message: 'Video must be a valid YouTube link', success: false })

		const user = await User.findById(user_id)
		if (!user)
			return res.status(404).send({ message: 'User not found', success: false })
		const demon = await Demon.findById(demon_id)
		if (!demon)
			return res
				.status(404)
				.send({ message: 'Demon not found', success: false })

		const record = await Record.create({ user_id, demon_id, video })

		await Log.create({
			action: 'record.created',
			description: `Created record on ${demon.name} for player ${user.username} (100%)`,
			userId: userAdmin._id,
			username: userAdmin.username
		})

		return res
			.status(200)
			.send({
				data: record,
				message: 'Record created successfully',
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}
