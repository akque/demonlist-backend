import Demon from '../model/demon.js'
import User from '../model/user.js'
import jwt from 'jsonwebtoken'

export const DemonCreate = async (req, res, next) => {
  try {
    const { name, position, video, level_id, thumbnail, verifier, publisher } = req.body

    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user = await User.findById(payload.id)
    if (user.permissions < 2) res.status(403).send({ error: 'No permissions to do this' })

    const demons = await Demon.find({})
    if (!demons) return res.status(404).send({ error: 'Demons list not found' })

    const demon = await Demon.create({ name, position, video, level_id, thumbnail, verifier, publisher })
    if (!demon) return res.status(400).send({ error: 'Internal error' })

    const result = await Promise.all(demons.map(async (_, i) => {
      if(demons[i].position >= position) {
            demons[i].position += 1
            await demons[i].save()
        }
        return demons[i]
    }))

    result.push(demon)
    result.sort((min, max) => min.position - max.position)

    return res.status(200).send({ data: { list: result, demon: demon }, message: 'New demon created' })
  } catch(error) {
    next(error)
  }
}

export const DemonListUpdate = async (req, res, next) => {
  try {
    const { id, position } = req.body

    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user = await User.findById(payload.id)
    if (user.permissions < 2) res.status(403).send({ error: 'No permissions to do this' })

    const demon = await Demon.findById(id)
    if (!demon) return res.status(404).send({ error: 'Demon not found' })

    const oldPosition = demon.position
    demon.position = position
    await demon.save()

    const demons = await Demon.find({})
    if (!demon) return res.status(404).send({ error: 'Demon not found' })

    const result = await Promise.all(demons.map(async (i) => {
      if (i._id != id) {
        if (oldPosition > position) {
          if(i.position >= position && i.position < oldPosition) {
            i.position += 1
            await i.save()
          }
        } else {
          if(i.position <= position && i.position > oldPosition) {
            i.position -= 1
            await i.save()
          }
        }
      }
      return i
    }))

    result.sort((min, max) => min.position - max.position)

    return res.status(200).send({ data: result, message: 'List updated' })
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
    const demons = await Demon.find({}).sort({ position: 1 })
    if (!demons) return res.status(404).send({ error: 'Demon list not found' })

    return res.status(200).send({ data: demons })
  } catch (error) {
    next(error)
  }  
}