import jwt from 'jsonwebtoken'

export function Auth (req, res, next) {
  try {
    const { authorization } = req.headers
    if(!authorization) throw new Error('No token provided')

    const token = authorization.replace('Bearer ', '')
    if(!token) throw new Error('No token provided')

    const payload = jwt.verify(token, 'secret')
    if(!payload) throw new Error('Invalid token')

    next()
  } catch (error) {
    next(error)
  }
}