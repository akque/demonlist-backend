import User from '../model/user.js'
import Record from '../model/record.js'
import Demon from '../model/demon.js'
import { updatePlayerPlaces } from './stats.js'

export const RecordSubmit = async (req, res, next) => {
  try {
    const { raw_footage, demon_id, video, percent, description } = req.body

    const user = await User.findById(req.user)
    if (!user) return res.status(404).send({ error: 'User not found' })
    const demon = await Demon.findById(demon_id)
    if (!demon) return res.status(404).send({ error: 'Demon not found' })

    if(percent < demon.minimal_percent) return res.status(400).send('Percent is lower than demon list percent')
    
    const record = await Record.create({ percent, raw_footage, demon_id, demon_name: demon.name, demon_holder: demon.holder, description, video, user_submitter_id: user._id, user_submitter_name: user.username })
    if (!record) return res.status(400).send({ error: 'Failed to create record' })
    const profileRecord = await Record.findById(record._id).select('-raw_footage')
    user.records.push(profileRecord.toObject())
    await user.save()

    return res.status(200).send({ data: record, message: 'New record submitted successfully' })
  } catch (error) {
    next(error)
  }
}

export const RecordUpdateStatus = async (req, res, next) => {
  try {
    const { status, id } = req.body

    if (status !== 2 && status !== 3) {
      return res.status(400).send({ error: 'Invalid status' })
    }

    const userAdmin = await User.findById(req.user)
    if (userAdmin.role < 1) return res.status(403).send({ error: 'Insufficient permissions to perform this action' })

    const record = await Record.findById(id)
    if (!record) return res.status(404).send({ error: 'Record not found' })

    record.record_status = status
    await record.save()

    const userTarget = await User.findById(record.user_submitter_id)
    const records = userTarget.records
    
    records.forEach(async (i) => {
      if (i._id == id) {
        i.record_status = status
        userTarget.markModified('records')
        await userTarget.save()
      }
    })

    const demon = await Demon.findById(record.demon_id)
    const profileRecord = await Record.findById(record._id).select('-raw_footage')

    const existingRecord = await Record.findOne({
      user_submitter_id: record.user_submitter_id,
      demon_id: record.demon_id,
      percent: { $lt: 100 }
    })

    if (record.percent == 100) {
      if (existingRecord) {
        userTarget.score -= demon.score/2
        userTarget.score += demon.score
        await userTarget.save()
      } else {
        userTarget.score += demon.score
        await userTarget.save()
      }
    } else {
      if (!existingRecord) {
        userTarget.score += demon.score/2
      }
    }

    if (!demon.records.some(r => r.demon_id === profileRecord.demon_id && r.user_submitter_id === profileRecord.user_submitter_id)) {
      demon.records.push(profileRecord.toObject())
      await demon.save()
    } else {
      demon.records.forEach(async (r) => {
        if (r.demon_id === profileRecord.demon_id && r.user_submitter_id === profileRecord.user_submitter_id) {
          r.percent = percent
          demon.markModified('records')
          await demon.save()
        }
      })
    }

    await updatePlayerPlaces()

    return res.status(200).send({ data: record, message: `Record status set to ${status}` })
  } catch (error) {
    next(error)
  }
}

export const RecordDelete = async (req, res, next) => {
  try {
    const { id } = req.body

    const userAdmin = await User.findById(req.user)
    if (userAdmin.permissions < 1) return res.status(403).send({ error: 'Insufficient permissions to perform this action' })

    const record = await Record.findById(id)
    if (!record) return res.status(404).send({ error: 'Record not found' })
    const userTarget = await User.findById(record.user_submitter_id)
    if (userTarget) return res.status(404).send({ error: 'User not found' })
    const demon = await Demon.findById(record.demon_id)
    if (!demon) return res.status(404).send({ error: 'Demon not found' })

    userTarget.records = userTarget.records.filter((i) => i._id != id)
    await user_holder.save()

    demon.records = demon.records.filter((i) => i._id != id)
    await demon.save()

    await record.deleteOne()

    return res.status(200).send({ message: 'Record deleted successfully' })
  } catch(error) {
    next(error)
  }
}

export const RecordList = async (req, res, next) => {
  try {
    const userAdmin = await User.findById(req.user)
    if (userAdmin.permissions < 1) return res.status(403).send({ error: 'Insufficient permissions to perform this action' })

    const records = await Record.find(filter).sort({ createdAt: -1 })

    return res.status(200).send({ data: records, message: 'Record list retrieved successfully' })
  } catch (error) {
    next(error)
  }
}