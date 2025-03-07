import User from '../model/user.js'
import Record from '../model/record.js'
import Demon from '../model/demon.js'
import jwt from 'jsonwebtoken'

export const RecordSubmit = async (req, res, next) => {
  try {
    const { raw_footage, demon_id, video, progress } = req.body

    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user_id = payload.id

    const user = await User.findById(user_id)
    if (!user) return res.status(404).send({ error: 'User not found' })

    const demon = await Demon.findById(demon_id)
    if (!demon) return res.status(404).send({ error: 'Demon not found' })

    const record = await Record.create({ progress, video, demon: demon.toObject(), user_holder: user.toObject(), raw_footage })
    if (!record) return res.status(400).send({ error: 'Failed to create record' })
    user.records.push(record)
    await user.save()

    return res.status(200).send({ data: record, message: 'New record submitted successfully' })
  } catch (error) {
    next(error)
  }
}

export const RecordUpdateStatus = async (req, res, next) => {
  try {
    const { status, id } = req.body

    if (status != 'approved') {
      if (status != 'rejected') {
        return res.status(400).send({ error: 'Invalid status' })
      } 
    }

    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user = await User.findById(payload.id)
    if (user.permissions === 0) res.status(403).send({ error: 'No permissions to do this' })

    const record = await Record.findById(id)
    if (!record) return res.status(404).send({ error: 'Record not found' })

    record.record_status = status
    await record.save()

    const user_holder = await User.findById(record.user_holder)
    const records = user_holder.records
    records.map(async (_, i) => {
      if(records[i]._id == id) {
        records[i].record_status = status
        await records[i].save()
      }
      return records[i]
    })
    
    return res.status(200).send({ data: { record: record, user: user_holder }, message: `Record status set to ${status}` })
  } catch(error) {
    next(error)
  }
}

export const RecordDelete = async (req, res, next) => {
  try {
    const { id } = req.body

    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user = await User.findById(payload.id)
    if (user.permissions == 0) return res.status(403).send({ error: 'No permissions to do this' })

    const record = await Record.findById(id)
    if (!record) return res.status(404).send({ error: 'Record not found' })

    const user_holder = await User.findById(record.user_holder)
    if (!user_holder) return res.status(404).send({ error: 'User not found' })

    user_holder.records = user_holder.records.filter((i) => i._id != id)
    await user_holder.save()

    await record.deleteOne()

    return res.status(200).send({ message: 'Record deleted successfully' })
  } catch(error) {
    next(error)
  }
}