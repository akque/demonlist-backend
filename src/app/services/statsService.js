import User from '../models/userModel.js'
import Record from '../models/recordModel.js'
import Demon from '../models/demonModel.js'

console.log('Stats service loaded')

export const GetPlayers = async (req, res, next) => {
	try {
		const { query, page = 1, limit = 50 } = req.query
		const skip = (page - 1) * limit

		const filter = query
			? {
					username: new RegExp(query, 'i'),
					place: { $ne: null },
					banned: false
				}
			: { place: { $ne: null }, banned: false }

		const players = await User.find(filter)
			.sort({ score: -1 })
			.select('username score place display_name _id')
			.skip(skip)
			.limit(Number(limit))
			.exec()

		const totalPlayers = players.length

		return res
			.status(200)
			.send({
				data: { players, pages: Math.ceil(totalPlayers / limit) },
				message: 'Top players retrieved successfully',
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const GetByID = async (req, res) => {
	try {
		const { id } = req.params

		const user = await User.findById(id).select('-password')
		if (!user)
			return res.status(404).send({ message: 'User not found', success: false })

		const validRecords = await Record.find({ user_id: id, status: 1 })

		const list = await Demon.find({
			_id: validRecords.map(r => r.demon_id)
		}).sort({ place: 1 })
		return res
			.status(200)
			.send({
				message: 'User retrieved successfully',
				data: { user, list },
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const updatePlayerPlaces = async () => {
	try {
		const users = await User.find({}).sort({ score: -1 })

		for (let i = 0; i < users.length; i++) {
			users[i].place = i + 1
			await users[i].save()
		}
	} catch (error) {
		console.error('Failed to update player places: ', error)
	}
}
