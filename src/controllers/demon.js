import Demon from '../model/demon.js'
import User from '../model/user.js'
import Record from '../model/record.js'
import { updatePlayerPlaces } from './stats.js'

export const DemonCreate = async (req, res, next) => {
	try {
		const {
			name,
			holder,
			place,
			verifier,
			creator,
			video,
			level_id,
			minimal_percent,
			length,
			objects,
			version,
			description
		} = req.body

		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 2)
			return res
				.status(403)
				.send({ error: 'Insufficient permissions to perform this action' })

		const demons = await Demon.find({}).sort({ place: 1 })

		const demonsEnd = await Demon.find({}).sort({ place: -1 })
		if (place < 1 || place > demonsEnd[0].place + 1)
			return res
				.status(400)
				.send({
					error: `Place must be between 1 and ${demonsEnd[0].place + 1}`
				})

		const demon = await Demon.create({
			name,
			holder,
			length,
			objects,
			version,
			place,
			verifier,
			creator,
			video,
			level_id,
			minimal_percent,
			description
		})
		if (!demon) return res.status(400).send({ error: 'Internal error' })

		demons.forEach(async d => {
			if (d.place >= place) {
				const oldScore = d.calculateScore()
				d.place += 1
				d.score = d.calculateScore()
				await d.save()

				const records = await Record.find({ demon_id: d._id })

				if (records) {
					records.forEach(async r => {
						const userTarget = await User.findById(r.user_submitter_id)
						if (userTarget) {
							userTarget.score -= oldScore
							userTarget.score += d.score
							await userTarget.save()
						}
					})
				}
				S
			}
		})

		demon.score = demon.calculateScore()
		await demon.save()
		const demonsNewList = await Demon.find({}).sort({ place: 1 })

		await updatePlayerPlaces()

		return res
			.status(200)
			.send({
				data: { list: demonsNewList, demon: demon },
				message: 'New demon created'
			})
	} catch (error) {
		next(error)
	}
}

export const DemonListUpdate = async (req, res, next) => {
	try {
		const { id, place } = req.body

		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 2)
			res
				.status(403)
				.send({ error: 'Insufficient permissions to perform this action' })

		const demon = await Demon.findById(id)
		if (!demon) return res.status(404).send({ error: 'Demon not found' })

		const demons = await Demon.find({}).sort({ place: 1 })

		const demonsEnd = await Demon.find({}).sort({ place: -1 })
		if (place < 1 || place > demonsEnd[0].place + 1)
			return res
				.status(400)
				.send({
					error: `Place must be between 1 and ${demonsEnd[0].place + 1}`
				})

		const oldPlace = demon.place
		const oldScore = demon.calculateScore()
		demon.place = place
		demon.score = demon.calculateScore()
		await demon.save()

		const records = await Record.find({ demon_id: id })

		if (records) {
			records.forEach(async r => {
				const userTarget = await User.findById(r.user_submitter_id)
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

						const records = await Record.find({ demon_id: d._id })

						if (records) {
							records.forEach(async r => {
								const userTarget = await User.findById(r.user_submitter_id)
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

						const records = await Record.find({ demon_id: d._id })

						if (records) {
							records.forEach(async r => {
								const userTarget = await User.findById(r.user_submitter_id)
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

		return res
			.status(200)
			.send({ data: demonsNewList, message: 'List updated' })
	} catch (error) {
		next(error)
	}
}

export const GetDemonById = async (req, res, next) => {
	try {
		const { id } = req.params

		const demon = await Demon.findById(id)
		if (!demon) return res.status(404).send({ error: 'Demon not found' })

		return res.status(200).send({ data: demon })
	} catch (error) {
		next(error)
	}
}

export const GetDemonsList = async (req, res, next) => {
	try {
		const demons = await Demon.find({}).sort({ place: 1 })
		if (!demons) return res.status(404).send({ error: 'Internal error' })

		return res
			.status(200)
			.send({ data: demons, message: 'Demon list retrieved successfully' })
	} catch (error) {
		next(error)
	}
}

export const GetDemonsByQuery = async (req, res, next) => {
	try {
		const { query } = req.query
		let demons

		if (query) {
			demons = await Demon.find({
				name: { $regex: query, $options: 'i' }
			}).sort({ place: 1 })
		} else {
			demons = await Demon.find().sort({ place: 1 })
		}

		return res
			.status(200)
			.send({ data: demons, message: 'Demons found successfully' })
	} catch (error) {
		next(error)
	}
}
