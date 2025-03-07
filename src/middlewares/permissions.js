import jwt from 'jsonwebtoken'
import User from '../model/user.js'

export async function PermissionsCheck (req, res, next) {
  try {
    const { authorization } = req.headers
    if(!authorization) throw new Error('No token provided')

    const token = authorization.replace('Bearer ', '')
    if(!token) throw new Error('No token provided')

    const payload = jwt.verify(token, 'secret')
    if(!payload) throw new Error('Invalid token')

    const user = await User.findById(payload.id)
    if(user.permissions <= 1) throw new Error('Unauthorized')

    next()
  } catch (error) {
    next(error)
  }
}