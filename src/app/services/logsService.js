import Log from '../models/logModel.js'

console.log('Logs service loaded')

export const GetByQuery = async (req, res) => {
	try {
		const userAdmin = await User.findById(req.user)
		if (userAdmin.role < 1)
			return res
				.status(403)
				.send({
					message: 'Insufficient permissions to perform this action',
					success: false
				})

		const { query, page = 1, limit = 25 } = req.query
		const skip = (page - 1) * limit

		let logs

		if (query) {
			logs = await Log.find({
				$or: [
					{ username: { $regex: query, $options: 'i' } },
					{ description: { $regex: query, $options: 'i' } }
				]
			})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
		} else {
			logs = await Log.find({}).skip(skip).limit(limit).sort({ createdAt: -1 })
		}

		const totalLogs = logs.length

		return res
			.status(200)
			.send({
				data: { logs, pages: Math.ceil(totalLogs / limit) },
				message: 'Logs retrieved successfully',
				success: true
			})
	} catch (error) {
		res.status(500).send({ message: error.message, success: false })
	}
}
