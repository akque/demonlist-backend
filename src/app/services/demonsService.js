import Demon from '../models/demonModel.js'
import User from '../models/userModel.js'
import Record from '../models/recordModel.js'
import Log from '../models/logModel.js'
import History from '../models/historyModel.js'
import { updatePlayerPlaces } from './statsService.js'

console.log('Demons service loaded')

export const Create = async (req, res) => {
	try {
		const { name, holder, verifier, creator, video, place, thumbnail } =
			req.body

		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 2)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const demons = await Demon.find({}).sort({ place: 1 })

		const demonsEnd = await Demon.find({}).sort({ place: -1 })
		if (demonsEnd.length > 0) {
			if (place < 1 || place > demonsEnd[0].place + 1)
				return res
					.status(400)
					.send({
						message: `Place must be between 1 and ${demonsEnd[0].place + 1}`,
						success: false
					})
		}

		const demon = await Demon.create({
			name,
			holder,
			verifier,
			creator,
			video,
			place,
			thumbnail
		})

		await History.create({
			demon_id: demon._id,
			change: 'added',
			new_place: demon.place,
			reason: `Added to the list`
		})

		demons.forEach(async d => {
			if (d.place >= place) {
				const oldScore = d.calculateScore()
				d.place += 1
				d.score = d.calculateScore()
				await d.save()

				await History.create({
					demon_id: d._id,
					change: 'down',
					new_place: d.place,
					reason: `${demon.name} was added above`
				})

				const records = await Record.find({ demon_id: d._id })

				if (records) {
					records.forEach(async r => {
						const userTarget = await User.findById(r.user_id)
						if (userTarget) {
							userTarget.score -= oldScore
							userTarget.score += d.score
							await userTarget.save()
						}
					})
				}
			}
		})

		demon.score = demon.calculateScore()
		await demon.save()

		await updatePlayerPlaces()

		await Log.create({
			action: 'demon.create',
			description: `Created new demon ${demon.name} (#${demon.place})`,
			userId: userAdmin._id,
			username: userAdmin.username
		})

		return res
			.status(200)
			.send({
				message: 'Demon created successfully',
				data: demon,
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const Update = async (req, res) => {
	try {
		const { id, place } = req.body

		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 2)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const demon = await Demon.findById(id)
		if (!demon) return res.status(404).send({ error: 'Demon not found' })

		const demons = await Demon.find({}).sort({ place: 1 })

		const demonsEnd = await Demon.find({}).sort({ place: -1 })
		if (place < 1 || place > demonsEnd[0].place)
			return res
				.status(400)
				.send({
					message: `Place must be between 1 and ${demonsEnd[0].place}`,
					success: false
				})

		const oldPlace = demon.place
		const oldScore = demon.calculateScore()
		demon.place = place
		demon.score = demon.calculateScore()
		await demon.save()

		await History.create({
			demon_id: demon._id,
			change: oldPlace > place ? 'up' : 'down',
			new_place: demon.place,
			reason: `Moved`
		})

		const records = await Record.find({ demon_id: id })

		if (records) {
			records.forEach(async r => {
				const userTarget = await User.findById(r.user_id)
				if (userTarget) {
					userTarget.score -= oldScore
					userTarget.score += demon.score
					await userTarget.save()
				}
			})
		}

		demons.forEach(async d => {
			if (d._id !== id) {
				if (oldPlace > place) {
					if (d.place >= place && d.place < oldPlace) {
						const oldScore = d.calculateScore()
						d.place += 1
						d.score = d.calculateScore()
						await d.save()

						await History.create({
							demon_id: d._id,
							change: 'down',
							new_place: d.place,
							reason: `${demon} was moved up past this demon`
						})

						const records = await Record.find({ demon_id: d._id })

						if (records) {
							records.forEach(async r => {
								const userTarget = await User.findById(r.user_id)
								if (userTarget) {
									userTarget.score -= oldScore
									userTarget.score += d.score
									await userTarget.save()
								}
							})
						}
					}
				} else {
					if (d.place <= place && d.place > oldPlace) {
						const oldScore = d.calculateScore()
						d.place -= 1
						d.score = d.calculateScore()
						await d.save()

						await History.create({
							demon_id: d._id,
							change: 'up',
							new_place: d.place,
							reason: `${demon} was moved down past this demon`
						})

						const records = await Record.find({ demon_id: d._id })

						if (records) {
							records.forEach(async r => {
								const userTarget = await User.findById(r.user_id)
								if (userTarget) {
									userTarget.score -= oldScore
									userTarget.score += d.score
									await userTarget.save()
								}
							})
						}
					}
				}
			}
		})

		const demonsNewList = await Demon.find({}).sort({ place: 1 })

		await updatePlayerPlaces()

		await Log.create({
			action: 'demon.update',
			description: `Updated demon ${demon.name} (#${demon.place})`,
			userId: userAdmin._id,
			username: userAdmin.username
		})

		return res
			.status(200)
			.send({
				message: 'Demonlist updated successfully',
				data: demonsNewList,
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const GetByID = async (req, res) => {
	try {
		const { id } = req.params

		const demon = await Demon.findById(id)
		if (!demon)
			return res
				.status(404)
				.send({ message: 'Demon not found', success: false })

		const records = await Record.find({ demon_id: id, status: 1 })
			.sort({ created_at: 1 })
			.select('-raw_footage -note -reason -status')
		const history = await History.find({ demon_id: id }).sort({ created_at: 1 })

		const formattedRecords = await Promise.all(
			records.map(async r => {
				const user = await User.findById(r.user_id)
				return {
					...r._doc,
					user_username: user?.username,
					user_display_name: user?.display_name
				}
			})
		)

		return res
			.status(200)
			.send({
				data: { demon, records: formattedRecords, history },
				message: 'Demon retrieved successfully',
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const GetByQuery = async (req, res) => {
	try {
		const { query } = req.query

		let demons

		if (query) {
			demons = await Demon.find({
				name: { $regex: query, $options: 'i' }
			}).sort({ place: 1 })
		} else {
			demons = await Demon.find({}).sort({ place: 1 })
		}

		return res
			.status(200)
			.send({
				data: demons,
				message: 'Demonlist retrieved successfully',
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}

export const Delete = async (req, res) => {
	try {
		const { id } = req.body

		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 2)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const demon = await Demon.findById(id)
		if (!demon)
			return res
				.status(404)
				.send({ message: 'Demon not found', success: false })

		const demonScore = demon.score
		const demonPlace = demon.place
		const demonName = demon.name

		const records = await Record.find({ demon_id: id })

		for (const record of records) {
			const user = await User.findById(record.user_id)
			if (user) {
				user.score -= demonScore
				await user.save()
			}
		}

		await Record.deleteMany({ demon_id: id })
		await Demon.findByIdAndDelete(id)

		const demons = await Demon.find({ place: { $gt: demonPlace } }).sort({
			place: 1
		})

		for (const d of demons) {
			const oldScore = d.score
			d.place -= 1
			d.score = d.calculateScore()
			await d.save()

			await History.create({
				demon_id: demon._id,
				change: 'up',
				new_place: place - 1,
				reason: `${demonName} was deleted`
			})

			const demonRecords = await Record.find({ demon_id: d._id })

			for (const record of demonRecords) {
				const user = await User.findById(record.user_id)
				if (user) {
					user.score -= oldScore
					user.score += d.score
				}
			}
		}

		await updatePlayerPlaces()

		await Log.create({
			action: 'demon.delete',
			description: `Deleted demon ${demonName} (#${demonPlace})`,
			userId: userAdmin._id,
			username: userAdmin.username
		})

		return res
			.status(200)
			.send({
				message:
					'Demon deleted, records updated, and user scores adjusted correctly',
				success: true
			})
	} catch (error) {
		return res.status(500).send({ message: error.message, success: false })
	}
}
