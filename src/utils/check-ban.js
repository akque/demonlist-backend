import { schedule } from 'node-cron'
import Log from '../app/models/logModel.js'
import User from '../app/models/userModel.js'

console.log('Cron job started')

schedule('5 0 * * *', () => CheckBan())

export const CheckBan = async () => {
	const bannedUsers = await User.find({
		banned: true,
		ban_expire: {
			$ne: null,
			$gt: new Date()
		}
	})

	if (bannedUsers.length > 0) {
		bannedUsers.forEach(async u => {
			u.banned = false
			u.ban_expire = null
			await u.save()
			await Log.create({
				action: 'user.unban',
				description: `Unbanned user ${u.username}`,
				userId: null,
				username: 'System'
			})
		})
	}
}
