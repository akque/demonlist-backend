import Nationality from '../model/nationality.js'
import User from '../model/user.js'
import jwt from 'jsonwebtoken'

export const NationalityCreate = async (req, res, next) => {
  try {
    const { nation, country_code } = req.body

    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user = await User.findById(payload.id)
    if (user.permissions < 2) return res.status(403).send({ error: 'No permissions to do this' })

    if (country_code.length != 2) return res.status(400).send({ error: 'Country code must be 2 symbols length' })

    const nationality = await Nationality.create({ nation, country_code })
    if (!nationality) return res.status(400).send({ error: 'Internal error' })

    return res.status(200).send({ data: nationality, message: 'Nationality created successfully' })
  } catch (error) {
    next(error)
  }
}

export const NationalitySet = async (req, res, next) => {
  try {
    const { id, country_code } = req.body

    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user_admin = await User.findById(payload.id)
    if (user_admin.permissions < 2) return res.status(403).send({ error: 'No permissions to do this' })
    
    const nationality = await Nationality.findOne({ country_code: country_code })
    if (!nationality) return res.status(404).send({ error: 'Invalid country code' })

    const user = await User.findById(id)
    if (!user) return res.status(404).send({ error: 'User not found' })

    user.nationality = nationality.toObject()
    await user.save()

    return res.status(200).send({ data: user, message: `${user} nationality set to ${nationality.nation}` })
  } catch (error) {
    next(error)
  }
}

export const NationalityGetAll = async (req, res, next) => {
  try {
    const nationalities = await Nationality.find({})
    if (!nationalities) return res.status(404).send({ error: 'No nationalities found' })
    return res.status(200).send({ data: nationalities })
  } catch (error) {
    next(error)
  }
}